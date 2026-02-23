import React from 'react';
import { FiAward, FiRefreshCw, FiStar, FiTrendingUp, FiHash, FiBox } from 'react-icons/fi';
import { useWallet } from '../hooks/useWallet';
import { useToken } from '../hooks/useToken';
import { formatXLM, truncateAddress, Skeleton } from '../utils/helpers';
import { REWARD_RATE_BPS, SVT_TOKEN_ID } from '../config/network';

const TokenInfo: React.FC = () => {
  const { wallet } = useWallet();
  const { tokenInfo, svtBalance, rewardInfo, loading, error, refetch } = useToken(
    wallet?.publicKey || null
  );

  const rewardPct = rewardInfo ? (rewardInfo.rewardRate / 100).toFixed(1) : (REWARD_RATE_BPS / 100).toFixed(1);

  return (
    <div>
      <div className="card-header-row">
        <h2><FiAward size={18} /> SVT Reward Token</h2>
        <button className="btn btn-sm btn-outline" onClick={refetch} style={{ marginLeft: 'auto' }}>
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {error && <div className="error">{error.message}</div>}

      {/* Token stats grid */}
      <div className="token-stats">
        <div className="stat-card stat-card-accent">
          <div className="stat-icon"><FiStar size={20} /></div>
          {loading && !tokenInfo ? (
            <Skeleton width="60%" height="1.4rem" />
          ) : (
            <div className="stat-value">{tokenInfo?.symbol || 'SVT'}</div>
          )}
          <div className="stat-label">{tokenInfo?.name || 'StellarVault Token'}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FiTrendingUp size={20} /></div>
          {loading && !rewardInfo ? (
            <Skeleton width="50%" height="1.4rem" />
          ) : (
            <div className="stat-value">{rewardPct}%</div>
          )}
          <div className="stat-label">Reward Rate per Deposit</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FiBox size={20} /></div>
          {loading && !tokenInfo ? (
            <Skeleton width="50%" height="1.4rem" />
          ) : (
            <div className="stat-value">{tokenInfo ? formatXLM(tokenInfo.totalSupply) : '0.00'}</div>
          )}
          <div className="stat-label">Total SVT Minted</div>
        </div>
      </div>

      {/* User SVT balance */}
      {wallet ? (
        <div className="user-vault-card">
          <h3><FiAward size={16} /> Your SVT Balance</h3>
          <div className="uv-row">
            <span className="uv-label">Balance:</span>
            {loading ? (
              <Skeleton width="6rem" height="1rem" />
            ) : (
              <span className="uv-value svt-balance">{formatXLM(svtBalance)} SVT</span>
            )}
          </div>
          <div className="uv-row">
            <span className="uv-label">Wallet:</span>
            <span className="uv-value uv-mono">{truncateAddress(wallet.publicKey, 10)}</span>
          </div>
        </div>
      ) : (
        <p className="hint-text">Connect your wallet to view your SVT balance.</p>
      )}

      {/* Inter-contract explanation */}
      <div className="reward-explainer">
        <h3><FiHash size={16} /> How Rewards Work</h3>
        <ul className="info-list">
          <li>When you deposit XLM, the vault contract calls the SVT token contract</li>
          <li>The SVT token is automatically minted at {rewardPct}% of your deposit</li>
          <li>This is powered by Soroban <strong>inter-contract calls</strong></li>
          <li>SVT tokens represent your participation in the vault</li>
        </ul>
        <div className="contract-addresses">
          <div className="contract-addr-row">
            <span>Vault Contract:</span>
            <code>{truncateAddress('CB4WTU6F45BHCEQBBBS7P5RXEFWD5ELMO3XTWEGDRVV3NS5DDZF6QBSN', 10)}</code>
          </div>
          <div className="contract-addr-row">
            <span>SVT Token:</span>
            <code>{truncateAddress(SVT_TOKEN_ID, 10)}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;
