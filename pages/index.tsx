import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useWallet } from '../src/hooks/useWallet';
import { useXenBox } from '../src/hooks/useXenBox';
import { useToastContext } from '../src/contexts/ToastContext';

// Import components
import Mint from '../src/components/Mint';
import Box from '../src/components/Box';
import Share from '../src/components/Share';
import Force from '../src/components/Force';
import Search from '../src/components/Search';
import Table from '../src/components/Table';

// Import utils
import { log, utils } from '../src/const';

const Home = () => {
  const [activeIndex, setActiveIndex] = useState('1');
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const wallet = useWallet();
  const xenbox = useXenBox();
  const toast = useToastContext();

  const navItems = [
    { id: '1', label: '铸造', icon: '⚡' },
    { id: '2', label: '我的', icon: '💎' },
    { id: '3', label: '邀请', icon: '🎁' },
    { id: '4', label: '重铸', icon: '🔄' },
    { id: '5', label: '查找', icon: '🔍' },
    { id: '6', label: '数据', icon: '📊' },
  ];

  const handleConnectWallet = async () => {
    if (wallet.isConnecting) return;
    
    try {
      await wallet.connect();
      toast.showSuccess('连接成功', '已成功连接到 MetaMask 钱包');
    } catch (error: any) {
      console.error('钱包连接失败:', error);
      
      if (error.message?.includes('MetaMask')) {
        toast.showError('连接失败', '请确保已安装 MetaMask');
      } else {
        toast.showError('连接失败', '请重试或检查钱包设置');
      }
    }
  };

  useEffect(() => {
    const initializeApp = () => {
      const chainId = Number(utils.func.getParameterByName('c'));
      const refer = utils.func.getParameterByName('r');
      log(`应用初始化 chainId: ${chainId}, refer: ${refer}`);
    };

    if (typeof window !== 'undefined') {
      initializeApp();
    }
  }, []);

  const renderActiveComponent = () => {
    switch (activeIndex) {
      case '1': return <Mint />;
      case '2': return <Box />;
      case '3': return <Share />;
      case '4': return <Force />;
      case '5': return <Search />;
      case '6': return <Table />;
      default: return <Mint />;
    }
  };

  return (
    <>
      <Head>
        <title>XenBox - Decentralized Mining Platform</title>
        <meta name="description" content="The most innovative blockchain mining platform" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="app">
        {/* Hero Background */}
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>

        {/* Navigation */}
        <nav className="nav-container">
          <div className="nav-content">
            <div className="nav-logo">
              <span className="logo-text">XenBox</span>
              <span className="logo-badge">v2.0</span>
            </div>

            <div className={`nav-menu ${isNavOpen ? 'nav-menu-open' : ''}`}>
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeIndex === item.id ? 'nav-item-active' : ''}`}
                  onClick={() => {
                    setActiveIndex(item.id);
                    setIsNavOpen(false);
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="nav-right">
              <a 
                href="https://t.me/xenboxstore"
                target="_blank"
                rel="noopener noreferrer"
                className="community-link"
              >
                <span className="community-icon">💬</span>
                <span className="community-text">加入社区</span>
              </a>
              
              <div className="nav-wallet">
                {wallet.isConnected ? (
                  <div className="wallet-connected">
                    <div className="wallet-status"></div>
                    <div className="wallet-details">
                      <span className="wallet-address">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </span>
                      <span className="wallet-network">
                        {xenbox.chainConfig?.eth || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleConnectWallet} 
                    disabled={wallet.isConnecting}
                    className="connect-btn"
                  >
                    <span className="connect-icon">🔗</span>
                    {wallet.isConnecting ? '连接中...' : '连接钱包'}
                  </button>
                )}
              </div>
            </div>

            <button 
              className="nav-toggle"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>

        {/* Error Display */}
        {(wallet.error || xenbox.error) && (
          <div className="error-container">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{wallet.error || xenbox.error}</span>
              <button className="error-action" onClick={() => window.location.reload()}>
                刷新页面
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="main-container">
          {!wallet.isConnected ? (
            <div className="hero-section">
              <div className="hero-content">
                <h1 className="hero-title">
                  <span className="title-gradient">开启您的</span>
                  <br />
                  <span className="title-main">区块链挖矿之旅</span>
                </h1>
                <p className="hero-description">
                  XenBox 是一个创新的去中心化挖矿平台，让您轻松参与区块链生态系统
                </p>
                <div className="hero-actions">
                  <button 
                    onClick={handleConnectWallet} 
                    disabled={wallet.isConnecting}
                    className="hero-btn primary"
                  >
                    <span className="btn-icon">🚀</span>
                    {wallet.isConnecting ? '连接中...' : '开始使用'}
                  </button>
                  <a href="https://t.me/xenboxstore" target="_blank" rel="noopener noreferrer" className="hero-btn secondary">
                    <span className="btn-icon">💬</span>
                    加入社区
                  </a>
                </div>
                <div className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-value">10K+</span>
                    <span className="stat-label">活跃用户</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">1M+</span>
                    <span className="stat-label">总铸造量</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">24/7</span>
                    <span className="stat-label">运行时间</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="content-wrapper">
              {renderActiveComponent()}
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        /* Hero Background */
        .hero-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
          overflow: hidden;
        }

        .hero-gradient {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at center, var(--primary-glow) 0%, transparent 50%);
          animation: rotate 30s linear infinite;
        }

        .hero-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, var(--accent-glow) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, var(--primary-glow) 0%, transparent 50%);
          opacity: 0.3;
        }

        @keyframes rotate {
          to { transform: rotate(360deg); }
        }

        /* Navigation */
        .nav-container {
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--space-lg);
          height: 80px;
          display: flex;
          align-items: center;
          gap: var(--space-xl);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-badge {
          font-size: 0.75rem;
          padding: 2px 8px;
          background: var(--accent);
          color: var(--bg-primary);
          border-radius: var(--radius-full);
          font-weight: 600;
        }

        .nav-menu {
          display: flex;
          gap: var(--space-xs);
          flex: 1;
          justify-content: center;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
          border-radius: var(--radius-lg);
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--gradient-primary);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .nav-item:hover {
          color: var(--text-primary);
          transform: translateY(-2px);
        }

        .nav-item:hover::before {
          opacity: 0.1;
        }

        .nav-item-active {
          color: var(--primary);
          background: var(--glass-bg);
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .nav-item-active::before {
          opacity: 0.2;
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .nav-label {
          display: block;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-left: auto;
        }

        .community-link {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: all var(--transition-base);
          backdrop-filter: blur(10px);
        }

        .community-link:hover {
          color: var(--primary);
          border-color: var(--primary);
          background: var(--bg-tertiary);
          transform: translateY(-2px);
        }

        .community-icon {
          font-size: 1.2rem;
        }

        .community-text {
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .wallet-connected {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
        }

        .wallet-status {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--success);
          animation: pulse 2s infinite;
        }

        .wallet-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .wallet-address {
          font-family: 'Space Grotesk', monospace;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .wallet-network {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .connect-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-lg);
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .connect-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--primary-glow);
        }

        .connect-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .connect-icon {
          font-size: 1.2rem;
        }

        .nav-toggle {
          display: none;
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .nav-toggle span {
          width: 24px;
          height: 2px;
          background: var(--text-primary);
          transition: all var(--transition-base);
        }

        /* Error Container */
        .error-container {
          margin: var(--space-md) var(--space-lg);
        }

        .error-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-lg);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(10px);
        }

        .error-icon {
          font-size: 1.5rem;
        }

        .error-message {
          flex: 1;
          color: var(--danger-light);
        }

        .error-action {
          padding: var(--space-xs) var(--space-md);
          background: var(--danger);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .error-action:hover {
          background: var(--danger-dark);
        }

        /* Main Container */
        .main-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-xl) var(--space-lg);
          min-height: calc(100vh - 80px);
        }

        /* Hero Section */
        .hero-section {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 180px);
          padding: var(--space-xl) 0;
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          animation: fadeIn 0.8s ease-out;
        }

        .hero-title {
          margin-bottom: var(--space-lg);
          animation: slideIn 0.6s ease-out;
        }

        .title-gradient {
          font-size: clamp(2rem, 4vw, 3rem);
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-main {
          font-size: clamp(3rem, 6vw, 5rem);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-xl);
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
          margin-bottom: var(--space-2xl);
        }

        .hero-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-xl);
          border-radius: var(--radius-lg);
          font-weight: 600;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all var(--transition-base);
          cursor: pointer;
          border: none;
        }

        .hero-btn.primary {
          background: var(--gradient-primary);
          color: white;
          box-shadow: 0 8px 24px var(--primary-glow);
        }

        .hero-btn.primary:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px var(--primary-glow);
        }

        .hero-btn.secondary {
          background: var(--glass-bg);
          color: var(--text-primary);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(10px);
        }

        .hero-btn.secondary:hover {
          background: var(--glass-border);
          transform: translateY(-3px);
        }

        .hero-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 1.3rem;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
          padding: var(--space-xl);
          background: var(--glass-bg);
          border-radius: var(--radius-xl);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-tertiary);
        }

        /* Content Wrapper */
        .content-wrapper {
          animation: fadeIn 0.5s ease-out;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .nav-content {
            padding: 0 var(--space-md);
          }

          .nav-menu {
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: var(--bg-secondary);
            flex-direction: column;
            padding: var(--space-md);
            transform: translateX(-100%);
            transition: transform var(--transition-base);
          }

          .nav-menu-open {
            transform: translateX(0);
          }

          .nav-toggle {
            display: flex;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .hero-btn {
            width: 100%;
            justify-content: center;
          }

          .hero-stats {
            grid-template-columns: repeat(1, 1fr);
          }
        }

        @media (max-width: 768px) {
          .nav-right {
            gap: var(--space-sm);
          }

          .community-text {
            display: none;
          }

          .community-link {
            padding: var(--space-sm);
          }
        }

        @media (max-width: 640px) {
          .nav-label {
            display: none;
          }

          .nav-item {
            padding: var(--space-sm);
          }

          .wallet-connected {
            padding: var(--space-sm);
          }

          .wallet-network {
            display: none;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default Home;