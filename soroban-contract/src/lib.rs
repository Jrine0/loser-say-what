#![no_std]

//! DEBTIFY Escrow Contract
//!
//! Holds XLM stakes on behalf of users for debt-accountability goals.
//!
//! Deploy steps (requires Rust + Soroban CLI):
//!   cargo build --target wasm32-unknown-unknown --release
//!   soroban contract deploy --wasm target/wasm32-unknown-unknown/release/debtify_escrow.wasm \
//!     --source <admin-secret> --network testnet
//!   soroban contract invoke --id <CONTRACT_ID> --source <admin-secret> --network testnet \
//!     -- init --admin <ADMIN_ADDRESS> --charity <CHARITY_ADDRESS> \
//!     --xlm_token $(soroban contract id asset --asset native --network testnet)
//!
//! Set NEXT_PUBLIC_SOROBAN_CONTRACT_ID in .env.local with the deployed contract ID.

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Admin,
    Charity,
    XlmToken,
    /// Keyed by (goal_id, user) -> locked amount in stroops
    Stake(String, Address),
}

#[contract]
pub struct DebtifyEscrow;

#[contractimpl]
impl DebtifyEscrow {
    /// Initialize the contract. Can only be called once.
    /// admin    — the server keypair that authorizes release calls
    /// charity  — destination wallet when a goal fails
    /// xlm_token — native XLM Stellar Asset Contract address
    pub fn init(env: Env, admin: Address, charity: Address, xlm_token: Address) {
        admin.require_auth();
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "already initialized"
        );
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Charity, &charity);
        env.storage().instance().set(&DataKey::XlmToken, &xlm_token);
    }

    /// Lock XLM from `user` into the contract for `goal_id`.
    /// Amount is in stroops (1 XLM = 10_000_000 stroops).
    /// The user must authorize this invocation (Freighter handles it automatically).
    pub fn stake(env: Env, user: Address, goal_id: String, amount: i128) {
        user.require_auth();
        assert!(amount > 0, "amount must be positive");

        let key = DataKey::Stake(goal_id, user.clone());
        assert!(
            !env.storage().persistent().has(&key),
            "stake already exists for this goal"
        );

        let xlm_token: Address = env.storage().instance().get(&DataKey::XlmToken).unwrap();
        let token_client = token::Client::new(&env, &xlm_token);
        // Transfer XLM from user into the contract. Requires user auth (above).
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        env.storage().persistent().set(&key, &amount);
    }

    /// Release the staked XLM for a goal. Admin-only.
    /// pass = true  → returns XLM to the user (goal achieved)
    /// pass = false → sends XLM to the charity wallet (goal failed)
    pub fn release(env: Env, goal_id: String, user: Address, pass: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let key = DataKey::Stake(goal_id, user.clone());
        let amount: i128 = env
            .storage()
            .persistent()
            .get(&key)
            .expect("no stake found for this goal/user");

        let xlm_token: Address = env.storage().instance().get(&DataKey::XlmToken).unwrap();
        let charity: Address = env.storage().instance().get(&DataKey::Charity).unwrap();
        let token_client = token::Client::new(&env, &xlm_token);

        let recipient = if pass { user } else { charity };
        token_client.transfer(&env.current_contract_address(), &recipient, &amount);

        env.storage().persistent().remove(&key);
    }

    /// Returns the locked amount in stroops for a goal/user pair, or 0 if none.
    pub fn get_stake(env: Env, goal_id: String, user: Address) -> i128 {
        let key = DataKey::Stake(goal_id, user);
        env.storage().persistent().get(&key).unwrap_or(0)
    }
}
