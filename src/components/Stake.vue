<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Stake Explanation</span>
        </div>
      </template>

      <el-form label-width="30%">
        <el-form-item label="Predict APY :">
          <div>100 %</div>
        </el-form-item>
        <el-form-item label="stake :">
          <el-input v-model="stakeAmount" type="string" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="approve()">Approve</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="stake()">Stake</el-button>
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="30%">
        <el-form-item label="Your Stake :">
          <div>
            {{
              utils.format.balance(
                Number(state.async.stake.person.stakeAmount),
                18,
                "Pair",
                5
              )
            }}
          </div>
        </el-form-item>
        <el-form-item label="withdrawStake :">
          <el-input v-model="withdrawStakeAmount" type="string" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="withdrawStake()"
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
                "Pair",
                5
              )
            }}
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="withdrawReward()"
            >WithdrawReward</el-button
          >
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="30%">
        <el-form-item>
          <el-button type="primary" @click="exit()">Exit</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { log, utils, BigNumber } from "../const";
import { mapState } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      stakeAmount: 0,
      stakeAmountBig: BigNumber.from(0),
      withdrawStakeAmount: 0,
      withdrawStakeAmountBig: BigNumber.from(0),
      utils: utils,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getStakeData");
  },
  watch: {
    stakeAmount(value) {
      (this as any).stakeAmountBig = BigNumber.from(value * 10 ** 9).mul(
        10 ** 9
      );
    },
    withdrawStakeAmount(value) {
      (this as any).withdrawStakeAmountBig = BigNumber.from(value * 10 ** 9).mul(
        10 ** 9
      );
    },
    withdrawRewardAmount(value) {
      (this as any).withdrawRewardAmountBig = BigNumber.from(value * 10 ** 9).mul(
        10 ** 9
      );
    },
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    async approve() {
      await (this as any).$store.dispatch(
        "approve"
      );
    },
    async stake() {
      await (this as any).$store.dispatch(
        "stake",
        (this as any).stakeAmountBig
      );
    },
    async withdrawStake() {
      await (this as any).$store.dispatch(
        "stake",
        (this as any).withdrawStakeAmountBig
      );
    },
    async withdrawReward() {
      await (this as any).$store.dispatch(
        "withdrawReward"
      );
    },
    async exit() {
      await (this as any).$store.dispatch(
        "exit"
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
