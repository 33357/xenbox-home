import { ActionTree, createStore } from "vuex";
import { Ether, Request } from "../network";
import { utils, log, BigNumber } from "../const";
import { toRaw } from "vue";

export interface App {
  userAddress: string;
  chainId: number;
  ether: Ether;
  request: Request;
  tokenMap: { [tokenId: number]: Token };
  rankMap: { [day: number]: number };
  start: boolean;
}

export interface Mint {
  fee: number;
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

export interface State {
  app: App;
  mint: Mint;
  box: Box;
  search: Search;
}

const state: State = {
  app: {
    userAddress: utils.num.min,
    chainId: 0,
    ether: new Ether(),
    request: new Request("https://xenbox.store"),
    tokenMap: {},
    rankMap: {},
    start: false,
  },
  mint: {
    fee: 0,
  },
  box: {
    tokenIdList: [],
  },
  search: {
    tokenIdList: [],
  },
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
    const res = await toRaw(state.app.request).getRank30();
    state.app.rankMap[30] = res.data.rank;
  },

  async mint({ state }, { amount, term, maxFeePerGas, maxPriorityFeePerGas }) {
    if (state.app.ether.xenBox) {
      await toRaw(state.app.ether.xenBox).mint(amount, term, {
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
    }
  },

  async claim(
    { state },
    { tokenId, term, maxFeePerGas, maxPriorityFeePerGas }
  ) {
    if (state.app.ether.xenBox) {
      await toRaw(state.app.ether.xenBox).claim(tokenId, term, {
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
    }
  },

  async getMintData({ state }) {
    if (state.app.ether.xenBox) {
      state.mint.fee = (await toRaw(state.app.ether.xenBox).fee()).toNumber();
    }
  },

  async getSearchData({ state, dispatch }, addressOrId: string) {
    if (state.app.ether.xenBox && state.app.ether.xenBoxHelper) {
      if (utils.ether.isAddress(addressOrId)) {
        state.search.tokenIdList = (
          await toRaw(state.app.ether.xenBoxHelper).getOwnedTokenIdList(
            toRaw(state.app.ether.xenBox).address(),
            addressOrId,
            0,
            await toRaw(state.app.ether.xenBox).totalToken()
          )
        ).map((tokenId) => {
          return tokenId.toNumber();
        });
      } else if (addressOrId != "") {
        state.search.tokenIdList = [Number(addressOrId)];
      }
      state.search.tokenIdList.forEach(async (tokenId) => {
        dispatch("getTokenData", tokenId);
      });
    }
  },

  async getBoxData({ state, dispatch }) {
    if (state.app.ether.xenBox && state.app.ether.xenBoxHelper) {
      state.box.tokenIdList = (
        await toRaw(state.app.ether.xenBoxHelper).getOwnedTokenIdList(
          toRaw(state.app.ether.xenBox).address(),
          state.app.userAddress,
          0,
          await toRaw(state.app.ether.xenBox).totalToken()
        )
      ).map((tokenId) => {
        return tokenId.toNumber();
      });
      state.box.tokenIdList.forEach(async (tokenId) => {
        dispatch("getTokenData", tokenId);
      });
    }
  },

  async getTokenData({ state }, tokenId: number) {
    if (
      state.app.ether.xenBox &&
      state.app.ether.xen &&
      state.app.ether.xenBoxHelper
    ) {
      if (!state.app.tokenMap[tokenId]) {
        state.app.tokenMap[tokenId] = {
          start: 0,
          end: 0,
          time: 0,
          term: 0,
          mint: BigNumber.from(0),
        };
        const token = await toRaw(state.app.ether.xenBox).tokenMap(tokenId);
        state.app.tokenMap[tokenId].end = token.end.toNumber();
        state.app.tokenMap[tokenId].start = token.start.toNumber();
        const proxy = await toRaw(state.app.ether.xenBox).getProxyAddress(
          token.start
        );
        const userMints = await toRaw(state.app.ether.xen).userMints(proxy);
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
  },
};

export default createStore({
  state,
  actions,
});
