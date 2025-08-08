import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useXenBox } from '../hooks/useXenBox';
import { useToastContext } from '../contexts/ToastContext';
import { utils, BigNumber } from '../const';

const Box = () => {
  const [sort, setSort] = useState('id');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [term, setTerm] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [gasPrice, setGasPrice] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState(1);
  const [calculateMint, setCalculateMint] = useState(BigNumber.from(0));
  const [isClaiming, setIsClaiming] = useState(false);
  const [filter, setFilter] = useState('all');

  const wallet = useWallet();
  const xenbox = useXenBox();
  const toast = useToastContext();

  useEffect(() => {
    setTerm(xenbox.defaultTerm);
  }, [xenbox.defaultTerm]);

  useEffect(() => {
    if (wallet.isConnected && xenbox.isInitialized) {
      xenbox.fetchBoxList();
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

  const handleClaim = (version: number, tokenId: number) => {
    setSelectedVersion(version);
    setSelectedTokenId(tokenId);
    setDialogVisible(true);
    getCalculateMint();
  };

  const confirmClaim = async () => {
    if (isClaiming) return;
    
    setIsClaiming(true);
    try {
      const gasPriceValue = gasPrice ? utils.format.stringToBig(gasPrice, 9) : undefined;
      
      await xenbox.claim({
        version: selectedVersion,
        tokenId: selectedTokenId,
        term,
        gasPrice: gasPriceValue
      });
      
      toast.showSuccess('交易已提交', '开启交易已提交到区块链');
      setDialogVisible(false);
      
      setTimeout(() => {
        xenbox.fetchBoxList();
      }, 3000);
    } catch (error: any) {
      console.error('开启失败:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.showWarning('交易已取消', '您取消了开启交易');
      } else if (error.message?.includes('not yet matured')) {
        toast.showError('宝箱未到期', '请等待到期时间');
      } else {
        toast.showError('开启失败', error.reason || error.message || '未知错误');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const sortedTokenList = [...xenbox.boxTokenList].filter(({ version, tokenId }) => {
    const token = xenbox.tokenMap[version]?.[tokenId];
    if (!token || token.end === 0) return false;
    
    if (filter === 'expired') {
      return Date.now() / 1000 >= token.time;
    } else if (filter === 'active') {
      return Date.now() / 1000 < token.time;
    }
    return true;
  }).sort((a, b) => {
    if (sort === 'id') {
      return a.tokenId - b.tokenId;
    } else if (sort === 'time') {
      const tokenA = xenbox.tokenMap[a.version]?.[a.tokenId];
      const tokenB = xenbox.tokenMap[b.version]?.[b.tokenId];
      return (tokenA?.time || 0) - (tokenB?.time || 0);
    }
    return 0;
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
    <div className="box-container">
      <div className="box-header">
        <h2 className="box-title">我的宝箱</h2>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="filter-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="filter-icon">📦</span>
            全部
          </button>
          <button
            className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            <span className="filter-icon">✅</span>
            可开启
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            <span className="filter-icon">⏳</span>
            锁定中
          </button>
        </div>

        <div className="sort-group">
          <button
            className={`sort-btn ${sort === 'id' ? 'active' : ''}`}
            onClick={() => setSort('id')}
          >
            按 ID 排序
          </button>
          <button
            className={`sort-btn ${sort === 'time' ? 'active' : ''}`}
            onClick={() => setSort('time')}
          >
            按时间排序
          </button>
        </div>
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
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">
              {wallet.isConnected ? '暂无宝箱' : '请先连接钱包'}
            </h3>
            <p className="empty-text">
              {wallet.isConnected ? '您还没有任何宝箱，去铸造一个吧！' : '连接钱包查看您的宝箱'}
            </p>
          </div>
        ) : (
          <div className="box-grid">
            {sortedTokenList.map(({ version, tokenId }) => {
              const token = xenbox.tokenMap[version]?.[tokenId];
              if (!token) return null;

              const accountCount = token.end - token.start;
              const isExpired = Date.now() / 1000 >= token.time;
              const penalty = utils.getPenalty(token.time);

              return (
                <div key={`${version}-${tokenId}`} className={`box-card ${isExpired ? 'expired' : ''}`}>
                  <div className="box-card-header">
                    <span className="box-id">#{tokenId}</span>
                    <span className={`box-status ${isExpired ? 'ready' : 'locked'}`}>
                      {isExpired ? '可开启' : '锁定中'}
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
                        <div className="info-value-container">
                          <span className="info-value">{token.term} 天</span>
                        </div>
                      </div>
                    )}
                    
                    {!token.mint.eq(0) && xenbox.feeMap[version] && (
                      <div className="info-row">
                        <span className="info-label">收益</span>
                        <span className="info-value">
                          {penalty > 0 ? (
                            <>
                              {utils.format.bigToString(
                                token.mint.mul(10000 - xenbox.feeMap[version][accountCount]).div(10000),
                                18,
                                0
                              )} XEN
                              <span className="penalty-text">(-{penalty}%)</span>
                            </>
                          ) : (
                            `${utils.format.bigToString(
                              token.mint.mul(10000 - xenbox.feeMap[version][accountCount]).div(10000),
                              18,
                              0
                            )} XEN`
                          )}
                        </span>
                      </div>
                    )}
                  
                  </div>

                  <button
                    className="claim-button"
                    disabled={!isExpired || token.time === 0}
                    onClick={() => handleClaim(version, tokenId)}
                  >
                    <span className="button-icon">{isExpired ? '🎁' : '🔒'}</span>
                    {isExpired ? '开启宝箱' : `${new Date(token.time * 1000).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}解锁`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Claim Dialog */}
      {dialogVisible && (
        <div className="modal-overlay" onClick={() => setDialogVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDialogVisible(false)}>
              ✕
            </button>

            <h3 className="modal-title">开启宝箱</h3>

            <div className="modal-body">
              <div className="config-group">
                <label className="config-label">
                  <span className="label-text">下一轮锁定时间</span>
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
                {term > 0 && (
                  <div className="term-date">
                    下轮到期: {(() => {
                      const endDate = new Date();
                      endDate.setDate(endDate.getDate() + term);
                      return endDate.toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      });
                    })()}
                  </div>
                )}
              </div>

              {calculateMint && !calculateMint.eq(0) && xenbox.feeMap[selectedVersion] && (
                <div className="estimate-card">
                  <div className="estimate-header">
                    <span className="estimate-icon">💰</span>
                    <span className="estimate-title">预计收益</span>
                  </div>
                  <div className="estimate-value">
                    {xenbox.tokenMap[selectedVersion]?.[selectedTokenId] && (
                      utils.format.bigToString(
                        calculateMint
                          .mul(xenbox.tokenMap[selectedVersion][selectedTokenId].end - 
                               xenbox.tokenMap[selectedVersion][selectedTokenId].start)
                          .mul(10000 - xenbox.feeMap[selectedVersion][
                            xenbox.tokenMap[selectedVersion][selectedTokenId].end - 
                            xenbox.tokenMap[selectedVersion][selectedTokenId].start
                          ])
                          .div(10000),
                        18,
                        0
                      )
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
                  
                  <div className="gas-prediction">
                    <a
                      href={`https://gas.33357.xyz/?c=${wallet.chainId}&g=7000000`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gas-link"
                    >
                      <span className="link-icon">⛽</span>
                      Gas 预测
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="action-btn secondary"
                onClick={() => setDialogVisible(false)}
                disabled={isClaiming}
              >
                取消
              </button>
              <button 
                className="action-btn primary"
                onClick={confirmClaim}
                disabled={isClaiming}
              >
                <span className="button-icon">{isClaiming ? '⏳' : '✨'}</span>
                {isClaiming ? '开启中...' : '确认开启'}
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        .box-container {
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .box-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .box-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: var(--space-sm);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .box-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
        }

        /* Controls */
        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
          flex-wrap: wrap;
        }

        .filter-group, .sort-group {
          display: flex;
          gap: var(--space-sm);
          background: var(--glass-bg);
          padding: var(--space-xs);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
        }

        .filter-btn, .sort-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
          border-radius: var(--radius-md);
        }

        .filter-btn.active, .sort-btn.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .filter-btn:hover:not(.active), .sort-btn:hover:not(.active) {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .filter-icon {
          font-size: 1.2rem;
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
          border-top-color: var(--primary);
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
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
        }

        .box-status.locked {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
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
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
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

        .info-value-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .info-date {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          font-weight: 400;
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

        .penalty-text {
          color: var(--danger);
          font-size: 0.875rem;
          margin-left: var(--space-xs);
        }

        .claim-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .claim-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px var(--primary-glow);
        }

        .claim-button:disabled {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          cursor: not-allowed;
        }

        .button-icon {
          font-size: 1.2rem;
        }

        /* Modal */
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
          background: var(--gradient-primary);
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
          border-color: var(--primary);
          background: var(--bg-primary);
        }

        .input-border {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--gradient-primary);
          transition: all var(--transition-base);
          transform: translateX(-50%);
        }

        .config-input:focus ~ .input-border {
          width: 100%;
        }

        .term-date {
          margin-top: var(--space-xs);
          padding: var(--space-xs) var(--space-sm);
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: var(--text-secondary);
          border-left: 3px solid var(--primary);
        }

        .estimate-card {
          background: var(--gradient-primary);
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
          border-color: var(--primary);
          color: var(--primary);
        }

        .toggle-icon {
          font-size: 0.875rem;
        }

        .advanced-content {
          animation: slideIn 0.3s ease-out;
        }

        .gas-prediction {
          margin-top: var(--space-md);
          text-align: center;
        }

        .gas-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
          background: var(--bg-tertiary);
        }

        .gas-link:hover {
          color: var(--primary);
          border-color: var(--primary);
          background: var(--bg-secondary);
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
          background: var(--gradient-primary);
          color: white;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px var(--primary-glow);
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
          color: var(--primary);
        }

        .link-icon {
          font-size: 1.25rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .box-title {
            font-size: 2rem;
          }

          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group, .sort-group {
            width: 100%;
            justify-content: center;
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

export default Box;