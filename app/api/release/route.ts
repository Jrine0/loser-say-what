import { NextRequest, NextResponse } from "next/server";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Operation,
  TransactionBuilder,
} from "stellar-sdk";
import { getStake, updateStakeStatus } from "@/lib/stakes-store";
import {
  formatXlmAmount,
  getStellarExplorerTxUrl,
  getStellarNetworkConfig,
  isValidStellarPublicKey,
} from "@/lib/stellar";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * POST /api/release
 * Body: { goalId: string, userId: string, pass: boolean }
 *
 * If pass: escrow → user wallet (full refund)
 * If fail: escrow → charity wallet (penalty donation)
 *
 * Signs with the Stellar escrow keypair server-side.
 */
export async function POST(req: NextRequest) {
  console.log("[API /api/release] Received release request");

  try {
    const { goalId, userId, pass } = await req.json();

    console.log("[API /api/release] Params:", { goalId, userId, pass });

    if (!goalId || !userId || typeof pass !== "boolean") {
      console.error("[API /api/release] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: goalId, userId, pass (boolean)" },
        { status: 400 }
      );
    }

    // Load stake from store
    const stake = getStake(goalId, userId);
    if (!stake) {
      console.error("[API /api/release] No stake found for", goalId, userId);
      return NextResponse.json(
        { error: "No active stake found for this goal" },
        { status: 404 }
      );
    }

    if (stake.status !== "locked") {
      console.error("[API /api/release] Stake already released:", stake.status);
      return NextResponse.json(
        { error: `Stake already ${stake.status}` },
        { status: 400 }
      );
    }

    // Load escrow keypair
    const escrowSecret = process.env.STELLAR_ESCROW_SECRET;
    if (!escrowSecret) {
      console.error("[API /api/release] STELLAR_ESCROW_SECRET not set");
      return NextResponse.json(
        { error: "Stellar escrow secret not configured" },
        { status: 500 }
      );
    }

    const escrowKeypair = Keypair.fromSecret(escrowSecret);

    // Determine recipient
    let recipientPublicKey: string;
    let newStatus: "returned" | "donated";

    if (pass) {
      // Return to user
      recipientPublicKey = stake.userWallet;
      newStatus = "returned";
      console.log("[API /api/release] PASS — returning XLM to user:", stake.userWallet);
    } else {
      // Donate to charity
      const charityWallet = process.env.STELLAR_CHARITY_PUBLIC_KEY;
      if (!charityWallet) {
        console.error("[API /api/release] STELLAR_CHARITY_PUBLIC_KEY not set");
        return NextResponse.json(
          { error: "Charity wallet not configured" },
          { status: 500 }
        );
      }
      recipientPublicKey = charityWallet;
      newStatus = "donated";
      console.log("[API /api/release] FAIL — donating XLM to charity:", charityWallet);
    }

    if (!isValidStellarPublicKey(recipientPublicKey)) {
      return NextResponse.json({ error: "Recipient wallet is invalid" }, { status: 500 });
    }

    const networkConfig = getStellarNetworkConfig();
    const server = new Horizon.Server(networkConfig.horizonUrl);
    const sourceAccount = await server.loadAccount(escrowKeypair.publicKey());

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: networkConfig.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: recipientPublicKey,
          asset: Asset.native(),
          amount: formatXlmAmount(stake.amountXLM),
        })
      )
      .setTimeout(180)
      .build();

    transaction.sign(escrowKeypair);

    console.log("[API /api/release] Sending release transaction:", stake.amountXLM, "XLM");

    const submitResult = await server.submitTransaction(transaction);
    const txHash = submitResult.hash;

    console.log("[API /api/release] Transaction confirmed:", txHash);

    // Update store
    updateStakeStatus(goalId, userId, newStatus);

    const explorerUrl = getStellarExplorerTxUrl(txHash);

    return NextResponse.json({
      txHash,
      explorerUrl,
      pass,
      message: pass
        ? `${stake.amountXLM} XLM returned to your wallet`
        : `${stake.amountXLM} XLM donated to charity`,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to release stake");
    console.error("[API /api/release] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
