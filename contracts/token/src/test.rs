#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_token(env: &Env) -> (Address, SvtTokenClient) {
    let admin = Address::generate(env);
    let contract_id = env.register_contract(None, SvtToken);
    let client = SvtTokenClient::new(env, &contract_id);

    client.initialize(
        &admin,
        &String::from_str(env, "StellarVault Token"),
        &String::from_str(env, "SVT"),
        &7u32,
    );

    (admin, client)
}

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_token(&env);

    assert_eq!(client.name(), String::from_str(&env, "StellarVault Token"));
    assert_eq!(client.symbol(), String::from_str(&env, "SVT"));
    assert_eq!(client.decimals(), 7u32);
    assert_eq!(client.total_supply(), 0i128);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, client) = setup_token(&env);
    client.initialize(
        &admin,
        &String::from_str(&env, "X"),
        &String::from_str(&env, "X"),
        &7u32,
    );
}

#[test]
fn test_mint_by_admin() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_token(&env);
    let user = Address::generate(&env);

    client.mint(&user, &1_000_000i128);

    assert_eq!(client.balance(&user), 1_000_000i128);
    assert_eq!(client.total_supply(), 1_000_000i128);
}

#[test]
fn test_set_minter_and_mint() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_token(&env);
    let vault = Address::generate(&env);
    let user = Address::generate(&env);

    // Set vault as minter
    client.set_minter(&vault);

    // Mint via minter
    client.mint(&user, &500_000i128);

    assert_eq!(client.balance(&user), 500_000i128);
    assert_eq!(client.total_supply(), 500_000i128);
}

#[test]
fn test_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_token(&env);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    client.mint(&alice, &1_000i128);
    client.transfer(&alice, &bob, &400i128);

    assert_eq!(client.balance(&alice), 600i128);
    assert_eq!(client.balance(&bob), 400i128);
    assert_eq!(client.total_supply(), 1_000i128); // supply unchanged
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_transfer_insufficient() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_token(&env);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    client.mint(&alice, &100i128);
    client.transfer(&alice, &bob, &200i128);
}

#[test]
fn test_burn() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_token(&env);
    let user = Address::generate(&env);

    client.mint(&user, &1_000i128);
    client.burn(&user, &300i128);

    assert_eq!(client.balance(&user), 700i128);
    assert_eq!(client.total_supply(), 700i128);
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_burn_insufficient() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_token(&env);
    let user = Address::generate(&env);

    client.mint(&user, &100i128);
    client.burn(&user, &200i128);
}

#[test]
fn test_multiple_mints_accumulate() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_token(&env);
    let user = Address::generate(&env);

    client.mint(&user, &100i128);
    client.mint(&user, &200i128);
    client.mint(&user, &300i128);

    assert_eq!(client.balance(&user), 600i128);
    assert_eq!(client.total_supply(), 600i128);
}

#[test]
fn test_get_minter() {
    let env = Env::default();
    env.mock_all_auths();
    let (_admin, client) = setup_token(&env);

    // No minter initially
    assert_eq!(client.get_minter(), None);

    // Set minter
    let vault = Address::generate(&env);
    client.set_minter(&vault);
    assert_eq!(client.get_minter(), Some(vault));
}
