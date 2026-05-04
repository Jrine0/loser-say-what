import { NextRequest, NextResponse } from "next/server";
import { SorobanRpc, TransactionBuilder } from "stellar-sdk";
import { saveStake } from "@/lib/stakes-store";
import { getSorobanRpcUrl, getStellarExplorerTxUrl, getStellarNetworkConfig } from "@/lib/stellar";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * POST /api/confirm-stake
 * Body: { signedXdr: string, goalId: string, userId: string, amountXLM: number, userWallet: string }
 *
 * Submits the signed Stellar transaction envelope and saves the stake record.
 */
export async function POST(req: NextRequest) {
  console.log("[API /api/confirm-stake] Received confirmation request");

  try {
    const { signedXdr, goalId, userId, amountXLM, userWallet } = await req.json();

    console.log("[API /api/confirm-stake] Params:", { goalId, userId, amountXLM });

    if (!signedXdr || !goalId || !userId || !amountXLM || !userWallet) {
      console.error("[API /api/confirm-stake] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const networkConfig = getStellarNetworkConfig();
    const rpcServer = new SorobanRpc.Server(getSorobanRpcUrl());
    const transaction = TransactionBuilder.fromXDR(
      signedXdr,
      networkConfig.networkPassphrase
    );
    const submitResult = await rpcServer.sendTransaction(transaction);
    if (submitResult.status === "ERROR") {
      console.error("[API /api/confirm-stake] Submission error:", submitResult.errorResult);
      return NextResponse.json({ error: "Transaction submission failed" }, { status: 500 });
    }
    const txHash = submitResult.hash;

    console.log("[API /api/confirm-stake] Transaction confirmed:", txHash);

    // Save to store
    saveStake({
      goalId,
      userId,
      amountXLM,
      txHash,
      userWallet,
      status: "locked",
      createdAt: Date.now(),
    });

    const explorerUrl = getStellarExplorerTxUrl(txHash);

    return NextResponse.json({
      txHash,
      explorerUrl,
      message: `${amountXLM} XLM staked successfully`,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to confirm stake");
    console.error("[API /api/confirm-stake] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
