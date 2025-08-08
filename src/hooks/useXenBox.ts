import { useState, useEffect, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import { 
  XenClient, 
  XenBoxClient, 
  DeploymentInfo 
} from 'xenbox-sdk';
import { 
  XenBoxUpgradeableClient, 
  XenBoxHelperClient, 
  DeploymentInfo as DeploymentInfo2 
} from 'xenbox2-contract-sdk';
import { useWallet } from './useWallet';
import { log, utils } from '../const';

interface Token {
  start: number;
  end: number;
  time: number;
  term: number;
  mint: BigNumber;
}

interface XenBoxState {
  isInitialized: boolean;
  isLoading: boolean;
  defaultTerm: number;
  rankMap: { [day: number]: number };
  feeMap: { [version: number]: { [amount: number]: number } };
  perEthAmount: BigNumber; // 每个XEN值多少WETH (从Uniswap V2获取)
  tokenMap: { [version: number]: { [tokenId: number]: Token } };
  boxTokenList: { version: number; tokenId: number }[];
  forceTokenList: number[];
  searchTokenList: number[];
  shareTokenList: number[];
  shareReward: BigNumber;
  shareReferFeePercent: number;
  shareIsRefer: boolean;
  totalToken: number;
  tokenAddress: string;
  xenAddress: string;
  poolBalance: BigNumber;
  error: string | null;
}

const initialState: XenBoxState = {
  isInitialized: false,
  isLoading: false,
  defaultTerm: 365,
  rankMap: {},
  feeMap: {
    0: { 10: 0, 20: 0, 50: 0, 100: 0 },
    1: { 10: 0, 20: 0, 50: 0, 100: 0 }
  },
  perEthAmount: BigNumber.from(0),
  tokenMap: { 0: {}, 1: {} },
  boxTokenList: [],
  forceTokenList: [],
  searchTokenList: [],
  shareTokenList: [],
  shareReward: BigNumber.from(0),
  shareReferFeePercent: 0,
  shareIsRefer: false,
  totalToken: 0,
  tokenAddress: '',
  xenAddress: '',
  poolBalance: BigNumber.from(0),
  error: null
};

const CHAIN_CONFIG = {
  1: {
    eth: "ETH",
    xen: "XEN",
    scan: "https://etherscan.io/",
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    poolList: [
      "0x2a9d2ba41aba912316D16742f259412B681898Db",
      "0xC0d776E2223c9a2ad13433DAb7eC08cB9C5E76ae"
    ]
  },
  56: {
    eth: "BNB",
    xen: "BXEN",
    scan: "https://bscscan.com/",
    weth: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    poolList: [
      "0x9F8ca02962dE84a7094c381d66efD46e01c2b8f0",
      "0xaaa77F0aCDc01CbE71e74f177EFd38697B5a7FEB"
    ]
  },
  137: {
    eth: "MATIC",
    xen: "MXEN",
    scan: "https://polygonscan.com/",
    weth: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    poolList: ["0x97FFB2574257280e0FB2FA522345F0E81fAae711"]
  }
};

export const useXenBox = () => {
  const wallet = useWallet();
  const [state, setState] = useState<XenBoxState>(initialState);

  // 创建合约客户端
  const contracts = useMemo(() => {
    if (!wallet.signer || !wallet.chainId) return null;

    const contracts: any = {};
    
    try {
      // V1 合约 (所有链)
      if (DeploymentInfo2[wallet.chainId]) {
        contracts.xenBoxUpgradeable = new XenBoxUpgradeableClient(
          wallet.signer,
          DeploymentInfo2[wallet.chainId]["XenBoxUpgradeable"].proxyAddress
        );
        contracts.xenBoxHelper = new XenBoxHelperClient(
          wallet.signer,
          DeploymentInfo2[wallet.chainId]["XenBoxHelper"].proxyAddress
        );
        contracts.xen = new XenClient(wallet.signer);
      }

      // V0 合约 (仅以太坊)
      if (wallet.chainId === 1 && DeploymentInfo[wallet.chainId]) {
        contracts.xenBox = new XenBoxClient(
          wallet.signer,
          DeploymentInfo[wallet.chainId]["XenBox"].proxyAddress
        );
      }

      return contracts;
    } catch (error) {
      console.error('创建合约客户端失败:', error);
      return null;
    }
  }, [wallet.signer, wallet.chainId]);

  // 初始化
  const initialize = async () => {
    if (!wallet.isConnected || !contracts) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 获取排名数据
      const rankData = await fetchRankData(wallet.chainId, state.defaultTerm);
      
      // 获取费用数据
      const feeData = await fetchFeeData(contracts);
      
      // 获取XEN/WETH价格
      const perEthAmount = await fetchEthPrice(wallet.chainId);

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        rankMap: { [state.defaultTerm]: rankData },
        feeMap: { ...prev.feeMap, ...feeData },
        perEthAmount: perEthAmount || BigNumber.from(0)
      }));

      log('XenBox 初始化成功，XEN价格:', perEthAmount ? utils.format.bigToString(perEthAmount, 18, 8) : '获取失败');
    } catch (error: any) {
      console.error('XenBox 初始化失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '初始化失败'
      }));
    }
  };

  // 获取排名数据
  const fetchRankData = async (chainId: number, term: number): Promise<number> => {
    try {
      const response = await fetch(`/api/rank/${chainId}/${term}`);
      const data = await response.json();
      return data.rank || 1000000;
    } catch (error) {
      console.warn('获取排名数据失败:', error);
      return 1000000;
    }
  };

  // 获取费用数据
  const fetchFeeData = async (contracts: any) => {
    const feeData: any = {};

    try {
      if (contracts.xenBoxUpgradeable) {
        const [fee10, fee20, fee50, fee100] = await Promise.all([
          contracts.xenBoxUpgradeable.fee10(),
          contracts.xenBoxUpgradeable.fee20(),
          contracts.xenBoxUpgradeable.fee50(),
          contracts.xenBoxUpgradeable.fee100()
        ]);

        feeData[1] = {
          10: fee10.toNumber(),
          20: fee20.toNumber(),
          50: fee50.toNumber(),
          100: fee100.toNumber()
        };
      }

      if (contracts.xenBox) {
        const fee = await contracts.xenBox.fee();
        const feeNumber = fee.toNumber();
        feeData[0] = {
          10: feeNumber,
          20: feeNumber,
          50: feeNumber,
          100: feeNumber
        };
      }
    } catch (error) {
      console.warn('获取费用数据失败:', error);
    }

    return feeData;
  };

  // 从Uniswap V2获取XEN/WETH价格
  const fetchEthPrice = async (chainId: number): Promise<BigNumber | null> => {
    try {
      if (chainId !== 1 || !wallet.signer) return null;
      
      const pairAddress = '0xC0d776E2223c9a2ad13433DAb7eC08cB9C5E76ae';
      
      // Uniswap V2 Pair ABI - 只需要getReserves方法
      const pairABI = [
        'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
        'function token0() external view returns (address)',
        'function token1() external view returns (address)'
      ];
      
      const pairContract = new ethers.Contract(pairAddress, pairABI, wallet.signer);
      
      // 获取储备量和代币地址
      const [reserves, token0Address, token1Address] = await Promise.all([
        pairContract.getReserves(),
        pairContract.token0(),
        pairContract.token1()
      ]);
      
      const { reserve0, reserve1 } = reserves;
      
      // 获取WETH地址以确定哪个是XEN，哪个是WETH
      const wethAddress = CHAIN_CONFIG[1].weth.toLowerCase();
      const isToken0WETH = token0Address.toLowerCase() === wethAddress;
      
      // 计算价格：每个XEN值多少WETH
      let xenReserve: BigNumber;
      let wethReserve: BigNumber;
      
      if (isToken0WETH) {
        wethReserve = reserve0;
        xenReserve = reserve1;
      } else {
        wethReserve = reserve1;
        xenReserve = reserve0;
      }
      
      // 价格 = WETH储备量 / XEN储备量 
      // 返回每个XEN值多少WETH (18位精度)
      if (xenReserve.gt(0)) {
        return wethReserve.mul(utils.num.ether).div(xenReserve);
      }
      
      return null;
    } catch (error) {
      console.warn('获取Uniswap V2价格失败:', error);
      return null;
    }
  };

  // 铸造
  const mint = async (params: { amount: number; term: number; refer?: string; gasPrice?: BigNumber }) => {
    if (!contracts?.xenBoxUpgradeable) {
      throw new Error('合约未初始化');
    }

    return await contracts.xenBoxUpgradeable.mint(
      params.amount,
      params.term,
      params.refer || utils.num.min,
      { gasPrice: params.gasPrice }
    );
  };

  // 开启宝箱
  const claim = async (params: { version: number; tokenId: number; term: number; gasPrice?: BigNumber }) => {
    if (params.version === 1 && contracts?.xenBoxUpgradeable) {
      return await contracts.xenBoxUpgradeable.claim(params.tokenId, params.term, {
        gasPrice: params.gasPrice
      });
    } else if (params.version === 0 && contracts?.xenBox) {
      return await contracts.xenBox.claim(params.tokenId, params.term, {
        gasPrice: params.gasPrice
      });
    }
    
    throw new Error('不支持的合约版本');
  };

  // 获取宝箱列表
  const fetchBoxList = async () => {
    if (!contracts?.xenBoxHelper || !wallet.address) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      let tokenIdList: { version: number; tokenId: number }[] = [];

      // V1 宝箱
      if (contracts.xenBoxUpgradeable) {
        const totalToken = await contracts.xenBoxUpgradeable.totalToken();
        if (totalToken.gt(0)) {
          const ownedTokens = await contracts.xenBoxHelper.getOwnedTokenIdList(
            contracts.xenBoxUpgradeable.address(),
            wallet.address,
            0,
            totalToken
          );
          
          tokenIdList.push(...ownedTokens.map((tokenId: BigNumber) => ({
            version: 1,
            tokenId: tokenId.toNumber()
          })));
        }
      }

      // V0 宝箱
      if (contracts.xenBox) {
        const totalTokenV0 = await contracts.xenBox.totalToken();
        if (totalTokenV0.gt(0)) {
          const ownedTokensV0 = await contracts.xenBoxHelper.getOwnedTokenIdList(
            contracts.xenBox.address(),
            wallet.address,
            0,
            totalTokenV0
          );
          
          tokenIdList.push(...ownedTokensV0.map((tokenId: BigNumber) => ({
            version: 0,
            tokenId: tokenId.toNumber()
          })));
        }
      }

      setState(prev => ({
        ...prev,
        boxTokenList: tokenIdList,
        isLoading: false
      }));

      // 加载token详情
      for (const { version, tokenId } of tokenIdList) {
        await fetchTokenData(version, tokenId);
      }
      
    } catch (error: any) {
      console.error('获取宝箱列表失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '获取宝箱列表失败'
      }));
    }
  };

  // 获取token数据
  const fetchTokenData = async (version: number, tokenId: number) => {
    if (!contracts?.xenBoxHelper || state.tokenMap[version][tokenId]) return;

    try {
      let proxy: any;
      let userMints: any;
      let tokenData: any;

      if (version === 1 && contracts.xenBoxUpgradeable) {
        tokenData = await contracts.xenBoxUpgradeable.tokenMap(tokenId);
        proxy = await contracts.xenBoxUpgradeable.proxyAddress(tokenData.start);
        userMints = await contracts.xenBoxUpgradeable.userMints(tokenId);
      } else if (version === 0 && contracts.xenBox && contracts.xen) {
        tokenData = await contracts.xenBox.tokenMap(tokenId);
        proxy = await contracts.xenBox.getProxyAddress(tokenData.start);
        userMints = await contracts.xen.userMints(proxy);
      }

      if (tokenData && userMints) {
        const mint = await contracts.xenBoxHelper.calculateMintReward(proxy);
        const tokenCount = version === 1 ? tokenData.end - tokenData.start : tokenData.end.toNumber() - tokenData.start.toNumber();
        
        const token: Token = {
          start: version === 1 ? tokenData.start : tokenData.start.toNumber(),
          end: version === 1 ? tokenData.end : tokenData.end.toNumber(),
          time: userMints.maturityTs.toNumber(),
          term: userMints.term.toNumber(),
          mint: mint.mul(tokenCount)
        };

        setState(prev => ({
          ...prev,
          tokenMap: {
            ...prev.tokenMap,
            [version]: {
              ...prev.tokenMap[version],
              [tokenId]: token
            }
          }
        }));
      }
    } catch (error) {
      console.error(`获取token数据失败 ${version}:${tokenId}:`, error);
    }
  };

  // 计算铸造收益
  const calculateMintReward = async (term: number): Promise<BigNumber> => {
    if (!contracts?.xenBoxHelper || !state.rankMap[state.defaultTerm]) {
      return BigNumber.from(0);
    }

    try {
      return await contracts.xenBoxHelper.calculateMintRewardNew(
        Math.ceil((state.rankMap[state.defaultTerm] * term) / state.defaultTerm),
        term
      );
    } catch (error) {
      console.error('计算铸造收益失败:', error);
      return BigNumber.from(0);
    }
  };

  // 重铸
  const force = async (params: { tokenId: number; term: number; gasPrice?: BigNumber }) => {
    if (!contracts?.xenBoxUpgradeable) {
      throw new Error('合约未初始化');
    }

    return await contracts.xenBoxUpgradeable.force(
      params.tokenId,
      params.term,
      { gasPrice: params.gasPrice }
    );
  };

  // 获取重铸列表
  const fetchForceList = async () => {
    if (!contracts?.xenBoxHelper || !contracts?.xenBoxUpgradeable) return;

    try {
      let forceTokenIds: BigNumber[] = [];
      const totalToken = await contracts.xenBoxUpgradeable.totalToken();
      if (totalToken.gt(0)) {
        forceTokenIds = await contracts.xenBoxHelper.getForceTokenIdList(
          contracts.xenBoxUpgradeable.address(),
          0,
          totalToken
        );
      }
      
      setState(prev => ({
        ...prev,
        forceTokenList: forceTokenIds.map((id: BigNumber) => id.toNumber())
      }));

      // 加载重铸token的数据
      for (const tokenId of forceTokenIds) {
        await fetchTokenData(1, tokenId.toNumber());
      }
    } catch (error) {
      console.error('获取重铸列表失败:', error);
    }
  };

  // 搜索
  const search = async (input: string) => {
    if (!contracts?.xenBoxHelper || !contracts?.xenBoxUpgradeable || !input.trim()) {
      setState(prev => ({ ...prev, searchTokenList: [] }));
      return;
    }

    try {
      let tokenIds: BigNumber[] = [];
      
      // 检查是否是地址（简化的检查）
      if (input.startsWith('0x') && input.length === 42) {
        // 搜索地址
        const totalToken = await contracts.xenBoxUpgradeable.totalToken();
        if (totalToken.gt(0)) {
          tokenIds = await contracts.xenBoxHelper.getOwnedTokenIdList(
            contracts.xenBoxUpgradeable.address(),
            input,
            0,
            totalToken
          );
        }
      } else {
        // 搜索token ID
        const tokenId = parseInt(input);
        if (!isNaN(tokenId) && tokenId >= 0) {
          const totalToken = await contracts.xenBoxUpgradeable.totalToken();
          if (tokenId < totalToken.toNumber()) {
            tokenIds = [BigNumber.from(tokenId)];
          }
        }
      }

      const searchResults = tokenIds.map((id: BigNumber) => id.toNumber());
      setState(prev => ({ ...prev, searchTokenList: searchResults }));
      
      // 加载搜索结果的token数据
      for (const tokenId of searchResults) {
        await fetchTokenData(1, tokenId);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      setState(prev => ({ ...prev, searchTokenList: [] }));
    }
  };

  // 获取邀请数据
  const fetchShareData = async () => {
    if (!contracts?.xenBoxHelper || !contracts?.xenBoxUpgradeable || !wallet.address) return;

    try {
      // 获取基本邀请信息
      const [referFeePercent, reward, isRefer] = await Promise.all([
        contracts.xenBoxUpgradeable.referFeePercent(),
        contracts.xenBoxUpgradeable.rewardMap(wallet.address),
        contracts.xenBoxUpgradeable.isRefer(wallet.address)
      ]);

      // 获取邀请的token列表
      let referredTokens: BigNumber[] = [];
      const totalToken = await contracts.xenBoxUpgradeable.totalToken();
      if (totalToken.gt(0)) {
        referredTokens = await contracts.xenBoxHelper.getReferTokenIdList(
          contracts.xenBoxUpgradeable.address(),
          wallet.address,
          0,
          totalToken
        );
      }

      setState(prev => ({
        ...prev,
        shareReward: reward,
        shareReferFeePercent: referFeePercent.toNumber(),
        shareIsRefer: isRefer,
        shareTokenList: referredTokens.map((id: BigNumber) => id.toNumber())
      }));

      // 加载邀请token的数据
      for (const tokenId of referredTokens) {
        await fetchTokenData(1, tokenId.toNumber());
      }
    } catch (error) {
      console.error('获取邀请数据失败:', error);
    }
  };

  // 领取邀请奖励
  const claimShareReward = async () => {
    if (!contracts?.xenBoxUpgradeable) {
      throw new Error('合约未初始化');
    }

    return await contracts.xenBoxUpgradeable.getReward();
  };

  // 获取数据统计
  const fetchTableData = async () => {
    if (!contracts?.xenBoxUpgradeable || !wallet.chainId) return;

    try {
      const tokenAddress = contracts.xenBoxUpgradeable.address();
      const [xenAddress, totalToken] = await Promise.all([
        contracts.xenBoxUpgradeable.xenAddress(),
        contracts.xenBoxUpgradeable.totalToken()
      ]);

      // 获取资金池余额
      let poolBalance = BigNumber.from(0);
      const chainConfig = CHAIN_CONFIG[wallet.chainId as keyof typeof CHAIN_CONFIG];
      
      if (chainConfig?.poolList && chainConfig?.weth && wallet.signer) {
        try {
          // 创建WETH合约实例
          const wethContract = new ethers.Contract(
            chainConfig.weth,
            ['function balanceOf(address) view returns (uint256)'],
            wallet.signer
          );
          
          // 查询所有流动性池的WETH余额
          const poolBalancePromises = chainConfig.poolList.map(poolAddress => 
            wethContract.balanceOf(poolAddress)
          );
          
          const poolBalances = await Promise.all(poolBalancePromises);
          poolBalance = poolBalances.reduce(
            (total: BigNumber, balance: BigNumber) => total.add(balance), 
            BigNumber.from(0)
          );
        } catch (error) {
          console.warn('获取WETH资金池余额失败:', error);
          // 如果获取失败，保持为0
        }
      }

      setState(prev => ({
        ...prev,
        totalToken: totalToken.toNumber(),
        tokenAddress,
        xenAddress,
        poolBalance
      }));
    } catch (error) {
      console.error('获取数据统计失败:', error);
    }
  };

  // 添加代币到钱包
  const addTokenToWallet = async (symbol: string) => {
    if (!wallet.signer || !wallet.signer.provider || !state.xenAddress) return;

    try {
      await (wallet.signer.provider as any).send('wallet_watchAsset', {
        type: 'ERC20',
        options: {
          address: state.xenAddress,
          symbol,
          decimals: 18,
        },
      });
    } catch (error) {
      console.error('添加代币失败:', error);
      throw error;
    }
  };

  // 监听钱包连接状态
  useEffect(() => {
    if (wallet.isConnected && contracts) {
      initialize();
    } else {
      setState(initialState);
    }
  }, [wallet.isConnected, contracts]);

  return {
    ...state,
    chainConfig: CHAIN_CONFIG[wallet.chainId as keyof typeof CHAIN_CONFIG] || CHAIN_CONFIG[1],
    mint,
    claim,
    force,
    search,
    fetchBoxList,
    fetchForceList,
    fetchShareData,
    claimShareReward,
    fetchTableData,
    addTokenToWallet,
    calculateMintReward,
    initialize
  };
};