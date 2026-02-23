export const NETWORK = {
  name: 'Testnet',
  url: 'https://horizon-testnet.stellar.org',
  passphrase: 'Test SDF Network ; September 2015',
  friendbotUrl: 'https://friendbot.stellar.org',
  sorobanUrl: 'https://soroban-testnet.stellar.org',
};

// ── Deployed contracts on Stellar Testnet (Green Belt) ──

// Vault contract — handles deposits, withdrawals, timelocks + inter-contract SVT minting
export const CONTRACT_ID = 'CB4WTU6F45BHCEQBBBS7P5RXEFWD5ELMO3XTWEGDRVV3NS5DDZF6QBSN';

// SVT reward token contract — custom token minted by vault on deposit
export const SVT_TOKEN_ID = 'CABSDKREP4SBIHCIAOPSL2O5DL575N44ZAAUNFXUV2YN7UYSOX5AONWX';

// Admin / deployer public key
export const VAULT_ADMIN = 'GDHQ6TNWZ4V2JVCDWEUVW7YKFBXCOQZRRUCT27LAKES3PGOE6JSZMSMD';

// Native XLM SAC (Stellar Asset Contract) on testnet
export const TOKEN_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

// Reward rate: 500 basis points = 5% SVT per XLM deposited
export const REWARD_RATE_BPS = 500;

// Set to true after deploying & initializing the contracts
export const CONTRACT_DEPLOYED = true;
