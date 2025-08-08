import { useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useXenBox } from '../hooks/useXenBox';
import { useToastContext } from '../contexts/ToastContext';
import { utils } from '../const';

const Table = () => {
  const wallet = useWallet();
  const xenbox = useXenBox();
  const toast = useToastContext();

  useEffect(() => {
    if (wallet.isConnected && xenbox.isInitialized) {
      xenbox.fetchTableData();
    }
  }, [wallet.isConnected, xenbox.isInitialized]);

  const handleAddToken = async () => {
    if (!wallet.chainId || !xenbox.chainConfig) return;
    
    try {
      await xenbox.addTokenToWallet(xenbox.chainConfig.xen);
      toast.showSuccess('添加成功', `${xenbox.chainConfig.xen} 代币已添加到钱包`);
    } catch (error: any) {
      console.error('添加代币失败:', error);
      
      if (error.code === 4001) {
        toast.showWarning('取消添加', '您取消了添加代币到钱包');
      } else {
        toast.showError('添加失败', '无法添加代币到钱包，请手动添加');
      }
    }
  };

  const getSwapUrl = () => {
    if (!wallet.chainId || !xenbox.xenAddress) return '#';
    
    const swapUrls: { [key: number]: string } = {
      1: 'https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=',
      56: 'https://pancakeswap.finance/swap?inputCurrency=BNB&outputCurrency=',
      137: 'https://quickswap.exchange/#/swap?inputCurrency=MATIC&outputCurrency='
    };
    
    return swapUrls[wallet.chainId] ? `${swapUrls[wallet.chainId]}${xenbox.xenAddress}` : '#';
  };

  if (!wallet.isConnected) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3 className="empty-title">请先连接钱包</h3>
          <p className="empty-text">连接钱包后即可查看详细的数据信息</p>
        </div>
        <style jsx>{`
          .table-container {
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
    <div className="table-container">
      <div className="data-header">
        <h2 className="data-title">数据总览</h2>
      </div>

      <div className="data-grid">
        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-card highlight">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-label">XenBox 总量</span>
              <span className="stat-value">{xenbox.totalToken.toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-label">{xenbox.chainConfig?.xen || 'XEN'} 资金池</span>
              <span className="stat-value">
                {utils.format.bigToString(xenbox.poolBalance, 18, 6)} {xenbox.chainConfig?.eth || 'ETH'}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌐</div>
            <div className="stat-content">
              <span className="stat-label">当前网络</span>
              <span className="stat-value">{xenbox.chainConfig?.eth || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Contract Addresses */}
        <div className="contracts-section">
          <h3 className="section-title">合约地址</h3>
          <div className="contract-cards">
            <div className="contract-card">
              <div className="contract-header">
                <span className="contract-icon">📦</span>
                <span className="contract-name">XenBox 合约</span>
              </div>
              <div className="address-container">
                <span className="address">{xenbox.tokenAddress}</span>
                {xenbox.tokenAddress && xenbox.chainConfig?.scan && (
                  <a
                    href={`${xenbox.chainConfig.scan}address/${xenbox.tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-button"
                  >
                    <span className="link-icon">🔗</span>
                    查看
                  </a>
                )}
              </div>
            </div>

            <div className="contract-card">
              <div className="contract-header">
                <span className="contract-icon">💎</span>
                <span className="contract-name">{xenbox.chainConfig?.xen || 'XEN'} 代币</span>
              </div>
              <div className="address-container">
                <span className="address">{xenbox.xenAddress}</span>
                {xenbox.xenAddress && xenbox.chainConfig?.scan && (
                  <a
                    href={`${xenbox.chainConfig.scan}token/${xenbox.xenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-button"
                  >
                    <span className="link-icon">🔗</span>
                    查看
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions-section">
          <h3 className="section-title">快捷操作</h3>
          <div className="action-cards">
            <div className="action-card">
              <div className="action-icon">📱</div>
              <div className="action-content">
                <span className="action-title">添加代币到钱包</span>
                <span className="action-description">一键添加 {xenbox.chainConfig?.xen || 'XEN'} 到 MetaMask</span>
                <button
                  className="action-button primary"
                  onClick={handleAddToken}
                  disabled={!xenbox.xenAddress}
                >
                  <span className="button-icon">➕</span>
                  添加 {xenbox.chainConfig?.xen || 'XEN'}
                </button>
              </div>
            </div>

            <div className="action-card">
              <div className="action-icon">🔄</div>
              <div className="action-content">
                <span className="action-title">交易代币</span>
                <span className="action-description">在去中心化交易所交易 {xenbox.chainConfig?.xen || 'XEN'}</span>
                <a
                  href={getSwapUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button secondary"
                >
                  <span className="button-icon">🚀</span>
                  去交易
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {xenbox.isLoading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">加载数据中...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .table-container {
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .data-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .data-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: var(--space-sm);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .data-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
        }

        .data-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-2xl);
        }

        /* Stats Section */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-lg);
        }

        .stat-card {
          display: flex;
          align-items: center;
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

        .stat-card.highlight {
          border-color: var(--primary);
        }

        .stat-card.highlight::before {
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
          min-width: 0;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          word-break: break-all;
        }

        /* Sections */
        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-lg);
          text-align: center;
        }

        /* Contract Section */
        .contracts-section {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
        }

        .contract-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-lg);
        }

        .contract-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          border: 1px solid var(--glass-border);
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }

        .contract-card::before {
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

        .contract-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          border-color: var(--primary);
        }

        .contract-card:hover::before {
          opacity: 1;
        }

        .contract-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .contract-icon {
          font-size: 1.8rem;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-glow) 0%, var(--accent-glow) 100%);
          border-radius: var(--radius-md);
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .contract-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .address-container {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .address {
          font-family: 'Space Grotesk', monospace;
          font-size: 0.9rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: var(--space-sm);
          border-radius: var(--radius-md);
          word-break: break-all;
          flex: 1;
          min-width: 0;
        }

        .link-button {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          background: var(--gradient-primary);
          color: white;
          text-decoration: none;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: 0 4px 12px var(--primary-glow);
          flex-shrink: 0;
        }

        .link-button:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 20px var(--primary-glow);
        }

        .link-icon {
          font-size: 1rem;
        }

        /* Actions Section */
        .actions-section {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
        }

        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-lg);
        }

        .action-card {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-xl);
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gradient-accent);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          border-color: var(--accent);
        }

        .action-card:hover::before {
          opacity: 1;
        }

        .action-icon {
          font-size: 2.2rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--accent-glow) 0%, var(--primary-glow) 100%);
          border-radius: var(--radius-lg);
          flex-shrink: 0;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
          transition: all var(--transition-base);
        }

        .action-card:hover .action-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
        }

        .action-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          flex: 1;
        }

        .action-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .action-description {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          margin-bottom: var(--space-sm);
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          text-decoration: none;
          font-size: 0.9rem;
          align-self: flex-start;
        }

        .action-button.primary {
          background: var(--gradient-primary);
          color: white;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .action-button.primary:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 20px var(--primary-glow);
        }

        .action-button.primary:disabled {
          background: var(--bg-tertiary);
          color: var(--text-tertiary);
          cursor: not-allowed;
          box-shadow: none;
        }

        .action-button.secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--glass-border);
        }

        .action-button.secondary:hover {
          background: var(--glass-bg);
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .button-icon {
          font-size: 1rem;
        }

        /* Loading */
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-overlay);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal);
          backdrop-filter: blur(8px);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-2xl);
          background: var(--glass-bg);
          border-radius: var(--radius-xl);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .data-title {
            font-size: 2rem;
          }

          .stats-section {
            grid-template-columns: 1fr;
          }

          .contract-cards,
          .action-cards {
            grid-template-columns: 1fr;
          }

          .address-container {
            flex-direction: column;
            align-items: stretch;
          }

          .address {
            font-size: 0.8rem;
          }

          .action-card {
            flex-direction: column;
            text-align: center;
          }

          .action-button {
            align-self: stretch;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .stat-card {
            padding: var(--space-lg);
          }

          .contract-card,
          .action-card {
            padding: var(--space-lg);
          }

          .contracts-section,
          .actions-section {
            padding: var(--space-lg);
          }
        }
      `}</style>
    </div>
  );
};

export default Table;