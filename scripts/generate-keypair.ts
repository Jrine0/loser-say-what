import { Keypair } from "stellar-sdk";

const kp = Keypair.random();
console.log("STELLAR_ESCROW_SECRET=" + kp.secret());
console.log("NEXT_PUBLIC_STELLAR_ESCROW_PUBLIC_KEY=" + kp.publicKey());
