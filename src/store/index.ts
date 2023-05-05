import { ActionTree, createStore } from "vuex";
import { Ether, Request } from "../network";
import { utils, log, BigNumber } from "../const";
import { toRaw } from "vue";

export interface App {
  userAddress: string;
  refer: { [chainId: number]: string };
  chainId: number;
  ether: Ether;
  request: Request;
  tokenMap: { [tokenId: number]: Token };
  rankMap: { [day: number]: number };
  start: boolean;
}

export interface Mint {
  fee: {
    [amount: number]: number;
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
  tokenIdList: number[];
}

export interface Search {
  tokenIdList: number[];
}

export interface Share {
  tokenIdList: number[];
}

export interface State {
  app: App;
  mint: Mint;
  box: Box;
  search: Search;
  share: Share;
}

const state: State = {
  app: {
    userAddress: utils.num.min,
    refer: {},
    chainId: 0,
    ether: new Ether(),
    request: new Request("https://xenbox.store"),
    tokenMap: {},
    rankMap: {},
    start: false
  },
  mint: {
    fee: {
      10: 0,
      20: 0,
      50: 0,
      100: 0
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
  async start({ state, dispatch }) {
    try {
      await dispatch("setApp");
      await dispatch("getMintData");
      state.app.start = true;
      log("app start success!");
    } catch (err) {
      log(err);
    }
  },

  async setApp({ state }) {
    await toRaw(state.app.ether).load();
    if (state.app.ether.singer) {
      state.app.userAddress = await toRaw(state.app.ether.singer).getAddress();
    }
    if (state.app.ether.chainId) {
      state.app.chainId = state.app.ether.chainId;
    }
    const res = await toRaw(state.app.request).getRank30(state.app.chainId);
    state.app.rankMap[30] = res.data.rank;
  },

  async mint({ state }, { amount, term, refer, gasPrice }) {
    if (state.app.ether.xenBoxUpgradeable) {
      await toRaw(state.app.ether.xenBoxUpgradeable).mint(amount, term, refer, {
        gasPrice
      });
    }
  },

  async claim({ state }, { tokenId, term, gasPrice }) {
    if (state.app.ether.xenBoxUpgradeable && tokenId) {
      await toRaw(state.app.ether.xenBoxUpgradeable).claim(tokenId, term, {
        gasPrice
      });
    } else if (state.app.ether.xenBox && tokenId) {
      await toRaw(state.app.ether.xenBox).claim(tokenId, term, {
        gasPrice
      });
    }
  },

  async getMintData({ state }) {
    if (state.app.ether.xenBoxUpgradeable) {
      [
        state.mint.fee[10],
        state.mint.fee[20],
        state.mint.fee[50],
        state.mint.fee[100]
      ] = await Promise.all([
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee10()).toNumber(),
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee20()).toNumber(),
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee50()).toNumber(),
        (await toRaw(state.app.ether.xenBoxUpgradeable).fee100()).toNumber()
      ]);
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
        dispatch("getTokenData", tokenId);
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
        return tokenId.toNumber();
      });
      state.box.tokenIdList.forEach(async tokenId => {
        dispatch("getTokenData", tokenId);
      });
    }
  },

  async getTokenData({ state }, tokenId: number) {
    if (state.app.ether.xenBoxUpgradeable && state.app.ether.xenBoxHelper) {
      if (!state.app.tokenMap[tokenId]) {
        state.app.tokenMap[tokenId] = {
          start: 0,
          end: 0,
          time: 0,
          term: 0,
          mint: BigNumber.from(0)
        };
        const token = await toRaw(state.app.ether.xenBoxUpgradeable).tokenMap(
          tokenId
        );
        state.app.tokenMap[tokenId].end = token.end;
        state.app.tokenMap[tokenId].start = token.start;
        const proxy = await toRaw(
          state.app.ether.xenBoxUpgradeable
        ).proxyAddress(token.start);
        const userMints = await toRaw(
          state.app.ether.xenBoxUpgradeable
        ).userMints(tokenId);
        state.app.tokenMap[tokenId].time = userMints.maturityTs.toNumber();
        state.app.tokenMap[tokenId].term = userMints.term.toNumber();
        const mint = await state.app.ether.xenBoxHelper.calculateMintReward(
          proxy
        );
        state.app.tokenMap[tokenId].mint = mint.mul(
          state.app.tokenMap[tokenId].end - state.app.tokenMap[tokenId].start
        );
      }
    }
  }
};

export default createStore({
  state,
  actions
});
