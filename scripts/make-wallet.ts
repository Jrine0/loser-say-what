/**
 * Generate a new Stellar keypair for escrow use.
 * Run once: npx ts-node scripts/make-wallet.ts
 * Then save the output to your .env.local
 */

import { Keypair } from "stellar-sdk";

const keypair = Keypair.random();

console.log("=== DEBTIFY Stellar Escrow Wallet ===");
console.log("");
console.log("STELLAR_ESCROW_SECRET=" + keypair.secret());
console.log("NEXT_PUBLIC_STELLAR_ESCROW_PUBLIC_KEY=" + keypair.publicKey());
console.log("");
console.log("Add both lines to your .env.local file.");
console.log("Fund this wallet on testnet: https://laboratory.stellar.org/#account-creator?network=test");
