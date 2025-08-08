import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useXenBox } from '../hooks/useXenBox';
import { useToastContext } from '../contexts/ToastContext';
import { utils, BigNumber } from '../const';

const Mint = () => {
  const [amount, setAmount] = useState(100);
  const [term, setTerm] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [gasPrice, setGasPrice] = useState('');
  const [calculateMint, setCalculateMint] = useState(BigNumber.from(0));
  const [isMinting, setIsMinting] = useState(false);
  
  const wallet = useWallet();
  const xenbox = useXenBox();
  const toast = useToastContext();
  const gasLimit = 19000000;

  const boxOptions = [
    { value: 100, label: '100', icon: '💎', color: '#6366F1' },
    { value: 50, label: '50', icon: '💰', color: '#8B5CF6' },
    { value: 20, label: '20', icon: '💵', color: '#EC4899' },
    { value: 10, label: '10', icon: '💸', color: '#F59E0B' },
  ];

  useEffect(() => {
    setTerm(xenbox.defaultTerm);
  }, [xenbox.defaultTerm]);

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

  const handleMint = async () => {
    if (isMinting || !wallet.isConnected) return;
    
    setIsMinting(true);
    try {
      const gasPriceValue = gasPrice ? utils.format.stringToBig(gasPrice, 9) : undefined;
      
      await xenbox.mint({
        amount,
        term,
        refer: utils.num.min,
        gasPrice: gasPriceValue
      });
      
      toast.showSuccess('交易已提交', '铸造交易已提交到区块链，请等待确认');
    } catch (error: any) {
      console.error('铸造失败:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.showWarning('交易已取消', '您取消了铸造交易');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.showError('余额不足', '请检查您的账户余额');
      } else {
        toast.showError('铸造失败', error.reason || error.message || '未知错误');
      }
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="mint-container">
      <div className="mint-header">
        <h2 className="mint-title">铸造 XEN 宝箱</h2>
      </div>

      <div className="mint-content">
        {/* Main Form Card */}
        <div className="section-card main-form">
          {/* Box Preview */}
          <div className="box-preview-section">
            <div className="preview-container">
              <img 
                src={`/box${amount}.png`} 
                alt={`Box ${amount}`}
                className="preview-image"
              />
              <div className="preview-glow"></div>
            </div>
          </div>

          {/* Box Selection */}
          <div className="form-section">
            <h3 className="section-title">选择宝箱</h3>
            <div className="box-grid">
              {boxOptions.map(box => (
                <button
                  key={box.value}
                  className={`box-option ${amount === box.value ? 'box-selected' : ''}`}
                  onClick={() => {
                    setAmount(box.value);
                  }}
                  style={{ '--box-color': box.color } as any}
                >
                  <div className="box-icon">{box.icon}</div>
                  <div className="box-text">
                    <span className="box-value">{box.label}</span>
                    <span className="box-label">账号</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-divider"></div>

          {/* Configuration */}
          <div className="form-section">
            <h3 className="section-title">配置参数</h3>
          
          <div className="config-group">
            <label className="config-label">
              <span className="label-text">锁定时间</span>
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
                到期时间: {(() => {
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

          {/* Fee Info */}
          {xenbox.feeMap[1] && xenbox.feeMap[1][amount] !== 0 && (
            <div className="info-card">
              <div className="info-item">
                <span className="info-label">手续费率</span>
                <span className="info-value">{xenbox.feeMap[1][amount] / 100}%</span>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
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
                    utils.format.stringToBig(gasPrice, 9).mul((gasLimit / 100) * amount),
                    18,
                    6
                  )} {xenbox.chainConfig?.eth || 'ETH'}
                </div>
              )}
            </div>
          )}

          {/* Estimated Rewards */}
          {!calculateMint.eq(0) && xenbox.feeMap[1] && (
            <div className="reward-card">
              <div className="reward-header">
                <span className="reward-icon">🎯</span>
                <span className="reward-title">预计收益</span>
              </div>
              <div className="reward-amount">
                <span className="reward-value">
                  {utils.format.bigToString(
                    calculateMint
                      .mul(amount)
                      .mul(10000 - xenbox.feeMap[1][amount])
                      .div(10000),
                    18,
                    0
                  )}
                </span>
                <span className="reward-unit">{xenbox.chainConfig?.xen || 'XEN'}</span>
              </div>
              {xenbox.perEthAmount && !xenbox.perEthAmount.eq(0) && (
                <div className="reward-converted">
                  ≈ {utils.format.bigToString(
                    calculateMint
                      .mul(amount)
                      .mul(10000 - xenbox.feeMap[1][amount])
                      .div(10000)
                      .mul(xenbox.perEthAmount)
                      .div(utils.num.ether),
                    18,
                    6
                  )} ETH
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="form-actions">
            <button 
              className="mint-button"
              onClick={handleMint}
              disabled={!wallet.isConnected || !xenbox.isInitialized || isMinting}
            >
              <span className="button-icon">{isMinting ? '⏳' : '⚡'}</span>
              {isMinting ? '铸造中...' : wallet.isConnected ? '开始铸造' : '请先连接钱包'}
            </button>

            <div className="action-links">
              <a 
                href={`https://gas.33357.xyz/?c=${wallet.chainId}&g=${gasLimit}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-link"
              >
                <span className="link-icon">⛽</span>
                Gas 预测
              </a>
              <a 
                href="https://t.me/xenboxstore"
                target="_blank"
                rel="noopener noreferrer"
                className="action-link"
              >
                <span className="link-icon">💬</span>
                加入社区
              </a>
            </div>
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mint-container {
          max-width: 800px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .mint-header {
          text-align: center;
          margin-bottom: var(--space-lg);
        }

        .mint-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: var(--space-xs);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mint-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .mint-content {
          display: grid;
          gap: var(--space-md);
        }

        /* Section Card */
        .section-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          box-shadow: var(--glass-shadow);
        }

        .main-form {
          max-width: 100%;
          margin: 0 auto;
        }

        .form-section {
          margin-bottom: var(--space-lg);
        }

        .form-section:last-child {
          margin-bottom: 0;
        }

        .form-divider {
          height: 1px;
          background: var(--glass-border);
          margin: var(--space-lg) 0;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: var(--space-md);
          color: var(--text-primary);
        }

        /* Box Grid */
        .box-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-md);
        }

        .box-option {
          position: relative;
          padding: var(--space-md) var(--space-sm);
          background: var(--bg-secondary);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          overflow: hidden;
          min-height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .box-option::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--box-color) 0%, transparent 100%);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .box-option:hover {
          transform: translateY(-4px);
          border-color: var(--box-color);
        }

        .box-option:hover::before {
          opacity: 0.1;
        }

        .box-selected {
          border-color: var(--box-color);
          background: var(--bg-tertiary);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
        }

        .box-selected::before {
          opacity: 0.2;
        }

        .box-icon {
          font-size: 2rem;
          margin-bottom: var(--space-xs);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .box-text {
          display: flex;
          align-items: baseline;
          gap: var(--space-xs);
          justify-content: center;
        }

        .box-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .box-label {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          white-space: nowrap;
        }

        /* Box Preview */
        .box-preview-section {
          display: flex;
          justify-content: center;
          padding: var(--space-lg) 0;
          margin-bottom: var(--space-lg);
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          border-radius: var(--radius-lg);
        }

        .preview-container {
          position: relative;
          width: 180px;
          height: 180px;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .preview-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150%;
          height: 150%;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          filter: blur(40px);
          opacity: 0.5;
          animation: pulse 4s ease-in-out infinite;
        }

        /* Configuration */
        .config-group {
          margin-bottom: var(--space-md);
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
          background: var(--bg-secondary);
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
          background: var(--bg-tertiary);
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

        /* Info Card */
        .info-card {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          color: var(--text-secondary);
        }

        .info-value {
          font-weight: 600;
          color: var(--accent);
        }

        /* Reward Card */
        .reward-card {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
          color: white;
          text-align: left;
          box-shadow: 0 6px 16px var(--primary-glow);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          margin-bottom: var(--space-lg);
        }

        .reward-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(30px, -30px);
        }

        .reward-header {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          margin-bottom: var(--space-sm);
          position: relative;
          z-index: 1;
        }

        .reward-icon {
          font-size: 1.2rem;
        }

        .reward-title {
          font-size: 0.9rem;
          font-weight: 600;
          opacity: 0.9;
        }

        .reward-amount {
          margin-bottom: var(--space-xs);
          position: relative;
          z-index: 1;
        }

        .reward-value {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .reward-unit {
          font-size: 0.9rem;
          margin-left: var(--space-xs);
          opacity: 0.8;
          font-weight: 500;
        }

        .reward-converted {
          font-size: 0.8rem;
          opacity: 0.7;
          margin-top: var(--space-xs);
          position: relative;
          z-index: 1;
        }

        /* Advanced Settings */
        .advanced-toggle {
          margin-bottom: var(--space-md);
        }

        .toggle-button {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
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
          margin-bottom: var(--space-lg);
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
        }

        .advanced-content .config-group {
          margin-bottom: var(--space-sm);
        }

        .advanced-content .config-input {
          padding: var(--space-sm);
          font-size: 1rem;
        }

        .advanced-content .config-label {
          margin-bottom: var(--space-xs);
        }

        .advanced-content .config-label .label-text,
        .advanced-content .config-label .label-unit {
          font-size: 0.875rem;
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

        /* Form Actions */
        .form-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          align-items: center;
          margin-top: var(--space-lg);
        }

        .mint-button {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-xl);
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: 0 8px 24px var(--primary-glow);
          position: relative;
          overflow: hidden;
        }

        .mint-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .mint-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px var(--primary-glow);
        }

        .mint-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .mint-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-icon {
          font-size: 1.5rem;
        }

        .action-links {
          display: flex;
          gap: var(--space-md);
        }

        .action-link {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: all var(--transition-base);
        }

        .action-link:hover {
          color: var(--primary);
          transform: translateY(-2px);
        }

        .link-icon {
          font-size: 1.25rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .mint-title {
            font-size: 1.8rem;
          }

          .box-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-sm);
          }

          .preview-container {
            width: 150px;
            height: 150px;
          }

          .reward-value {
            font-size: 1.25rem;
          }

          .mint-button {
            width: 100%;
          }

          .main-form {
            padding: var(--space-md);
          }

          .box-preview-section {
            margin: calc(var(--space-md) * -1) calc(var(--space-md) * -1) var(--space-md);
            border-radius: var(--radius-lg) var(--radius-lg) 0 0;
            padding: var(--space-md) 0;
          }

          .action-links {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Mint;