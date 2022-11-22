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
              `${utils.format.bigToString(
                state.async.stake.yourPairs,
                18
              )} Pair`
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
          <el-button type="primary" @click="doApprove()" :loading="approveLoad"
            >Approve</el-button
          >
        </el-form-item>
        <el-form-item v-else>
          <el-button type="primary" @click="doStake()" :loading="stakeLoad"
            >Stake</el-button
          >
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="30%">
        <el-form-item label="Total Stake :">
          <div>
            {{
              `${utils.format.bigToString(state.async.stake.stakes, 18)} Pair`
            }}
          </div>
        </el-form-item>
        <el-form-item label="Your Stake :">
          <div>
            {{
              `${utils.format.bigToString(
                state.async.stake.person.stakes,
                18
              )} Pair`
            }}
          </div>
        </el-form-item>
        <el-form-item label="withdrawStake :">
          <el-input v-model="withdrawStakes" type="string" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="doWithdrawStake()"
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
              `${utils.format.bigToString(
                state.async.stake.yourReward,
                18
              )} Pair`
            }}
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="doWithdrawReward()"
            :loading="withdrawRewardLoad"
            >WithdrawReward</el-button
          >
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="30%">
        <el-form-item>
          <el-button type="primary" @click="doExit()" :loading="exitLoad"
            >Exit</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { utils, BigNumber } from "../const";
import { mapState, mapActions } from "vuex";
import { State, YENModel } from "../store";

export default {
  data() {
    return {
      stakes: 0,
      stakesBig: BigNumber.from(0),
      withdrawStakes: 0,
      withdrawStakesBig: BigNumber.from(0),
      utils: utils,
      approveLoad: false,
      stakeLoad: false,
      withdrawStakeLoad: false,
      withdrawRewardLoad: false,
      exitLoad: false,
    };
  },
  async created() {
    await this.getStakeData();
  },
  watch: {
    stakes(value) {
      this.stakesBig = BigNumber.from(value * 10 ** 9).mul(10 ** 9);
    },
    withdrawStakes(value) {
      this.withdrawStakesBig = BigNumber.from(value * 10 ** 9).mul(10 ** 9);
    },
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    ...mapActions([
      "getStakeData",
      "approve",
      "stake",
      "withdrawStake",
      "withdrawReward",
      "exit",
    ]),
    async doApprove() {
      this.approveLoad = true;
      await this.approve(
        async (
          e: YENModel.ContractTransaction | YENModel.ContractReceipt | null
        ) => {
          if (!e) {
            this.approveLoad = false;
          } else if (e.blockNumber) {
            this.approveLoad = false;
            await this.getStakeData();
          }
        }
      );
    },
    async doStake() {
      this.stakeLoad = true;
      await this.stake({
        stakes: this.stakesBig,
        func: async (
          e: YENModel.ContractTransaction | YENModel.ContractReceipt | null
        ) => {
          if (!e) {
            this.stakeLoad = false;
          } else if (e.blockNumber) {
            this.stakeLoad = false;
            await this.getStakeData();
          }
        },
      });
    },
    async doWithdrawStake() {
      this.withdrawStakeLoad = true;
      await this.withdrawStake({
        withdrawStakes: this.withdrawStakesBig,
        func: async (
          e: YENModel.ContractTransaction | YENModel.ContractReceipt | null
        ) => {
          if (!e) {
            this.withdrawStakeLoad = false;
          } else if (e.blockNumber) {
            this.withdrawStakeLoad = false;
            await this.getStakeData();
          }
        },
      });
    },
    async doWithdrawReward() {
      this.withdrawRewardLoad = true;
      await this.withdrawReward(
        async (
          e: YENModel.ContractTransaction | YENModel.ContractReceipt | null
        ) => {
          if (!e) {
            this.withdrawRewardLoad = false;
          } else if (e.blockNumber) {
            this.withdrawRewardLoad = false;
            await this.getStakeData();
          }
        }
      );
    },
    async doExit() {
      this.exitLoad = true;
      await this.exit(
        async (
          e: YENModel.ContractTransaction | YENModel.ContractReceipt | null
        ) => {
          if (!e) {
            this.exitLoad = false;
          } else if (e.blockNumber) {
            this.exitLoad = false;
            await this.getStakeData();
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
