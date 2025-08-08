import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { log } from '../const';

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string;
  chainId: number;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  error: string | null;
}

const initialState: WalletState = {
  isConnected: false,
  isConnecting: false,
  address: '',
  chainId: 0,
  provider: null,
  signer: null,
  error: null
};

export const useWallet = () => {
  const [state, setState] = useState<WalletState>(initialState);

  // 检查是否有 MetaMask
  const checkMetaMask = useCallback(async () => {
    const ethereum = await detectEthereumProvider();
    return ethereum !== null;
  }, []);

  // 连接钱包
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // 检查 MetaMask
      const hasMetaMask = await checkMetaMask();
      if (!hasMetaMask) {
        throw new Error('请安装 MetaMask 钱包');
      }

      // 获取 ethereum 对象
      const ethereum = window.ethereum;
      if (!ethereum) {
        throw new Error('未检测到 MetaMask');
      }

      // 请求连接账户
      await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // 创建 provider 和 signer
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      
      // 获取地址和链ID
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      setState({
        isConnected: true,
        isConnecting: false,
        address,
        chainId,
        provider,
        signer,
        error: null
      });

      log('钱包连接成功:', { address, chainId });
      
    } catch (error: any) {
      console.error('钱包连接失败:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || '连接钱包失败'
      }));
    }
  }, [checkMetaMask]);

  // 断开连接
  const disconnect = useCallback(() => {
    setState(initialState);
    log('钱包已断开连接');
  }, []);

  // 切换网络
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!state.provider) return;

    try {
      const ethereum = window.ethereum;
      if (!ethereum) return;

      const chainIdHex = `0x${targetChainId.toString(16)}`;

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });

      log('网络切换成功:', targetChainId);
    } catch (error: any) {
      console.error('网络切换失败:', error);
      setState(prev => ({
        ...prev,
        error: '网络切换失败'
      }));
    }
  }, [state.provider]);

  // 监听账户和网络变化
  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      log('账户变化:', accounts);
      if (accounts.length === 0) {
        disconnect();
      } else if (state.isConnected && accounts[0] !== state.address) {
        // 重新连接以更新状态
        connect();
      }
    };

    const handleChainChanged = (chainId: string) => {
      log('链变化:', chainId);
      if (state.isConnected) {
        // 重新连接以更新状态
        connect();
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.isConnected, state.address, connect, disconnect]);

  // 页面加载时检查是否已连接
  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = window.ethereum;
      if (!ethereum) return;

      try {
        const accounts = await ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts && accounts.length > 0) {
          // 已经连接，恢复连接状态
          await connect();
        }
      } catch (error) {
        console.warn('检查连接状态失败:', error);
      }
    };

    checkConnection();
  }, [connect]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    hasMetaMask: checkMetaMask
  };
};

// 声明全局 ethereum 类型
declare global {
  interface Window {
    ethereum?: any;
  }
}