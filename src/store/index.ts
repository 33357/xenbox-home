import { ActionTree, createStore } from "vuex";
import { Ether } from "../network";
import { utils, BigNumber } from "../const";
import { toRaw } from "vue";
import { ElMessage, ElNotification } from "element-plus";

export interface App {
  userAddress: string;
  chainId: number;
  ether: Ether;
}

export interface Mint {}

export interface Box {}

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
  box: {},
};

const actions: ActionTree<State, State> = {
  async start({ dispatch }) {
    try {
      await dispatch("setApp");
      utils.func.log("app start success!");
    } catch (err) {
      utils.func.log(err);
    }
  },

  async setApp({ state }) {
    await toRaw(state.app.ether).load();
    if(state.app.ether.singer){
      state.app.userAddress = await toRaw(state.app.ether.singer).getAddress()
    }
    if (state.app.ether.chainId) {
      state.app.chainId = state.app.ether.chainId;
    }
  },
};

export default createStore({
  state,
  actions,
});
