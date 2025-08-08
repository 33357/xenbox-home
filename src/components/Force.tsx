import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useXenBox } from '../hooks/useXenBox';
import { useToastContext } from '../contexts/ToastContext';
import { utils, BigNumber } from '../const';

const Force = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [term, setTerm] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [gasPrice, setGasPrice] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState(0);
  const [calculateMint, setCalculateMint] = useState(BigNumber.from(0));
  const [isForcing, setIsForcing] = useState(false);
  const gasLimit = 7000000;

  const wallet = useWallet();
  const xenbox = useXenBox();
  const toast = useToastContext();

  const version = 1; // Force only works with V1 tokens

  useEffect(() => {
    setTerm(xenbox.defaultTerm);
  }, [xenbox.defaultTerm]);

  useEffect(() => {
    if (wallet.isConnected && xenbox.isInitialized) {
      xenbox.fetchForceList();
    }
  }, [wallet.isConnected, xenbox.isInitialized]);

  useEffect(() => {
    if (term > 0) {
      getCalculateMint();
    }
  }, [term, xenbox.isInitialized]);

  const getCalculateMint = async () => {
    try {
      const calculatedMint = await xenbox.calculateMintReward(term);
      setCalculateMint(calculatedMint);
    } catch (error) {
      console.error('计算铸造收益失败:', error);
    }
  };

  const handleForce = (tokenId: number) => {
    setSelectedTokenId(tokenId);
    setDialogVisible(true);
    getCalculateMint();
  };

  const confirmForce = async () => {
    if (isForcing) return;
    
    setIsForcing(true);
    try {
      const gasPriceValue = gasPrice ? utils.format.stringToBig(gasPrice, 9) : undefined;
      
      await xenbox.force({
        tokenId: selectedTokenId,
        term,
        gasPrice: gasPriceValue
      });
      
      toast.showSuccess('重铸交易已提交', '重铸交易已提交到区块链');
      setDialogVisible(false);
      
      setTimeout(() => {
        xenbox.fetchForceList();
      }, 3000);
    } catch (error: any) {
      console.error('重铸失败:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.showWarning('交易已取消', '您取消了重铸交易');
      } else if (error.message?.includes('not yet matured')) {
        toast.showError('宝箱未到期', '宝箱尚未到期，无法重铸');
      } else {
        toast.showError('重铸失败', error.reason || error.message || '未知错误');
      }
    } finally {
      setIsForcing(false);
    }
  };

  const sortedTokenList = xenbox.forceTokenList.filter((tokenId) => {
    const token = xenbox.tokenMap[version]?.[tokenId];
    if (!token || token.end === 0) return false;
    return true;
  });

  const formatTimeRemaining = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = timestamp - now;
    
    if (diff <= 0) return '已到期';
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    
    if (days > 0) return `${days}天 ${hours}小时`;
    return `${hours}小时`;
  };

  return (
    <div className="force-container">
      <div className="force-header">
        <h2 className="force-title">重铸宝箱</h2>
      </div>


      {/* Box List */}
      <div className="box-list">
        {xenbox.isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">加载中...</p>
          </div>
        ) : sortedTokenList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔄</div>
            <h3 className="empty-title">
              {wallet.isConnected ? '暂无可重铸的宝箱' : '请先连接钱包'}
            </h3>
            <p className="empty-text">
              {wallet.isConnected ? '您还没有任何可重铸的宝箱' : '连接钱包查看您的宝箱'}
            </p>
          </div>
        ) : (
          <div className="box-grid">
            {sortedTokenList.map((tokenId) => {
              const token = xenbox.tokenMap[version]?.[tokenId];
              if (!token) return null;

              const accountCount = token.end - token.start;
              const isMatured = Date.now() / 1000 >= token.time;
              const penalty = utils.getPenalty(token.time);

              return (
                <div key={tokenId} className={`box-card ${isMatured ? 'matured' : ''}`}>
                  <div className="box-image-container">
                    <img 
                      src={`/box${accountCount}.png`} 
                      alt={`Box ${accountCount}`}
                      className="box-image"
                    />
                    <div className="box-glow"></div>
                  </div>

                  <div className="box-card-header">
                    <span className="box-id">#{tokenId}</span>
                    <span className={`box-status ${isMatured ? 'ready' : 'locked'}`}>
                      {isMatured ? '可重铸' : '未到期'}
                    </span>
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
                    
                    {!token.mint.eq(0) && xenbox.feeMap[version] && (
                      <div className="info-row highlight">
                        <span className="info-label">收益</span>
                        <span className="info-value">
                          {utils.format.bigToString(
                            token.mint.mul(10000 - xenbox.feeMap[version][accountCount]).div(10000),
                            18,
                            0
                          )} XEN
                        </span>
                      </div>
                    )}
                    
                    {token.time > 0 && (
                      <div className="time-info">
                        <span className="time-icon">{isMatured ? '🔥' : '⏰'}</span>
                        <span className="time-text">
                          {isMatured ? (
                            penalty > 0 ? `延期惩罚: ${penalty}%` : '已到期'
                          ) : (
                            formatTimeRemaining(token.time)
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    className="force-button"
                    disabled={!isMatured || token.time === 0}
                    onClick={() => handleForce(tokenId)}
                  >
                    <span className="button-icon">{isMatured ? '🔥' : '🔒'}</span>
                    {isMatured ? '重铸宝箱' : '等待到期'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Force Dialog */}
      {dialogVisible && (
        <div className="modal-overlay" onClick={() => setDialogVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDialogVisible(false)}>
              ✕
            </button>

            <h3 className="modal-title">重铸宝箱</h3>

            <div className="modal-body">
              <div className="config-group">
                <label className="config-label">
                  <span className="label-text">重新锁定时间</span>
                  <span className="label-unit">天</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    min="1"
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    className="config-input"
                  />
                  <div className="input-border"></div>
                </div>
              </div>

              {calculateMint && !calculateMint.eq(0) && xenbox.feeMap[version] && xenbox.tokenMap[version]?.[selectedTokenId] && (
                <div className="estimate-card">
                  <div className="estimate-header">
                    <span className="estimate-icon">💰</span>
                    <span className="estimate-title">预计收益</span>
                  </div>
                  <div className="estimate-value">
                    {utils.format.bigToString(
                      calculateMint
                        .mul(xenbox.tokenMap[version][selectedTokenId].end - 
                             xenbox.tokenMap[version][selectedTokenId].start)
                        .mul(10000 - xenbox.feeMap[version][
                          xenbox.tokenMap[version][selectedTokenId].end - 
                          xenbox.tokenMap[version][selectedTokenId].start
                        ])
                        .div(10000),
                      18,
                      0
                    )} XEN
                  </div>
                </div>
              )}

              <div className="advanced-toggle">
                <button
                  className="toggle-button"
                  onClick={() => setAdvanced(!advanced)}
                >
                  <span className="toggle-icon">{advanced ? '🔽' : '▶️'}</span>
                  高级设置
                </button>
              </div>

              {advanced && (
                <div className="advanced-content">
                  <div className="config-group">
                    <label className="config-label">
                      <span className="label-text">Gas 价格</span>
                      <span className="label-unit">Gwei</span>
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={gasPrice}
                        onChange={(e) => setGasPrice(e.target.value)}
                        placeholder="自动"
                        className="config-input"
                      />
                      <div className="input-border"></div>
                    </div>
                  </div>

                  {gasPrice && (
                    <div className="gas-estimate">
                      <span className="gas-icon">⛽</span>
                      预计 Gas 费用: {utils.format.bigToString(
                        utils.format
                          .stringToBig(gasPrice, 9)
                          .mul(
                            Math.floor((gasLimit / 100) *
                              (xenbox.tokenMap[version]?.[selectedTokenId]?.end - 
                               xenbox.tokenMap[version]?.[selectedTokenId]?.start || 1))
                          ),
                        18,
                        6
                      )} {xenbox.chainConfig?.eth || 'ETH'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="action-btn secondary"
                onClick={() => setDialogVisible(false)}
                disabled={isForcing}
              >
                取消
              </button>
              <button 
                className="action-btn primary"
                onClick={confirmForce}
                disabled={isForcing}
              >
                <span className="button-icon">{isForcing ? '⏳' : '🔥'}</span>
                {isForcing ? '重铸中...' : '确认重铸'}
              </button>
            </div>

            <div className="modal-footer">
              <a
                href={`https://gas.33357.xyz/?c=${wallet.chainId}&g=${gasLimit}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                <span className="link-icon">⛽</span>
                Gas 预测
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .force-container {
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .force-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .force-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: var(--space-sm);
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .force-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
        }


        /* Box List */
        .box-list {
          min-height: 400px;
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
          border-top-color: #f093fb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          margin-top: var(--space-lg);
          color: var(--text-secondary);
          font-size: 1.125rem;
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
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

        .box-card.matured {
          border-color: #f093fb;
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
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
          background: radial-gradient(circle, rgba(240, 147, 251, 0.4) 0%, transparent 70%);
          filter: blur(30px);
          opacity: 0.5;
        }

        .box-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          margin-bottom: var(--space-lg);
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

        .force-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .force-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(240, 147, 251, 0.4);
        }

        .force-button:disabled {
          background: var(--bg-tertiary);
          color: var(--text-tertiary);
          cursor: not-allowed;
        }

        .button-icon {
          font-size: 1.2rem;
        }

        /* Modal - Same as Box component */
        .modal-overlay {
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
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideIn 0.3s ease-out;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: none;
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .modal-close:hover {
          background: var(--danger);
          color: white;
        }

        .modal-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: var(--space-xl);
          text-align: center;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .modal-body {
          margin-bottom: var(--space-xl);
        }

        .config-group {
          margin-bottom: var(--space-lg);
        }

        .config-label {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--space-sm);
        }

        .label-text {
          font-weight: 600;
          color: var(--text-primary);
        }

        .label-unit {
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .input-wrapper {
          position: relative;
        }

        .config-input {
          width: 100%;
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 500;
          transition: all var(--transition-base);
        }

        .config-input:focus {
          outline: none;
          border-color: #f093fb;
          background: var(--bg-primary);
        }

        .input-border {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          transition: all var(--transition-base);
          transform: translateX(-50%);
        }

        .config-input:focus ~ .input-border {
          width: 100%;
        }

        .estimate-card {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          text-align: center;
          color: white;
          margin-bottom: var(--space-lg);
        }

        .estimate-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .estimate-icon {
          font-size: 1.5rem;
        }

        .estimate-title {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .estimate-value {
          font-size: 2rem;
          font-weight: 800;
        }

        .advanced-toggle {
          margin-bottom: var(--space-lg);
        }

        .toggle-button {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .toggle-button:hover {
          border-color: #f093fb;
          color: #f093fb;
        }

        .toggle-icon {
          font-size: 0.875rem;
        }

        .advanced-content {
          animation: slideIn 0.3s ease-out;
        }

        .gas-estimate {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }

        .gas-icon {
          font-size: 1.25rem;
        }

        .modal-actions {
          display: flex;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
        }

        .action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(240, 147, 251, 0.4);
        }

        .action-btn.secondary {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .action-btn.secondary:hover {
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-footer {
          text-align: center;
          padding-top: var(--space-lg);
          border-top: 1px solid var(--glass-border);
        }

        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: all var(--transition-base);
        }

        .footer-link:hover {
          color: #f093fb;
        }

        .link-icon {
          font-size: 1.25rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .force-title {
            font-size: 2rem;
          }


          .box-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            margin: var(--space-md);
          }
        }
      `}</style>
    </div>
  );
};

export default Force;