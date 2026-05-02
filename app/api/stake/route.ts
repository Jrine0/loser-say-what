import { NextRequest, NextResponse } from "next/server";
import { Asset, BASE_FEE, Horizon, Operation, TransactionBuilder } from "stellar-sdk";
import {
  formatXlmAmount,
  getStellarNetworkConfig,
  isValidStellarPublicKey,
} from "@/lib/stellar";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * POST /api/stake
 * Body: { amountXLM: number, goalId: string, userId: string, userWallet: string }
 *
 * Builds an unsigned Stellar payment from user -> escrow.
 * Returns an unsigned transaction envelope (XDR) for the client to sign.
 */
export async function POST(req: NextRequest) {
  console.log("[API /api/stake] Received stake request");

  try {
    const { amountXLM, goalId, userId, userWallet } = await req.json();

    console.log("[API /api/stake] Params:", { amountXLM, goalId, userId, userWallet });

    if (!amountXLM || !goalId || !userId || !userWallet) {
      console.error("[API /api/stake] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: amountXLM, goalId, userId, userWallet" },
        { status: 400 }
      );
    }

    if (amountXLM <= 0 || amountXLM > 5000) {
      console.error("[API /api/stake] Invalid amount:", amountXLM);
      return NextResponse.json(
        { error: "Amount must be between 0 and 5000 XLM" },
        { status: 400 }
      );
    }

    if (!isValidStellarPublicKey(userWallet)) {
      return NextResponse.json({ error: "Invalid Stellar source wallet" }, { status: 400 });
    }

    const escrowPublicKey = process.env.NEXT_PUBLIC_STELLAR_ESCROW_PUBLIC_KEY;
    if (!escrowPublicKey) {
      console.error("[API /api/stake] NEXT_PUBLIC_STELLAR_ESCROW_PUBLIC_KEY not set");
      return NextResponse.json(
        { error: "Escrow wallet not configured" },
        { status: 500 }
      );
    }

    if (!isValidStellarPublicKey(escrowPublicKey)) {
      return NextResponse.json(
        { error: "Escrow wallet is not a valid Stellar public key" },
        { status: 500 }
      );
    }

    const networkConfig = getStellarNetworkConfig();
    const server = new Horizon.Server(networkConfig.horizonUrl);
    const sourceAccount = await server.loadAccount(userWallet);

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: networkConfig.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: escrowPublicKey,
          asset: Asset.native(),
          amount: formatXlmAmount(amountXLM),
        })
      )
      .setTimeout(180)
      .build();

    const transactionXdr = transaction.toXDR();

    console.log("[API /api/stake] Unsigned XDR built successfully");

    return NextResponse.json({
      transactionXdr,
      network: networkConfig.network,
      message: `Transfer ${amountXLM} XLM to escrow`,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to build stake transaction envelope");
    console.error("[API /api/stake] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
