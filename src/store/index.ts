import { ActionTree, createStore } from "vuex";
import { Ether, Request } from "../network";
import { utils, log, BigNumber } from "../const";
import { toRaw } from "vue";

export interface App {
  userAddress: string;
  chainId: number;
  ether: Ether;
  request: Request;
  tokenMap: { [version: number]: { [tokenId: number]: Token } };
  loadAmount: number;
  maxLoadAmount: number;
  rankMap: { [day: number]: number };
  defaultTerm: number;
  chainMap: {
    [chainId: number]: {
      eth: string;
      xen: string;
      scan: string;
      weth: string;
      swap: string;
      poolList: string[];
    };
  };
  perEthAmount: BigNumber;
  feeMap: {
    [version: number]: { [amount: number]: number };
  };
  start: boolean;
}

export interface Token {
  start: number;
  end: number;
  time: number;
  term: number;
  mint: BigNumber;
}

export interface Box {
  tokenIdList: { version: number; tokenId: number }[];
}

export interface Search {
  tokenIdList: number[];
}

export interface Force {
  tokenIdList: number[];
}

export interface Table {
  totalToken: number;
  tokenAddress: string;
  xenAddress: string;
  poolBalance: BigNumber;
}

export interface Share {
  referFeePercent: number;
  reward: BigNumber;
  isRefer: Boolean;
  tokenIdList: number[];
}

export interface Storage {
  referMap: { [tokenId: number]: string };
}

export interface State {
  storage: Storage;
  app: App;
  box: Box;
  force: Force;
  search: Search;
  share: Share;
  table: Table;
}

const state: State = {
  storage: {
    referMap: {}
  },
  app: {
    userAddress: utils.num.min,
    chainId: 0,
    ether: new Ether(),
    request: new Request("https://xenbox.33357.xyz"),
    tokenMap: { 0: {}, 1: {} },
    loadAmount: 0,
    maxLoadAmount: 10,
    chainMap: {
      1: {
        eth: "ETH",
        xen: "XEN",
        scan: "https://etherscan.io/",
        weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        swap: "https://app.uniswap.org/#/tokens/ethereum/",
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
        swap:
          "https://pancakeswap.finance/swap?chain=bsc&outputCurrency=BNB&inputCurrency=",
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
        swap: "https://app.uniswap.org/#/tokens/polygon/",
        poolList: ["0x97FFB2574257280e0FB2FA522345F0E81fAae711"]
      }
    },
    defaultTerm: 365,
    rankMap: {},
    perEthAmount: BigNumber.from(0),
    feeMap: {
      0: {
        10: 0,
        20: 0,
        50: 0,
        100: 0
      },
      1: {
        10: 0,
        20: 0,
        50: 0,
        100: 0
      }
    },
    start: false
  },
  box: {
    tokenIdList: []
  },
  force: {
    tokenIdList: []
  },
  search: {
    tokenIdList: []
  },
  table: {
    totalToken: 0,
    tokenAddress: "",
    xenAddress: "",
    poolBalance: BigNumber.from(0)
  },
  share: {
    isRefer: false,
    referFeePercent: 0,
    reward: BigNumber.from(0),
    tokenIdList: []
  }
};

