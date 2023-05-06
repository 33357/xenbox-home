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
  rankMap: { [day: number]: number };
  defaultTerm: number;
  symbolMap: {
    [chainId: number]: {
      eth: string;
      xen: string;
    };
  };
  start: boolean;
}

export interface Mint {
  perEthAmount: BigNumber;
  feeMap: {
    [version: number]: { [amount: number]: number };
  };
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

export interface Share {
  tokenIdList: number[];
}

export interface Storage {
  referMap: { [tokenId: number]: string };
}

export interface State {
  storage: Storage;
  app: App;
  mint: Mint;
  box: Box;
  search: Search;
  share: Share;
}

const state: State = {
  storage: {
    referMap: {}
  },
  app: {
    userAddress: utils.num.min,
    chainId: 0,
    ether: new Ether(),
    request: new Request("https://xenbox.store"),
    tokenMap: { 0: {}, 1: {} },
    symbolMap: {
      1: { eth: "ETH", xen: "XEN" },
      56: { eth: "BNB", xen: "BXEN" },
      137: { eth: "MATIC", xen: "MXEN" }
    },
    defaultTerm: 100,
    rankMap: {},
    start: false
  },
  mint: {
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
    }
  },
  box: {
    tokenIdList: []
  },
  search: {
    tokenIdList: []
  },
  share: {
    tokenIdList: []
  }
};

const actions: ActionTree<State, State> = {
  async start({ state, dispatch }, { chainId, refer }) {
    try {
      await dispatch("setApp", { chainId, refer });
      await dispatch("getMintData");
      state.app.start = true;
      log("app start success!");
    } catch (err) {
      log(err);
    }
  },

  async setApp({ dispatch, state }, { chainId, refer }) {
    await toRaw(state.app.ether).load(chainId);
    if (state.app.ether.singer && state.app.ether.chainId) {
      state.app.userAddress = await toRaw(state.app.ether.singer).getAddress();
      state.app.chainId = state.app.ether.chainId;
    }
    const res = await toRaw(state.app.request).getRank30(
      state.app.chainId,
      state.app.defaultTerm
    );
    state.app.rankMap[state.app.defaultTerm] = res.data.rank;
    await dispatch("setStorage");
    if (!state.storage.referMap[chainId] && utils.ether.isAddress(refer)) {
      state.storage.referMap[chainId] = refer;
    }
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

  async getMintData({ state }) {
    if (state.app.ether.xenBoxUpgradeable && state.app.ether.xenBoxHelper) {
      [
        state.mint.feeMap[1][10],
        state.mint.feeMap[1][20],
        state.mint.feeMap[1][50],
        state.mint.feeMap[1][100],
        state.mint.perEthAmount
      ] = await Promise.all([
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee10()).toNumber(),
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee20()).toNumber(),
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee50()).toNumber(),
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee100()).toNumber(),
        toRaw(state.app.ether).getEthPrice(state.app.chainId)
      ]);
    }
    if (state.app.ether.xenBox) {
      state.mint.feeMap[0][10] = state.mint.feeMap[0][20] = state.mint.feeMap[0][50] = state.mint.feeMap[0][100] = (
        await toRaw(state.app.ether.xenBox).fee()
      ).toNumber();
    }
  },

  async getSearchData({ state, dispatch }, addressOrId: string) {
    if (state.app.ether.xenBoxUpgradeable && state.app.ether.xenBoxHelper) {
      if (utils.ether.isAddress(addressOrId)) {
        state.search.tokenIdList = (
          await toRaw(state.app.ether.xenBoxHelper).getOwnedTokenIdList(
            toRaw(state.app.ether.xenBoxUpgradeable).address(),
            addressOrId,
            0,
            await toRaw(state.app.ether.xenBoxUpgradeable).totalToken()
          )
        ).map(tokenId => {
          return tokenId.toNumber();
        });
      } else if (addressOrId != "") {
        state.search.tokenIdList = [Number(addressOrId)];
      }
      state.search.tokenIdList.forEach(async tokenId => {
        dispatch("getTokenData", { version: 1, tokenId });
      });
    }
  },

  async getBoxData({ state, dispatch }) {
    if (state.app.ether.xenBoxUpgradeable && state.app.ether.xenBoxHelper) {
      state.box.tokenIdList = (
        await toRaw(state.app.ether.xenBoxHelper).getOwnedTokenIdList(
          toRaw(state.app.ether.xenBoxUpgradeable).address(),
          state.app.userAddress,
          0,
          await toRaw(state.app.ether.xenBoxUpgradeable).totalToken()
        )
      ).map(tokenId => {
        return { version: 1, tokenId: tokenId.toNumber() };
      });
      if (state.app.ether.xenBox) {
        state.box.tokenIdList = [
          ...state.box.tokenIdList,
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
        ];
      }
      state.box.tokenIdList.forEach(async e => {
        dispatch("getTokenData", e);
      });
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
      }
    }
  }
};

export default createStore({
  state,
  actions
});
