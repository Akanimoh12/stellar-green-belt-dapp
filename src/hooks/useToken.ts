import { useState, useCallback, useEffect } from 'react';
import { getSvtTokenInfo, getSvtBalance, getRewardInfo } from '../services/contract';
import { SvtTokenInfo, RewardInfo, AppError, AppErrorType } from '../types';

export function useToken(publicKey: string | null) {
  const [tokenInfo, setTokenInfo] = useState<SvtTokenInfo | null>(null);
  const [svtBalance, setSvtBalance] = useState<number>(0);
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [info, reward] = await Promise.all([
        getSvtTokenInfo(),
        getRewardInfo(),
      ]);
      setTokenInfo(info);
      setRewardInfo(reward);

      if (publicKey) {
        const bal = await getSvtBalance(publicKey);
        setSvtBalance(bal);
      }
    } catch (err: any) {
      setError(
        err.type
          ? (err as AppError)
          : { type: AppErrorType.NETWORK_ERROR, message: err.message || 'Failed to load token data' }
      );
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { tokenInfo, svtBalance, rewardInfo, loading, error, refetch: fetch };
}
