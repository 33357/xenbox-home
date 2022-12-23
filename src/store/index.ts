import { ActionTree, createStore } from "vuex";
import { Ether } from "../network";
import { utils, log, BigNumber } from "../const";
import { toRaw } from "vue";
import { ElMessage, ElNotification } from "element-plus";
import { XenBoxModel } from "xenbox-sdk";

export interface App {
  userAddress: string;
  chainId: number;
  ether: Ether;
}

export interface Mint {}

export interface Box {
  tokenIdList: BigNumber[];
  tokenMap: { [tokenId: string]: XenBoxModel.Token };
}

export interface State {
  app: App;
  mint: Mint;
  box: Box;
}

const state: State = {
  app: {
    userAddress: utils.num.min,
    chainId: 0,
    ether: new Ether(),
  },
  mint: {},
  box: {
    tokenIdList: [],
    tokenMap: {},
  },
};

const actions: ActionTree<State, State> = {
  async start({ dispatch }) {
    try {
      await dispatch("setApp");
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
  },

  async mint({ state }, { amount, term }) {
    if (state.app.ether.xenBox) {
      await toRaw(state.app.ether.xenBox).mint(amount, term);
    }
  },

  async getBoxData({ state, dispatch }) {
    if (state.app.ether.xenBox && state.app.ether.xenBoxHelper) {
      const totalToken = await toRaw(state.app.ether.xenBox).totalToken();
      state.box.tokenIdList = await toRaw(
        state.app.ether.xenBoxHelper
      ).getOwnedTokenIdList(
        toRaw(state.app.ether.xenBox).address(),
        state.app.userAddress,
        0,
        totalToken
      );
      state.box.tokenIdList.forEach(async (tokenId) => {
        dispatch("getTokenData", tokenId);
      });
    }
  },

  async getTokenData({ state }, tokenId: BigNumber) {
    if (state.app.ether.xenBox) {
      if (!state.box.tokenMap[tokenId.toString()]) {
        state.box.tokenMap[tokenId.toString()] = await toRaw(
          state.app.ether.xenBox
        ).tokenMap(tokenId);
      }
    }
  },
};

export default createStore({
  state,
  actions,
});