const actions: ActionTree<State, State> = {
  async start({ dispatch, state }, { chainId, refer }) {
    await toRaw(state.app.ether).load(chainId);
    if (state.app.ether.singer && state.app.ether.chainId) {
      state.app.userAddress = await toRaw(state.app.ether.singer).getAddress();
      state.app.chainId = state.app.ether.chainId;
    }
    const res = await toRaw(state.app.request).getRank(
      state.app.chainId,
      state.app.defaultTerm
    );
    state.app.rankMap[state.app.defaultTerm] = res.data.rank;
    await dispatch("setStorage");
    if (!state.storage.referMap[chainId] && utils.ether.isAddress(refer)) {
      state.storage.referMap[chainId] = refer;
    }
    if (state.app.ether.xenBoxUpgradeable) {
      [
        state.app.feeMap[1][10],
        state.app.feeMap[1][20],
        state.app.feeMap[1][50],
        state.app.feeMap[1][100],
        state.app.perEthAmount
      ] = await Promise.all([
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee10()).toNumber(),
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee20()).toNumber(),
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee50()).toNumber(),
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee100()).toNumber(),
        toRaw(state.app.ether).getEthPrice(state.app.chainId)
      ]);
    }
    if (state.app.ether.xenBox) {
      state.app.feeMap[0][10] = state.app.feeMap[0][20] = state.app.feeMap[0][50] = state.app.feeMap[0][100] = (
        await toRaw(state.app.ether.xenBox).fee()
      ).toNumber();
    }
    state.app.start = true;
    log("app start success!");
  },

  async setStorage({ state }) {
    const storageName = `${state.app.chainId}`;
    try {
      const storage = localStorage.getItem(storageName);
      if (storage) {
        utils.deep.clone(state.storage, JSON.parse(storage));
      } else {
        throw new Error("localStorage is empty!");
      }
    } catch (err) {
      localStorage.setItem(storageName, JSON.stringify(state.storage));
    }
    this.watch(
      state => state.storage,
      storage => {
        localStorage.setItem(storageName, JSON.stringify(storage));
      },
      {
        deep: true
      }
    );
  },

  async mint({ state }, { amount, term, refer, gasPrice }) {
    if (state.app.ether.xenBoxUpgradeable) {
      await toRaw(state.app.ether.xenBoxUpgradeable).mint(amount, term, refer, {
        gasPrice
      });
    }
  },

  async claim({ state }, { version, tokenId, term, gasPrice }) {
    if (version == 1 && state.app.ether.xenBoxUpgradeable) {
      await toRaw(state.app.ether.xenBoxUpgradeable).claim(tokenId, term, {
        gasPrice
      });
    } else if (version == 0 && state.app.ether.xenBox) {
      await toRaw(state.app.ether.xenBox).claim(tokenId, term, {
        gasPrice
      });
    }
  },

  async getReward({ state }) {
    if (state.app.ether.xenBoxUpgradeable) {
      await toRaw(state.app.ether.xenBoxUpgradeable).getReward();
    }
  },

  async force({ state }, { tokenId, term, gasPrice }) {
    if (state.app.ether.xenBoxUpgradeable) {
      await toRaw(state.app.ether.xenBoxUpgradeable).force(tokenId, term, {
        gasPrice
      });
    }
  },

  async getSearchData({ state, dispatch }, addressOrId: string) {
    if (state.app.ether.xenBoxUpgradeable && state.app.ether.xenBoxHelper) {
      let tokenIdList: number[] = [];
      if (utils.ether.isAddress(addressOrId)) {
        const totalToken = await toRaw(
          state.app.ether.xenBoxUpgradeable
        ).totalToken();
        if (totalToken.gt(BigNumber.from(0))) {
          tokenIdList = (
            await toRaw(state.app.ether.xenBoxHelper).getOwnedTokenIdList(
              toRaw(state.app.ether.xenBoxUpgradeable).address(),
              addressOrId,
              0,
              totalToken
            )
          ).map(tokenId => {
            return tokenId.toNumber();
          });
        }
      } else if (addressOrId != "") {
        tokenIdList = [Number(addressOrId)];
      }
      tokenIdList.forEach(async tokenId => {
        await dispatch("getTokenData", { version: 1, tokenId });
      });
      state.search.tokenIdList = tokenIdList;
    }
  },

  async getBoxData({ state, dispatch }) {
    if (state.app.ether.xenBoxUpgradeable && state.app.ether.xenBoxHelper) {
      let tokenIdList: { version: number; tokenId: number }[] = [];
      const totalToken = await toRaw(
        state.app.ether.xenBoxUpgradeable
      ).totalToken();
      log(totalToken)
      if (totalToken.gt(BigNumber.from(0))) {
        tokenIdList.push(... (
          await toRaw(state.app.ether.xenBoxHelper).getOwnedTokenIdList(
            toRaw(state.app.ether.xenBoxUpgradeable).address(),
            state.app.userAddress,
            0,
            totalToken
          )
        ).map(tokenId => {
          return { version: 1, tokenId: tokenId.toNumber() };
        }))
      }
      log(tokenIdList)
      if (state.app.ether.xenBox) {
        tokenIdList.push(
          ...(
            await toRaw(state.app.ether.xenBoxHelper).getOwnedTokenIdList(
              toRaw(state.app.ether.xenBox).address(),
              state.app.userAddress,
              0,
              await toRaw(state.app.ether.xenBox).totalToken()
            )
          ).map(tokenId => {
            return { version: 0, tokenId: tokenId.toNumber() };
          })
        );
      }
      log(tokenIdList)
      tokenIdList.forEach(async e => {
        await dispatch("getTokenData", e);
      });
      state.box.tokenIdList = tokenIdList;
    }
  },

  async getTableData({ state }) {
    if (state.app.ether.xenBoxUpgradeable && state.app.ether.xenBoxHelper) {
      state.table.tokenAddress = state.app.ether.xenBoxUpgradeable.address();
      [state.table.xenAddress, state.table.totalToken] = await Promise.all([
        state.app.ether.xenBoxUpgradeable.xenAddress(),
        (await state.app.ether.xenBoxUpgradeable.totalToken()).toNumber()
      ]);
      let pList: any[] = [];
      state.app.chainMap[state.app.chainId].poolList.forEach(poolAddress => {
        pList.push(
          toRaw(state.app.ether).getBalance(
            state.app.chainMap[state.app.chainId].weth,
            poolAddress
          )
        );
      });
      let poolBalance = BigNumber.from(0);
      (await Promise.all(pList)).forEach(balance => {
        poolBalance = poolBalance.add(balance);
      });
      state.table.poolBalance = poolBalance;
    }
  },

  async getForceData({ state, dispatch }) {
    if (state.app.ether.xenBoxUpgradeable && state.app.ether.xenBoxHelper) {
      let tokenIdList: number[] = [];
      const totalToken = await toRaw(
        state.app.ether.xenBoxUpgradeable
      ).totalToken();
      if (totalToken.gt(BigNumber.from(0))) {
        tokenIdList = (
          await toRaw(state.app.ether.xenBoxHelper).getForceTokenIdList(
            toRaw(state.app.ether.xenBoxUpgradeable).address(),
            0,
            totalToken
          )
        ).map(tokenId => {
          return tokenId.toNumber();
        });
      }
      tokenIdList.forEach(async e => {
        await dispatch("getTokenData", e);
      });
      state.force.tokenIdList = tokenIdList;
    }
  },

  async getShareData({ dispatch, state }) {
    if (state.app.ether.xenBoxHelper && state.app.ether.xenBoxUpgradeable) {
      let tokenIdList: number[] = [];
      state.share.referFeePercent = (
        await toRaw(state.app.ether.xenBoxUpgradeable).referFeePercent()
      ).toNumber();
      state.share.reward = await toRaw(
        state.app.ether.xenBoxUpgradeable
      ).rewardMap(state.app.userAddress);
      state.share.isRefer = await toRaw(
        state.app.ether.xenBoxUpgradeable
      ).isRefer(state.app.userAddress);
      const totalToken = await toRaw(
        state.app.ether.xenBoxUpgradeable
      ).totalToken();
      if (totalToken.gt(BigNumber.from(0))) {
        tokenIdList = (
          await toRaw(state.app.ether.xenBoxHelper).getReferTokenIdList(
            toRaw(state.app.ether.xenBoxUpgradeable).address(),
            state.app.userAddress,
            0,
            totalToken
          )
        ).map(tokenId => {
          return tokenId.toNumber();
        });
        const ownedTokenIdList = (
          await toRaw(state.app.ether.xenBoxHelper).getOwnedTokenIdList(
            toRaw(state.app.ether.xenBoxUpgradeable).address(),
            state.app.userAddress,
            0,
            totalToken
          )
        ).map(tokenId => {
          return tokenId.toNumber();
        });
        tokenIdList.forEach((tokenId, index) => {
          if (ownedTokenIdList.indexOf(tokenId) != -1) {
            tokenIdList.splice(index, 1);
          }
        });
        tokenIdList.forEach(async tokenId => {
          await dispatch("getTokenData", { version: 1, tokenId });
        });
      }
      state.share.tokenIdList = tokenIdList;
    }
  },

  async getTokenData({ state }, { version, tokenId }) {
    if (state.app.ether.xenBoxHelper) {
      if (!state.app.tokenMap[version][tokenId]) {
        state.app.tokenMap[version][tokenId] = {
          start: 0,
          end: 0,
          time: 0,
          term: 0,
          mint: BigNumber.from(0)
        };
        while (state.app.loadAmount >= state.app.maxLoadAmount) {
          await utils.func.sleep(100);
        }
        state.app.loadAmount++;
        let proxy: any;
        let userMints: any;
        if (version == 1 && state.app.ether.xenBoxUpgradeable) {
          const token = await toRaw(state.app.ether.xenBoxUpgradeable).tokenMap(
            tokenId
          );
          state.app.tokenMap[version][tokenId].end = token.end;
          state.app.tokenMap[version][tokenId].start = token.start;
          proxy = await toRaw(state.app.ether.xenBoxUpgradeable).proxyAddress(
            token.start
          );
          userMints = await toRaw(state.app.ether.xenBoxUpgradeable).userMints(
            tokenId
          );
        } else if (
          version == 0 &&
          state.app.ether.xenBox &&
          state.app.ether.xen
        ) {
          const token = await toRaw(state.app.ether.xenBox).tokenMap(tokenId);
          state.app.tokenMap[version][tokenId].end = token.end.toNumber();
          state.app.tokenMap[version][tokenId].start = token.start.toNumber();
          proxy = await toRaw(state.app.ether.xenBox).getProxyAddress(
            token.start
          );
          userMints = await toRaw(state.app.ether.xen).userMints(proxy);
        }
        state.app.tokenMap[version][
          tokenId
        ].time = userMints.maturityTs.toNumber();
        state.app.tokenMap[version][tokenId].term = userMints.term.toNumber();
        const mint = await state.app.ether.xenBoxHelper.calculateMintReward(
          proxy
        );
        state.app.tokenMap[version][tokenId].mint = mint.mul(
          state.app.tokenMap[version][tokenId].end -
          state.app.tokenMap[version][tokenId].start
        );
        state.app.loadAmount--;
      }
    }
  }
};

export default createStore({
  state,
  actions
});
