import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useXenBox } from '../hooks/useXenBox';
import { useToastContext } from '../contexts/ToastContext';
import { utils } from '../const';

const Share = () => {
  const [isClaiming, setIsClaiming] = useState(false);

  const wallet = useWallet();
  const xenbox = useXenBox();
  const toast = useToastContext();

  const version = 1; // Share works with V1 tokens

  useEffect(() => {
    if (wallet.isConnected && xenbox.isInitialized) {
      xenbox.fetchShareData();
    }
  }, [wallet.isConnected, xenbox.isInitialized]);

  const handleClaimReward = async () => {
    if (isClaiming || xenbox.shareReward.eq(0)) return;
    
    setIsClaiming(true);
    try {
      await xenbox.claimShareReward();
      toast.showSuccess('领取成功', '邀请奖励已成功领取');
      
      // Refresh share data after claiming
      setTimeout(() => {
        xenbox.fetchShareData();
      }, 3000);
    } catch (error: any) {
      console.error('领取失败:', error);
      
      // Handle different types of errors
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.showWarning('交易已取消', '您取消了领取交易，可以随时重新尝试');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.showError('余额不足', '请检查您的账户余额和Gas费用设置');
      } else if (error.message?.includes('user rejected')) {
        toast.showWarning('交易被拒绝', '如需领取请重新尝试');
      } else {
        toast.showError('领取失败', error.reason || error.message || '未知错误，请重试');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const copyInviteLink = async () => {
    if (!wallet.address || !wallet.chainId) return;
    
    const inviteLink = `https://xenbox.33357.xyz/?c=${wallet.chainId}&r=${wallet.address}`;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.showSuccess('复制成功', '邀请链接已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.showError('复制失败', '请手动复制邀请链接');
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="share-container">
        <div className="empty-state">
          <div className="empty-icon">🎁</div>
          <h3 className="empty-title">请先连接钱包</h3>
          <p className="empty-text">连接钱包后即可查看您的邀请信息和奖励</p>
        </div>
        <style jsx>{`
          .share-container {
            max-width: 1200px;
            margin: 0 auto;
            animation: fadeIn 0.5s ease-out;
          }

          .empty-state {
            text-align: center;
            padding: var(--space-2xl);
            background: var(--glass-bg);
            border-radius: var(--radius-xl);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: var(--space-lg);
          }

          .empty-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: var(--space-sm);
          }

          .empty-text {
            color: var(--text-secondary);
            font-size: 1.125rem;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="share-container">
      <div className="share-header">
        <h2 className="share-title">邀请好友</h2>
        <p className="share-subtitle">分享您的邀请链接，获取丰厚奖励</p>
      </div>

      <div className="share-content">
        {/* Invite Link Section */}
        <div className="invite-section">
          <div className="section-header">
            <div className="section-icon">🔗</div>
            <h3 className="section-title">
              专属邀请链接{xenbox.shareReferFeePercent > 0 ? ` (${xenbox.shareReferFeePercent}%奖励)` : ''}
            </h3>
          </div>
            <div className="invite-link-container">
              <input
                type="text"
                value={`https://xenbox.33357.xyz/?c=${wallet.chainId}&r=${wallet.address}`}
                readOnly
                className="invite-link"
              />
              <button
                className="copy-button"
                onClick={copyInviteLink}
                title="复制邀请链接"
              >
                <span className="copy-icon">📋</span>
                <span className="copy-text">复制</span>
              </button>
            </div>
        </div>

        {/* Status and Rewards */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <span className="stat-label">邀请资格</span>
              <span className={`stat-value ${xenbox.shareIsRefer ? 'active' : 'inactive'}`}>
                {xenbox.shareIsRefer ? '已拥有' : '需要黄金宝箱'}
              </span>
              {!xenbox.shareIsRefer && (
                <span className="stat-description">打造一个黄金宝箱来获得邀请资格</span>
              )}
            </div>
          </div>

          <div className="stat-card reward-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-label">未领奖励</span>
              <div className="reward-info">
                <span className="reward-amount">
                  {utils.format.bigToString(xenbox.shareReward, 18, 0)} {xenbox.chainConfig?.xen || 'XEN'}
                </span>
                {xenbox.perEthAmount && !xenbox.perEthAmount.eq(0) && (
                  <span className="reward-eth">
                    ({utils.format.bigToString(
                      xenbox.shareReward.mul(utils.num.ether).div(xenbox.perEthAmount),
                      18,
                      6
                    )} {xenbox.chainConfig?.eth || 'ETH'})
                  </span>
                )}
              </div>
              <button
                className="claim-button"
                onClick={handleClaimReward}
                disabled={xenbox.shareReward.eq(0) || isClaiming}
              >
                <span className="button-icon">{isClaiming ? '⏳' : '🎁'}</span>
                {isClaiming ? '领取中...' : '立即领取'}
              </button>
            </div>
          </div>
        </div>

        {/* Invited Boxes */}
        <div className="boxes-section">
          <div className="section-header">
            <div className="section-icon">📦</div>
            <h3 className="section-title">已邀请的宝箱</h3>
          </div>

          <div className="box-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {xenbox.isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">加载中...</p>
              </div>
            ) : xenbox.shareTokenList.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💎</div>
                <h3 className="empty-title">
                  {xenbox.shareIsRefer ? '暂无邀请的宝箱' : '获得邀请资格后开始邀请'}
                </h3>
                <p className="empty-text">
                  {xenbox.shareIsRefer ? '分享您的邀请链接给朋友们' : '打造黄金宝箱解锁邀请功能'}
                </p>
              </div>
            ) : (
              <div className="box-grid">
                {xenbox.shareTokenList.map((tokenId) => {
                  const token = xenbox.tokenMap[version]?.[tokenId];
                  if (!token || token.end === 0) return null;

                  const accountCount = token.end - token.start;
                  const penalty = utils.getPenalty(token.time);
                  const feeAmount = xenbox.feeMap[version]?.[accountCount] || 0;
                  const referReward = token.mint
                    .mul(feeAmount)
                    .div(10000)
                    .mul(xenbox.shareReferFeePercent)
                    .div(100);
                  const isExpired = Date.now() / 1000 >= token.time;

                  return (
                    <div key={tokenId} className={`box-card ${isExpired ? 'expired' : ''}`}>
                      <div className="box-card-header">
                        <span className="box-id">#{tokenId}</span>
                        <span className={`box-status ${isExpired ? 'ready' : 'locked'}`}>
                          {isExpired ? '已到期' : '锁定中'}
                        </span>
                      </div>

                      <div className="box-image-container">
                        <img 
                          src={`/box${accountCount}.png`} 
                          alt={`Box ${accountCount}`}
                          className="box-image"
                        />
                        <div className="box-glow"></div>
                      </div>

                      <div className="box-info">
                        <div className="info-row">
                          <span className="info-label">账号数量</span>
                          <span className="info-value">{accountCount}</span>
                        </div>
                        
                        {token.term > 0 && (
                          <div className="info-row">
                            <span className="info-label">锁定时间</span>
                            <span className="info-value">{token.term} 天</span>
                          </div>
                        )}
                        
                        {feeAmount > 0 && !token.mint.eq(0) && (
                          <div className="info-row highlight">
                            <span className="info-label">邀请奖励</span>
                            <span className="info-value">
                              {utils.format.bigToString(referReward, 18, 0)} XEN
                            </span>
                          </div>
                        )}
                        
                        {token.time > 0 && (
                          <div className="time-info">
                            <span className="time-icon">{isExpired ? '✅' : '⏰'}</span>
                            <span className="time-text">
                              {isExpired ? (
                                penalty > 0 ? `延期惩罚: ${penalty}%` : '已到期'
                              ) : (
                                new Date(token.time * 1000).toLocaleString()
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .share-container {
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .share-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .share-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: var(--space-sm);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .share-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
        }

        .share-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-2xl);
        }

        /* Section Headers */
        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .section-icon {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--glass-bg);
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Invite Section */
        .invite-section {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          position: relative;
          overflow: hidden;
        }

        .invite-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-accent);
          opacity: 0.8;
        }

        .invite-card {
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          border: 1px solid var(--glass-border);
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }

        .invite-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gradient-primary);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .invite-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: var(--primary);
        }

        .invite-card:hover::before {
          opacity: 1;
        }

        .invite-link-container {
          display: flex;
          gap: var(--space-md);
          align-items: center;
        }

        .invite-link {
          flex: 1;
          padding: var(--space-md);
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-family: 'Space Grotesk', monospace;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-base);
          position: relative;
          cursor: text;
          user-select: all;
          -webkit-user-select: all;
          -moz-user-select: all;
          -ms-user-select: all;
        }

        .invite-link:focus {
          outline: none;
          border-color: var(--accent);
          background: var(--glass-bg);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .invite-link:hover {
          border-color: var(--primary);
          background: var(--glass-bg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .copy-button {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-md) var(--space-lg);
          background: var(--gradient-accent);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: 0 4px 12px var(--accent-glow);
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .copy-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .copy-button:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 20px var(--accent-glow);
        }

        .copy-button:hover::before {
          left: 100%;
        }

        .copy-icon {
          font-size: 1.2rem;
        }

        /* Stats Section */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-lg);
        }

        .stat-card {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-xl);
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gradient-primary);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-icon {
          font-size: 2.5rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          flex: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-value.active {
          color: var(--success);
        }

        .stat-value.inactive {
          color: var(--warning);
        }

        .stat-description {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          margin-top: var(--space-xs);
        }

        /* Reward Card */
        .reward-card {
          border-color: var(--accent);
        }

        .reward-card::before {
          opacity: 1;
          background: var(--gradient-accent);
        }

        .reward-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          margin-bottom: var(--space-md);
        }

        .reward-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent);
        }

        .reward-eth {
          font-size: 0.9rem;
          color: var(--text-tertiary);
        }

        .claim-button {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          background: var(--gradient-accent);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: 0 4px 12px var(--accent-glow);
          align-self: flex-start;
        }

        .claim-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px var(--accent-glow);
        }

        .claim-button:disabled {
          background: var(--glass-bg);
          color: var(--text-tertiary);
          cursor: not-allowed;
          box-shadow: none;
          border: 1px solid var(--glass-border);
          opacity: 0.6;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .button-icon {
          font-size: 1.1rem;
        }

        /* Boxes Section */
        .boxes-section {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
        }

        .box-list {
          min-height: 300px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-2xl);
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 3px solid var(--glass-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          margin-top: var(--space-lg);
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        .empty-state {
          text-align: center;
          padding: var(--space-2xl);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--space-lg);
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }

        .empty-text {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        /* Box Grid */
        .box-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-lg);
        }

        .box-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--space-lg);
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }

        .box-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gradient-primary);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .box-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }

        .box-card:hover::before {
          opacity: 1;
        }

        .box-card.expired {
          border-color: var(--success);
        }

        .box-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }

        .box-id {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .box-status {
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .box-status.ready {
          background: var(--success);
          color: white;
        }

        .box-status.locked {
          background: var(--bg-secondary);
          color: var(--text-tertiary);
        }

        .box-image-container {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-lg);
          height: 150px;
        }

        .box-image {
          width: 120px;
          height: 120px;
          object-fit: contain;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
          transition: transform var(--transition-base);
        }

        .box-card:hover .box-image {
          transform: scale(1.1) rotate(5deg);
        }

        .box-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          filter: blur(30px);
          opacity: 0.5;
        }

        .box-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-xs) 0;
        }

        .info-row.highlight {
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .info-label {
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }

        .info-value {
          color: var(--text-primary);
          font-weight: 600;
        }

        .time-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          margin-top: var(--space-sm);
        }

        .time-icon {
          font-size: 1.25rem;
        }

        .time-text {
          font-weight: 500;
          color: var(--text-secondary);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .share-title {
            font-size: 2rem;
          }

          .stats-section {
            grid-template-columns: 1fr;
          }

          .box-grid {
            grid-template-columns: 1fr;
          }

          .invite-link-container {
            flex-direction: column;
          }

          .copy-button {
            width: 100%;
            justify-content: center;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .stat-card,
          .invite-card,
          .boxes-section {
            padding: var(--space-lg);
          }

          .invite-section {
            padding: var(--space-lg);
          }
        }
      `}</style>
    </div>
  );
};

export default Share;