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
    yourPairAmount: BigNumber;
    yourPairAllowance: BigNumber;
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
        gettedAmount: BigNumber.from(0),
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
      yourPairAmount: BigNumber.from(0),
      yourPairAllowance: BigNumber.from(0),
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
      [
        state.async.share.totalShareETH,
        state.async.share.totalShareYEN,
        state.async.share.totalLockedPair,
        state.async.share.sharer,
      ] = await Promise.all([
        toRaw(state.sync.ether.yen).shareEthAmount(),
        toRaw(state.sync.ether.yen).shareTokenAmount(),
        toRaw(state.sync.ether.yen).sharePairAmount(),
        toRaw(state.sync.ether.yen).sharerMap(state.sync.userAddress),
      ]);
      if (state.async.share.totalShareETH.gt(0)) {
        state.async.share.yourClaimablePair = await toRaw(
          state.sync.ether.yen
        ).getAmount(state.sync.userAddress);
      }
    }
  },

  async getMintData({ state }) {
    if (state.sync.ether.yen) {
      [state.async.mint.nextBlockMint, state.async.mint.yourMinted] =
        await Promise.all([
          toRaw(state.sync.ether.yen).getMintAmount(),
          toRaw(state.sync.ether.yen).getClaimAmount(state.sync.userAddress),
        ]);
    }
  },

  async getStakeData({ state }) {
    if (state.sync.ether.yen) {
      let pairAddress;
      [state.async.stake.person, state.async.stake.yourReward, pairAddress] =
        await Promise.all([
          toRaw(state.sync.ether.yen).personMap(state.sync.userAddress),
          toRaw(state.sync.ether.yen).getRewardAmount(state.sync.userAddress),
          toRaw(state.sync.ether.yen).pair(),
        ]);
      if (!state.sync.ether.pair && pairAddress != config.ZERO_ADDRESS) {
        toRaw(state.sync.ether).loadPair(pairAddress);
      }
      if (state.sync.ether.pair) {
        state.async.stake.yourPairAmount = await toRaw(
          state.sync.ether.pair
        ).balanceOf(state.sync.userAddress);
        state.async.stake.yourPairAllowance = await toRaw(
          state.sync.ether.pair
        ).allowance(
          state.sync.userAddress,
          toRaw(state.sync.ether.yen).address()
        );
      }
    }
  },

  async getTableData({ state }) {
    if (state.sync.ether.yen) {
      [state.async.table.totalSupply, state.async.table.halvingBlock] =
        await Promise.all([
          toRaw(state.sync.ether.yen).totalSupply(),
          toRaw(state.sync.ether.yen).halvingBlock(),
        ]);
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

  async share({ state }, shareAmount: BigNumber) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).share({ value: shareAmount });
    }
  },

  async get({ state }) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).get();
    }
  },

  async approve({ state }) {
    if (state.sync.ether.pair && state.sync.ether.yen) {
      await toRaw(state.sync.ether.pair).approve(
        toRaw(state.sync.ether.yen).address(),
        BigNumber.from(config.MAX_UINT256)
      );
    }
  },

  async stake({ state }, stakeAmount: BigNumber) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).stake(stakeAmount);
    }
  },

  async withdrawStake({ state }, withdrawStakeAmount: BigNumber) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).withdrawStake(withdrawStakeAmount);
    }
  },

  async withdrawReward({ state }) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).withdrawReward();
    }
  },

  async exit({ state }) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).exit();
    }
  },
};

export default createStore({
  state,
  actions,
});
