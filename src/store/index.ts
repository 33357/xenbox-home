import { ActionTree, createStore } from "vuex";
import { Ether } from "../network";
import { BigNumber, config, log, utils } from "../const";
import { YENModel } from "yen-sdk";
import { toRaw } from "vue";

export interface Storage {}

export interface Sync {
  userAddress: string;
  yenAddress: string;
  chainId: number;
  avatarMap: { [address: string]: string };
  ether: Ether;
  appStart: boolean;
  thisBlock: number;
  thisTime: number;
}

export interface Async {
  share: {
    shareEndBlock: BigNumber;
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
    yourPairs: BigNumber;
    yourPairAllowance: BigNumber;
    yourReward: BigNumber;
    stakes: BigNumber;
  };
  table: {
    totalSupply: BigNumber;
    halvingBlock: BigNumber;
    feeMul: BigNumber;
    blockMints: BigNumber;
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
    yenAddress: config.ZERO_ADDRESS,
    chainId: 0,
    avatarMap: {},
    ether: new Ether(),
    appStart: false,
    thisBlock: 0,
    thisTime: 0,
  },
  async: {
    share: {
      shareEndBlock: BigNumber.from(0),
      totalShareETH: BigNumber.from(0),
      totalShareYEN: BigNumber.from(0),
      totalLockedPair: BigNumber.from(0),
      yourClaimablePair: BigNumber.from(0),
      sharer: {
        shares: BigNumber.from(0),
        getteds: BigNumber.from(0),
      },
    },
    mint: {
      nextBlockMint: BigNumber.from(0),
      yourMinted: BigNumber.from(0),
    },
    stake: {
      person: {
        blockIndex: BigNumber.from(0),
        stakes: BigNumber.from(0),
        rewards: BigNumber.from(0),
        lastPerStakeRewards: BigNumber.from(0),
      },
      stakes: BigNumber.from(0),
      yourPairs: BigNumber.from(0),
      yourPairAllowance: BigNumber.from(0),
      yourReward: BigNumber.from(0),
    },
    table: {
      totalSupply: BigNumber.from(0),
      halvingBlock: BigNumber.from(0),
      feeMul: BigNumber.from(0),
      blockMints: BigNumber.from(0),
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
      let blockNumber;
      [state.sync.userAddress, blockNumber] = await Promise.all([
        toRaw(state.sync.ether.singer).getAddress(),
        toRaw(state.sync.ether.singer).provider?.getBlockNumber(),
      ]);
      if (blockNumber) {
        state.sync.thisBlock = blockNumber;
        const block = await toRaw(state.sync.ether.singer).provider?.getBlock(
          state.sync.thisBlock
        );
        if (block) {
          state.sync.thisTime = block.timestamp;
        }
      }
    }
    if (state.sync.ether.chainId) {
      state.sync.chainId = state.sync.ether.chainId;
    }
    if (state.sync.ether.yen) {
      state.sync.yenAddress = toRaw(state.sync.ether.yen).address();
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
        state.async.share.shareEndBlock,
        state.async.share.totalShareETH,
        state.async.share.totalShareYEN,
        state.async.share.totalLockedPair,
        state.async.share.sharer,
      ] = await Promise.all([
        toRaw(state.sync.ether.yen).shareEndBlock(),
        toRaw(state.sync.ether.yen).shareEths(),
        toRaw(state.sync.ether.yen).shareTokens(),
        toRaw(state.sync.ether.yen).sharePairs(),
        toRaw(state.sync.ether.yen).sharerMap(state.sync.userAddress),
      ]);
      if (state.async.share.totalShareETH.gt(0)) {
        state.async.share.yourClaimablePair = await toRaw(
          state.sync.ether.yen
        ).getShares(state.sync.userAddress);
      }
    }
  },

  async getMintData({ state }) {
    if (state.sync.ether.yen) {
      [state.async.mint.nextBlockMint, state.async.mint.yourMinted] =
        await Promise.all([
          toRaw(state.sync.ether.yen).getMints(),
          toRaw(state.sync.ether.yen).getClaims(state.sync.userAddress),
        ]);
    }
  },

  async getStakeData({ state }) {
    if (state.sync.ether.yen) {
      let pairAddress;
      [
        state.async.stake.person,
        state.async.stake.yourReward,
        pairAddress,
        state.async.stake.stakes,
      ] = await Promise.all([
        toRaw(state.sync.ether.yen).personMap(state.sync.userAddress),
        toRaw(state.sync.ether.yen).getRewards(state.sync.userAddress),
        toRaw(state.sync.ether.yen).pair(),
        toRaw(state.sync.ether.yen).stakes(),
      ]);
      if (!state.sync.ether.pair && pairAddress != config.ZERO_ADDRESS) {
        toRaw(state.sync.ether).loadPair(pairAddress);
      }
      if (state.sync.ether.pair) {
        state.async.stake.yourPairs = await toRaw(
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
      [
        state.async.table.totalSupply,
        state.async.table.halvingBlock,
        state.async.table.feeMul,
        state.async.table.blockMints,
      ] = await Promise.all([
        toRaw(state.sync.ether.yen).totalSupply(),
        toRaw(state.sync.ether.yen).halvingBlock(),
        toRaw(state.sync.ether.yen).getFeeMul(),
        toRaw(state.sync.ether.yen).blockMints(),
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

  async share({ state }, shares: BigNumber) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).share({ value: shares });
    }
  },

  async getShare({ state }) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).getShare();
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

  async stake({ state }, stakes: BigNumber) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).stake(stakes);
    }
  },

  async withdrawStake({ state }, withdrawStakes: BigNumber) {
    if (state.sync.ether.yen) {
      await toRaw(state.sync.ether.yen).withdrawStake(withdrawStakes);
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
