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
          <el-button type="primary" @click="exit()" :loading="exitLoad"
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
    await (this as any).$store.dispatch("getStakeData");
  },
  watch: {
    stakes(value) {
      this.stakesBig = BigNumber.from(value * 10 ** 9).mul(10 ** 9);
    },
    withdrawStakes(value) {
      this.withdrawStakesBig = BigNumber.from(value * 10 ** 9).mul(
        10 ** 9
      );
    }
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    async approve() {
      this.approveLoad = true;
      await (this as any).$store.dispatch(
        "approve",
        async (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            this.approveLoad = false;
            await (this as any).$store.dispatch("getStakeData");
          }
        }
      );
    },
    async stake() {
      this.stakeLoad = true;
      await (this as any).$store.dispatch("stake", {
        stakes: this.stakesBig,
        func: async (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            this.stakeLoad = false;
            await (this as any).$store.dispatch("getStakeData");
          }
        },
      });
    },
    async withdrawStake() {
      this.withdrawStakeLoad = true;
      await (this as any).$store.dispatch("stake", {
        withdrawStakes: this.withdrawStakesBig,
        func: async (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            this.withdrawStakeLoad = false;
            await (this as any).$store.dispatch("getStakeData");
          }
        },
      });
      this.withdrawStakeLoad = false;
    },
    async withdrawReward() {
      this.withdrawRewardLoad = true;
      await (this as any).$store.dispatch(
        "withdrawReward",
        async (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            this.withdrawRewardLoad = false;
            await (this as any).$store.dispatch("getStakeData");
          }
        }
      );
    },
    async exit() {
      this.exitLoad = true;
      await (this as any).$store.dispatch(
        "exit",
        async (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            this.exitLoad = false;
            await (this as any).$store.dispatch("getStakeData");
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
