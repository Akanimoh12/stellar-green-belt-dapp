#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String,
};

// ─── Storage keys ────────────────────────────────────────────
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Name,
    Symbol,
    Decimals,
    TotalSupply,
    Balance(Address),
    Allowance(Address, Address),  // (owner, spender)
    Minter,  // Vault contract that can mint reward tokens
}

#[contract]
pub struct SvtToken;

#[contractimpl]
impl SvtToken {
    /// Initialize the SVT token with metadata and an admin.
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);

        env.events().publish((symbol_short!("init"),), admin);
    }

    /// Set the minter address (vault contract) — admin only.
    /// This enables the vault to call `mint` via inter-contract call.
    pub fn set_minter(env: Env, minter: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        env.storage().instance().set(&DataKey::Minter, &minter);

        env.events().publish((symbol_short!("minter"),), minter);
    }

    /// Mint new SVT tokens to a recipient.
    /// Only callable by the registered minter (vault contract) or admin.
    /// When vault calls this via inter-contract call, minter.require_auth()
    /// passes automatically because the vault is the direct caller.
    pub fn mint(env: Env, to: Address, amount: i128) {
        if amount <= 0 {
            panic!("amount must be positive");
        }

        // Authorize: minter (vault) if set, otherwise admin
        let minter: Option<Address> = env.storage().instance().get(&DataKey::Minter);
        match minter {
            Some(m) => m.require_auth(),
            None => {
                let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
                admin.require_auth();
            }
        }

        let prev: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::Balance(to.clone()), &(prev + amount));

        let mut supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap();
        supply += amount;
        env.storage().instance().set(&DataKey::TotalSupply, &supply);

        env.events().publish((symbol_short!("mint"),), (to, amount, supply));
    }

    /// Transfer SVT tokens between accounts.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let from_bal: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);
        if from_bal < amount {
            panic!("insufficient balance");
        }

        env.storage()
            .instance()
            .set(&DataKey::Balance(from.clone()), &(from_bal - amount));

        let to_bal: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::Balance(to.clone()), &(to_bal + amount));

        env.events()
            .publish((symbol_short!("xfer"),), (from, to, amount));
    }

    /// Burn tokens from the caller's balance.
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let bal: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);
        if bal < amount {
            panic!("insufficient balance");
        }

        env.storage()
            .instance()
            .set(&DataKey::Balance(from.clone()), &(bal - amount));

        let mut supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap();
        supply -= amount;
        env.storage().instance().set(&DataKey::TotalSupply, &supply);

        env.events()
            .publish((symbol_short!("burn"),), (from, amount, supply));
    }

    // ─── Read-only queries ──────────────────────────────────

    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Balance(account))
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap()
    }

    pub fn get_minter(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Minter)
    }
}

#[cfg(test)]
mod test;
