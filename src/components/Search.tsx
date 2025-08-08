import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useXenBox } from '../hooks/useXenBox';
import { utils } from '../const';

const Search = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const wallet = useWallet();
  const xenbox = useXenBox();

  const version = 1; // Search focuses on V1 tokens

  const handleSearch = async () => {
    if (!searchInput.trim() || isSearching) return;
    
    setIsSearching(true);
    try {
      await xenbox.search(searchInput.trim());
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入地址或 ID"
          className="search-input"
          disabled={isSearching}
        />
        <button
          className="search-button"
          onClick={handleSearch}
          disabled={isSearching || !searchInput.trim()}
        >
          {isSearching ? '搜索中...' : '🔍'}
        </button>
      </div>

      <div className="box-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {xenbox.isLoading || isSearching ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">搜索中...</p>
          </div>
        ) : xenbox.searchTokenList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">
              {searchInput ? '未找到相关宝箱' : '请输入地址或ID进行搜索'}
            </h3>
            <p className="empty-text">
              {searchInput ? '尝试搜索其他地址或ID' : '输入完整的钱包地址或宝箱ID'}
            </p>
          </div>
        ) : (
          <div className="box-grid">
            {xenbox.searchTokenList.map((tokenId) => {
              const token = xenbox.tokenMap[version]?.[tokenId];
              if (!token || token.end === 0) return null;

              const accountCount = token.end - token.start;
              const isExpired = Date.now() / 1000 >= token.time;
              const penalty = utils.getPenalty(token.time);

              return (
                <div key={tokenId} className={`box-card ${isExpired ? 'expired' : ''}`}>
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

      <style jsx>{`
        .search-container {
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .search-input-container {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
          background: var(--glass-bg);
          padding: var(--space-md);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
        }

        .search-input {
          flex: 1;
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 500;
          transition: all var(--transition-base);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          background: var(--bg-primary);
        }

        .search-input:disabled {
          background: var(--bg-tertiary);
          color: var(--text-tertiary);
          cursor: not-allowed;
        }

        .search-input::placeholder {
          color: var(--text-tertiary);
        }

        .search-button {
          padding: var(--space-md) var(--space-lg);
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          min-width: 120px;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px var(--primary-glow);
        }

        .search-button:disabled {
          background: var(--bg-tertiary);
          color: var(--text-tertiary);
          cursor: not-allowed;
          box-shadow: none;
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
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
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

        /* Responsive */
        @media (max-width: 768px) {
          .box-grid {
            grid-template-columns: 1fr;
          }

          .search-input-container {
            flex-direction: column;
            align-items: stretch;
          }

          .search-button {
            width: 100%;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Search;