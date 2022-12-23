import { ActionTree, createStore } from "vuex";
import { Ether } from "../network";
import { utils, log, BigNumber } from "../const";
import { toRaw } from "vue";
import { ElMessage, ElNotification } from "element-plus";
import { XenBoxModel } from "xenbox-sdk";
import { BigNumberish } from "ethers";

export interface App {
  userAddress: string;
  chainId: number;
  ether: Ether;
}

export interface Mint {}

export interface Token extends XenBoxModel.Token {
  time?: number;
}

export interface Box {
  tokenIdList: BigNumber[];
  tokenMap: { [tokenId: string]: Token };
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

  async claim({ state }, { tokenId, term }) {
    if (state.app.ether.xenBox) {
      await toRaw(state.app.ether.xenBox).claim(tokenId, term);
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
    if (state.app.ether.xenBox && state.app.ether.xen) {
      if (!state.box.tokenMap[tokenId.toString()]) {
        state.box.tokenMap[tokenId.toString()] = {
          start: BigNumber.from(0),
          end: BigNumber.from(0),
        };
        state.box.tokenMap[tokenId.toString()] = await toRaw(
          state.app.ether.xenBox
        ).tokenMap(tokenId);
        const proxyAddress = await toRaw(
          state.app.ether.xenBox
        ).getProxyAddress(state.box.tokenMap[tokenId.toString()].start);
        const time = (
          await toRaw(state.app.ether.xen).userMints(proxyAddress)
        ).maturityTs.toNumber();
        state.box.tokenMap[tokenId.toString()] = {
          start: state.box.tokenMap[tokenId.toString()].start,
          end: state.box.tokenMap[tokenId.toString()].end,
          time,
        };
      }
    }
  },
};

export default createStore({
  state,
  actions,
});
