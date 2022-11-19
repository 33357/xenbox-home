<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Stake Explanation</span>
        </div>
      </template>

      <el-form label-width="30%">
        <el-form-item label="Your Pairs :">
          <div>
            {{
              utils.format.balance(
                Number(state.async.stake.yourPairs),
                18,
                "Pair",
                10
              )
            }}
          </div>
        </el-form-item>
        <el-form-item>
          <a
            target="_blank"
            :href="`https://app.uniswap.org/#/add/v2/ETH/${state.sync.yenAddress}`"
          >
            Add Liquidity
          </a>
        </el-form-item>
        <el-form-item label="stake :">
          <el-input v-model="stakes" type="string" />
        </el-form-item>
        <el-form-item v-if="state.async.stake.yourPairAllowance.eq(0)">
          <el-button type="primary" @click="approve()" :loading="approveLoad"
            >Approve</el-button
          >
        </el-form-item>
        <el-form-item v-else>
          <el-button type="primary" @click="stake()" :loading="stakeLoad"
            >Stake</el-button
          >
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="30%">
        <el-form-item label="Total Stake :">
          <div>
            {{
              utils.format.balance(
                Number(state.async.stake.stakes),
                18,
                "Pair",
                10
              )
            }}
          </div>
        </el-form-item>
        <el-form-item label="Your Stake :">
          <div>
            {{
              utils.format.balance(
                Number(state.async.stake.person.stakes),
                18,
                "Pair",
                10
              )
            }}
          </div>
        </el-form-item>
        <el-form-item label="withdrawStake :">
          <el-input v-model="withdrawStakes" type="string" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="withdrawStake()"
            :loading="withdrawStakeLoad"
            >WithdrawStake</el-button
          >
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="30%">
        <el-form-item label="Your Reward :">
          <div>
            {{
              utils.format.balance(
                Number(state.async.stake.yourReward),
                18,
                "YEN",
                10
              )
            }}
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="withdrawReward()"
            :loading="withdrawRewardLoad"
            >WithdrawReward</el-button
          >
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="30%">
        <el-form-item>
          <el-button type="primary" @click="exit()" :loading="exitStakeLoad"
            >Exit</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { log, utils, BigNumber } from "../const";
import { mapState } from "vuex";
import { State, YENModel } from "../store";

export default {
  data() {
    return {
      stakes: 0,
      stakesBig: BigNumber.from(0),
      withdrawStakes: 0,
      withdrawStakesig: BigNumber.from(0),
      utils: utils,
      approveLoad: false,
      stakeLoad: false,
      withdrawStakeLoad: false,
      withdrawRewardLoad: false,
      exitStakeLoad: false,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getStakeData");
  },
  watch: {
    stakes(value) {
      (this as any).stakesBig = BigNumber.from(value * 10 ** 9).mul(10 ** 9);
    },
    withdrawStakes(value) {
      (this as any).withdrawStakesBig = BigNumber.from(value * 10 ** 9).mul(
        10 ** 9
      );
    },
    withdrawRewards(value) {
      (this as any).withdrawRewardsBig = BigNumber.from(value * 10 ** 9).mul(
        10 ** 9
      );
    },
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    async approve() {
      (this as any).approveLoad = true;
      await (this as any).$store.dispatch(
        "approve",
        (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            (this as any).approveLoad = false;
          }
        }
      );
    },
    async stake() {
      (this as any).stakeLoad = true;
      await (this as any).$store.dispatch("stake", {
        stakes: (this as any).stakesBig,
        func: (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            (this as any).stakeLoad = false;
          }
        },
      });
    },
    async withdrawStake() {
      (this as any).withdrawStakeLoad = true;
      await (this as any).$store.dispatch("stake", {
        withdrawStakes: (this as any).withdrawStakesBig,
        func: (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            (this as any).withdrawReward = false;
          }
        },
      });
      (this as any).withdrawStakeLoad = false;
    },
    async withdrawReward() {
      (this as any).withdrawReward = true;
      await (this as any).$store.dispatch(
        "withdrawReward",
        (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            (this as any).withdrawReward = false;
          }
        }
      );
    },
    async exit() {
      (this as any).exitReward = true;
      await (this as any).$store.dispatch(
        "exit",
        (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            (this as any).exitReward = false;
          }
        }
      );
    },
  },
};
</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 480px;
  margin-left: auto;
  margin-right: auto;
}
</style>
