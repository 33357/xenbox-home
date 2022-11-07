import { ActionTree, createStore } from "vuex";
import { Ether } from "../network";
import { BigNumber, config, log, utils } from "../const";
import { YENModel } from "yen-sdk";
import { toRaw } from "vue";

export interface Storage {}

export interface Sync {
  userAddress: string;
  chainId: number;
  avatarMap: { [address: string]: string };
  ether: Ether;
  appStart: boolean;
}

export interface Async {
  share: {
    totalShareETH: BigNumber;
    totalShareYEN: BigNumber;
    totalLockedPair: BigNumber;
    yourClaimablePair: BigNumber;
    sharer: YENModel.Sharer;
  };
  mint: {
    nextBlockMint: BigNumber;
    yourMinted: BigNumber;
  };
  stake: {
    person: YENModel.Person;
    yourReward: BigNumber;
  };
  table: {
    totalSupply: BigNumber;
    halvingBlock: BigNumber;
  };
}

export interface State {
  storage: Storage;
  sync: Sync;
  async: Async;
}

const state: State = {
  storage: {},
  sync: {
    userAddress: config.ZERO_ADDRESS,
    chainId: 0,
    avatarMap: {},
    ether: new Ether(),
    appStart: false,
  },
  async: {
    share: {
      totalShareETH: BigNumber.from(0),
      totalShareYEN: BigNumber.from(0),
      totalLockedPair: BigNumber.from(0),
      yourClaimablePair: BigNumber.from(0),
      sharer: {
        shareAmount: BigNumber.from(0),
        getAmount: BigNumber.from(0),
      },
    },
    mint: {
      nextBlockMint: BigNumber.from(0),
      yourMinted: BigNumber.from(0),
    },
    stake: {
      person: {
        blockIndex: BigNumber.from(0),
        stakeAmount: BigNumber.from(0),
        rewardAmount: BigNumber.from(0),
        lastPerStakeRewardAmount: BigNumber.from(0),
      },
      yourReward: BigNumber.from(0),
    },
    table: {
      totalSupply: BigNumber.from(0),
      halvingBlock: BigNumber.from(0),
    },
  },
};

const actions: ActionTree<State, State> = {
  async start({ dispatch }) {
    try {
      await dispatch("setSync");
      await dispatch("watchStorage");
      state.sync.appStart = true;
      log("app start success!");
    } catch (err) {
      log(err);
    }
  },

  async setSync({ state, dispatch }) {
    await toRaw(state.sync.ether).load();
    if (state.sync.ether.singer) {
      state.sync.userAddress = await toRaw(
        state.sync.ether.singer
      ).getAddress();
    }
    const chainId = state.sync.ether.chainId;
    if (chainId) {
      state.sync.chainId = chainId;
    }
    await dispatch("setAvatar", { address: state.sync.userAddress });
  },

  async watchStorage({ state }) {
    const storageName = `${state.sync.userAddress}_${state.sync.chainId}`;
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
      (state) => state.storage,
      (storage) => {
        localStorage.setItem(storageName, JSON.stringify(storage));
      },
      {
        deep: true,
      }
    );
  },

  async setAvatar({ state }, { address }) {
    if (!state.sync.avatarMap[address]) {
      state.sync.avatarMap[address] = utils.get.avatar(address);
    }
  },

  async getShareData({ state }) {
    if (state.sync.ether.yen) {
      state.async.share.totalShareETH = await toRaw(
        state.sync.ether.yen
      ).shareEthAmount();
      state.async.share.totalShareYEN = await toRaw(
        state.sync.ether.yen
      ).shareTokenAmount();
      state.async.share.totalLockedPair = await toRaw(
        state.sync.ether.yen
      ).sharePairAmount();
      state.async.share.yourClaimablePair = await toRaw(
        state.sync.ether.yen
      ).maxGetAmount(state.sync.userAddress);
      state.async.share.sharer = await toRaw(state.sync.ether.yen).sharerMap(
        state.sync.userAddress
      );
      log(state.async.share);
    }
  },

  async getMintData({ state }) {
    if (state.sync.ether.yen) {
      state.async.mint.nextBlockMint = await toRaw(
        state.sync.ether.yen
      ).getMintAmount();
      state.async.mint.yourMinted = await toRaw(
        state.sync.ether.yen
      ).getClaimAmount(state.sync.userAddress);
    }
  },

  async getStakeData({ state }) {
    if (state.sync.ether.yen) {
      state.async.stake.person = await toRaw(state.sync.ether.yen).personMap(
        state.sync.userAddress
      );
      state.async.stake.yourReward = await toRaw(
        state.sync.ether.yen
      ).getRewardAmount(state.sync.userAddress);
    }
  },

  async getTableData({ state }) {
    if (state.sync.ether.yen) {
      state.async.table.totalSupply = await toRaw(
        state.sync.ether.yen
      ).totalSupply();
      state.async.table.halvingBlock = await toRaw(
        state.sync.ether.yen
      ).halvingBlock();
    }
  },

  async mint({ state }) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).mint();
    }
  },

  async claim({ state }) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).claim();
    }
  },
};

export default createStore({
  state,
  actions,
});
