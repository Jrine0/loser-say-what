import { NextRequest, NextResponse } from "next/server";
import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  SorobanRpc,
  TransactionBuilder,
} from "stellar-sdk";
import {
  getSorobanRpcUrl,
  getStellarNetworkConfig,
  isValidStellarPublicKey,
  xlmToStroops,
} from "@/lib/stellar";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * POST /api/stake
 * Body: { amountXLM: number, goalId: string, userId: string, userWallet: string }
 *
 * Builds an unsigned Soroban contract invocation (stake) XDR.
 * The client signs with Freighter and submits via /api/confirm-stake.
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

    const contractId = process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID;
    if (!contractId) {
      console.error("[API /api/stake] NEXT_PUBLIC_SOROBAN_CONTRACT_ID not set");
      return NextResponse.json({ error: "Contract not configured" }, { status: 500 });
    }

    const networkConfig = getStellarNetworkConfig();
    const rpcServer = new SorobanRpc.Server(getSorobanRpcUrl());
    const sourceAccount = await rpcServer.getAccount(userWallet);

    const contract = new Contract(contractId);
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: networkConfig.networkPassphrase,
    })
      .addOperation(
        contract.call(
          "stake",
          new Address(userWallet).toScVal(),
          nativeToScVal(goalId, { type: "string" }),
          nativeToScVal(xlmToStroops(amountXLM), { type: "i128" }),
        )
      )
      .setTimeout(180)
      .build();

    const simResponse = await rpcServer.simulateTransaction(transaction);
    if ("error" in simResponse) {
      console.error("[API /api/stake] Simulation failed:", simResponse.error);
      return NextResponse.json(
        { error: `Contract simulation failed: ${simResponse.error}` },
        { status: 500 }
      );
    }

    const preparedTx = SorobanRpc.assembleTransaction(transaction, simResponse).build();
    const transactionXdr = preparedTx.toXDR();

    console.log("[API /api/stake] Soroban stake XDR built successfully");

    return NextResponse.json({
      transactionXdr,
      network: networkConfig.networkPassphrase,
      message: `Stake ${amountXLM} XLM via contract`,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to build stake transaction");
    console.error("[API /api/stake] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
