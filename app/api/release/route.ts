import { NextRequest, NextResponse } from "next/server";
import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  nativeToScVal,
  SorobanRpc,
  TransactionBuilder,
} from "stellar-sdk";
import { getStake, updateStakeStatus } from "@/lib/stakes-store";
import {
  getSorobanRpcUrl,
  getStellarExplorerTxUrl,
  getStellarNetworkConfig,
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

    // Load admin (escrow) keypair — also the contract admin
    const escrowSecret = process.env.STELLAR_ESCROW_SECRET;
    if (!escrowSecret) {
      console.error("[API /api/release] STELLAR_ESCROW_SECRET not set");
      return NextResponse.json(
        { error: "Admin key not configured" },
        { status: 500 }
      );
    }

    const contractId = process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID;
    if (!contractId) {
      console.error("[API /api/release] NEXT_PUBLIC_SOROBAN_CONTRACT_ID not set");
      return NextResponse.json({ error: "Contract not configured" }, { status: 500 });
    }

    const adminKeypair = Keypair.fromSecret(escrowSecret);
    const networkConfig = getStellarNetworkConfig();
    const rpcServer = new SorobanRpc.Server(getSorobanRpcUrl());
    const adminAccount = await rpcServer.getAccount(adminKeypair.publicKey());

    const newStatus: "returned" | "donated" = pass ? "returned" : "donated";
    console.log(
      `[API /api/release] ${pass ? "PASS — returning" : "FAIL — donating"} ${stake.amountXLM} XLM`
    );

    const contract = new Contract(contractId);
    const transaction = new TransactionBuilder(adminAccount, {
      fee: BASE_FEE,
      networkPassphrase: networkConfig.networkPassphrase,
    })
      .addOperation(
        contract.call(
          "release",
          nativeToScVal(goalId, { type: "string" }),
          new Address(stake.userWallet).toScVal(),
          nativeToScVal(pass, { type: "bool" }),
        )
      )
      .setTimeout(180)
      .build();

    const simResponse = await rpcServer.simulateTransaction(transaction);
    if ("error" in simResponse) {
      console.error("[API /api/release] Simulation failed:", simResponse.error);
      return NextResponse.json(
        { error: `Contract simulation failed: ${simResponse.error}` },
        { status: 500 }
      );
    }

    const preparedTx = SorobanRpc.assembleTransaction(transaction, simResponse).build();
    preparedTx.sign(adminKeypair);

    console.log("[API /api/release] Submitting release transaction");
    const submitResult = await rpcServer.sendTransaction(preparedTx);
    if (submitResult.status === "ERROR") {
      console.error("[API /api/release] Submission error:", submitResult.errorResult);
      return NextResponse.json({ error: "Transaction submission failed" }, { status: 500 });
    }
    const txHash = submitResult.hash;

    console.log("[API /api/release] Transaction submitted:", txHash);

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
