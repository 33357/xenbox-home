import { ActionTree, createStore } from "vuex";
import { Ether } from "../network";
import { BigNumber, config, log, retry, utils } from "../const";
import { YENClient } from "yen-sdk";
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
    shareETH: BigNumber;
    totalShareYEN: BigNumber;
    totalLockedPair: BigNumber;
    yourLockedPair: BigNumber;
    yourClaimablePair: BigNumber;
  };
  mint: {
    blockMint: BigNumber;
    minted: BigNumber;
  };
  stake: {
    yourStake: BigNumber;
    yourReward: BigNumber;
  };
}

export interface State {
  storage: Storage;
  sync: Sync;
  async: Async;
}

const retryTime = 3;

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
      shareETH: BigNumber.from(0),
      totalShareYEN: BigNumber.from(0),
      totalLockedPair: BigNumber.from(0),
      yourLockedPair: BigNumber.from(0),
      yourClaimablePair: BigNumber.from(0),
    },
    mint: {
      blockMint: BigNumber.from(0),
      minted: BigNumber.from(0),
    },
    stake: {
      yourStake: BigNumber.from(0),
      yourReward: BigNumber.from(0),
    },
  },
};

const actions: ActionTree<State, State> = {
  async start({ dispatch }) {
    try {
      await dispatch("setSync");
      await dispatch("watchStorage");
      // await Promise.all([
      //   dispatch('setPublishSortOfferIdList'),
      //   dispatch('setValueSortOfferIdList'),
      //   dispatch('setFinishSortOfferIdList')
      // ])
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

  async getShareData({ state }) {},

  // async setPublishSortOfferIdList({ state }) {
  //   if (state.async.offerReward.offerLength == 0) {
  //     state.async.offerReward.offerLength = await retry(toRaw(state.sync.ether.offerReward).getOfferLength.bind(toRaw(state.sync.ether.offerReward)), retryTime);
  //   }
  //   for (let i = state.async.offerReward.offerLength; i > 0; i--) {
  //     state.async.offerReward.offerIdList.push(i)
  //   }
  // },

  // async setOfferDataList({ state, dispatch }, { offerIdList }) {
  //   const offerDataList = await retry(toRaw(state.sync.ether.offerReward).getOfferDataList.bind(toRaw(state.sync.ether.offerReward)), retryTime, [offerIdList]);
  //   (offerIdList as Array<number>).forEach(async (offerId, index) => {
  //     if (!state.async.offerMap[offerId]) {
  //       state.async.offerMap[offerId] = { offerData: offerDataList[index] };
  //       dispatch('setAvatar', { address: state.async.offerMap[offerId].offerData.publisher });
  //     }
  //   });
  // },

  // async setOfferPublishedEvent({ state }, { offerId }) {
  //   if (state.async.offerMap[offerId].offerData && !state.async.offerMap[offerId].offerPublishedEvent) {
  //     try {
  //       state.async.offerMap[offerId].offerPublishedEvent = {
  //         hash: '',
  //         offerId,
  //         title: '',
  //         content: '',
  //       };
  //       const offerPublishedEvent = await retry(toRaw(state.sync.ether.offerReward).getOfferPublishedEvent.bind(toRaw(state.sync.ether.offerReward)), retryTime, [offerId,
  //         state.async.offerMap[offerId].offerData.offerBlock,
  //         state.async.offerMap[offerId].offerData.offerBlock]);
  //       state.async.offerMap[offerId].offerPublishedEvent = offerPublishedEvent;
  //       if (state.async.offerMap[offerId].offerData.finishBlock != 0) {
  //         const offerFinishedEvent = await retry(toRaw(state.sync.ether.offerReward).getOfferFinishedEvent.bind(toRaw(state.sync.ether.offerReward)), retryTime, [
  //           offerId,
  //           undefined,
  //           state.async.offerMap[offerId].offerData.finishBlock,
  //           state.async.offerMap[offerId].offerData.finishBlock
  //         ]);
  //         state.async.offerMap[offerId].offerFinishedEvent = offerFinishedEvent;
  //       }
  //     } catch (err) {
  //       log(err);
  //       state.async.offerMap[offerId].offerPublishedEvent = {
  //         hash: '',
  //         offerId,
  //         title: '数据错误',
  //         content: '',
  //       };
  //     }
  //   }
  // },

  // async setPublisher({ state }, { address }) {
  //   if (!state.async.publisherMap[address]) {
  //     state.async.publisherMap[address] = await retry(toRaw(state.sync.ether.offerReward).getPublisherData.bind(toRaw(state.sync.ether.offerReward)), retryTime, [address]);
  //   }
  // },

  // async publishOffer({ state }, { title, content, offerTime, value }) {
  //   let beforeValueSortOfferId = 0;
  //   if (state.async.offerReward.valueSortOfferIdList.length != 0) {
  //     for (const index in state.async.offerReward.valueSortOfferIdList) {
  //       const offerId = state.async.offerReward.valueSortOfferIdList[index];
  //       if (state.async.offerMap[offerId].offerData && state.async.offerMap[offerId].offerData.value > value) {
  //         beforeValueSortOfferId = offerId;
  //       }
  //     }
  //   }
  //   let beforeFinishSortOfferId = 0;
  //   if (state.async.offerReward.finishSortOfferIdList.length != 0) {
  //     for (const index in state.async.offerReward.finishSortOfferIdList) {
  //       const offerId = state.async.offerReward.valueSortOfferIdList[index];
  //       if (state.async.offerMap[offerId].offerData && state.async.offerMap[offerId].offerData.finishTime < new Date().getTime() / 1000 + offerTime) {
  //         beforeFinishSortOfferId = offerId;
  //       }
  //     }
  //   }
  //   log(title, content, offerTime, beforeValueSortOfferId, beforeFinishSortOfferId, { value: value.toString() })
  //   await toRaw(state.sync.ether.offerReward).publishOffer(title, content, offerTime, beforeValueSortOfferId, beforeFinishSortOfferId, { value: value.toString() });
  // },

  // async publishAnswer({ state }, { offerId, content }) {
  //   log(offerId, content)
  //   await toRaw(state.sync.ether.offerReward).publishAnswer(offerId, content);
  // },

  // async finishOffer({ state }, { offerId, address }) {
  //   let beforeValueSortOfferId = 0;
  //   if (state.async.offerReward.valueSortOfferIdList.length != 0) {
  //     for (const index in state.async.offerReward.valueSortOfferIdList) {
  //       if (offerId == state.async.offerReward.valueSortOfferIdList[index]) {
  //         break;
  //       }
  //       beforeValueSortOfferId = state.async.offerReward.valueSortOfferIdList[index];
  //     }
  //   }
  //   let beforeFinishSortOfferId = 0;
  //   if (state.async.offerReward.finishSortOfferIdList.length != 0) {
  //     for (const index in state.async.offerReward.finishSortOfferIdList) {
  //       if (offerId == state.async.offerReward.finishSortOfferIdList[index]) {
  //         break;
  //       }
  //       beforeFinishSortOfferId = state.async.offerReward.finishSortOfferIdList[index];
  //     }
  //   }
  //   log(offerId, address, beforeValueSortOfferId, beforeFinishSortOfferId)
  //   await toRaw(state.sync.ether.offerReward).finishOffer(offerId, address, beforeValueSortOfferId, beforeFinishSortOfferId);
  // },

  // async setValueSortOfferIdList({ state, dispatch }) {
  //   if (state.async.offerReward.firstValueSortOfferId == 0) {
  //     state.async.offerReward.firstValueSortOfferId = await retry(toRaw(state.sync.ether.offerReward).getFirstValueSortOfferId.bind(toRaw(state.sync.ether.offerReward)), retryTime);
  //   }
  //   if (state.async.offerReward.valueSortOfferIdList.length < state.async.offerReward.sortLength) {
  //     const valueSortOfferIdList = await retry(toRaw(state.sync.ether.offerReward).getOfferIdListByValueSort.bind(toRaw(state.sync.ether.offerReward)), retryTime, [state.async.offerReward.firstValueSortOfferId, state.async.offerReward.sortLength]);
  //     if (state.async.offerReward.firstValueSortOfferId != 0) {
  //       state.async.offerReward.valueSortOfferIdList = [state.async.offerReward.firstValueSortOfferId, ...valueSortOfferIdList.slice(0, valueSortOfferIdList.length - 1)];
  //     } else {
  //       state.async.offerReward.valueSortOfferIdList = valueSortOfferIdList
  //     }
  //     dispatch('setOfferDataList', { offerIdList: state.async.offerReward.valueSortOfferIdList });
  //   }
  // },

  // async setFinishSortOfferIdList({ state }) {
  //   if (state.async.offerReward.firstFinishSortOfferId == 0) {
  //     state.async.offerReward.firstFinishSortOfferId = await retry(toRaw(state.sync.ether.offerReward).getFirstFinishSortOfferId.bind(toRaw(state.sync.ether.offerReward)), retryTime);
  //   }
  //   if (state.async.offerReward.finishSortOfferIdList.length < state.async.offerReward.sortLength) {
  //     const finishSortOfferIdList = await retry(toRaw(state.sync.ether.offerReward).getOfferIdListByFinishSort.bind(toRaw(state.sync.ether.offerReward)), retryTime, [state.async.offerReward.firstFinishSortOfferId, state.async.offerReward.sortLength]);
  //     if (state.async.offerReward.firstFinishSortOfferId != 0) {
  //       state.async.offerReward.finishSortOfferIdList = [state.async.offerReward.firstFinishSortOfferId, ...finishSortOfferIdList.slice(0, finishSortOfferIdList.length - 1)];
  //     } else {
  //       state.async.offerReward.finishSortOfferIdList = finishSortOfferIdList
  //     }
  //   }
  // },

  // async setAnswerList({ state, dispatch }, { offerId }) {
  //   if (state.async.offerMap[offerId] && !state.async.offerMap[offerId].answerPublishedEventMap) {
  //     if (!state.async.offerMap[offerId].answerPublishedEventMap) {
  //       state.async.offerMap[offerId].answerPublishedEventMap = {};
  //     }
  //     let end = state.async.offerMap[offerId].offerData.answerBlockListLength;
  //     if (end > state.storage.getAnswerBlockAmountLimit) {
  //       end = state.storage.getAnswerBlockAmountLimit;
  //     }
  //     const answerBlockIdList = await retry(toRaw(state.sync.ether.offerReward).getAnswerBlockListByOffer.bind(toRaw(state.sync.ether.offerReward)), retryTime, [offerId, 0, end]);
  //     if (state.async.offerReward.blockSkip == 0) {
  //       state.async.offerReward.blockSkip = await retry(toRaw(state.sync.ether.offerReward).getBlockSkip.bind(toRaw(state.sync.ether.offerReward)), retryTime);
  //     }
  //     answerBlockIdList.forEach(async (answerBlockId: number) => {
  //       const answerPublishedEventList = await retry(toRaw(state.sync.ether.offerReward).getAnswerPublishedEventList.bind(toRaw(state.sync.ether.offerReward)), retryTime, [
  //         offerId,
  //         undefined,
  //         answerBlockId,
  //         answerBlockId + state.async.offerReward.blockSkip
  //       ]);
  //       answerPublishedEventList.forEach((answerPublishedEvent: OfferRewardModel.AnswerPublishedEvent) => {
  //         dispatch('setAvatar', { address: answerPublishedEvent.publisher });
  //       });
  //       (state.async.offerMap[offerId].answerPublishedEventMap as any)[answerBlockId] = answerPublishedEventList;
  //     });
  //   }
  // },
};

export default createStore({
  state,
  actions,
});
