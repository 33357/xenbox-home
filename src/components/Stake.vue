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
        <el-form-item label="withdrawReward :">
          <el-input v-model="withdrawRewardAmount" type="string" />
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
import { log, utils } from "../const";
import { mapState } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      stakeAmount: 0,
      withdrawStakeAmount: 0,
      withdrawRewardAmount: 0,
      utils: utils,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getStakeData");
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    stake() {},
    withdrawStake() {},
    withdrawReward() {},
    exit() {},
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
