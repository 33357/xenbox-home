<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Stake Explanation</span>
        </div>
      </template>

      <el-form label-width="30%">
        <!-- <el-form-item label="Predict APY :">
          <div>100 %</div>
        </el-form-item> -->
        <el-form-item label="Your Pairs :">
          <div>
            {{
              utils.format.balance(
                Number(state.async.stake.yourPairs),
                18,
                "Pair",
                5
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
          <el-button type="primary" @click="approve()">Approve</el-button>
        </el-form-item>
        <el-form-item v-else>
          <el-button type="primary" @click="stake()">Stake</el-button>
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
                5
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
                5
              )
            }}
          </div>
        </el-form-item>
        <el-form-item label="withdrawStake :">
          <el-input v-model="withdrawStakes" type="string" />
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
      stakes: 0,
      stakesBig: BigNumber.from(0),
      withdrawStakes: 0,
      withdrawStakesig: BigNumber.from(0),
      utils: utils,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getStakeData");
  },
  watch: {
    stakes(value) {
      (this as any).stakesBig = BigNumber.from(value * 10 ** 9).mul(
        10 ** 9
      );
    },
    withdrawStakes(value) {
      (this as any).withdrawStakesBig = BigNumber.from(
        value * 10 ** 9
      ).mul(10 ** 9);
    },
    withdrawRewards(value) {
      (this as any).withdrawRewardsBig = BigNumber.from(
        value * 10 ** 9
      ).mul(10 ** 9);
    },
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    async approve() {
      await (this as any).$store.dispatch("approve");
    },
    async stake() {
      await (this as any).$store.dispatch(
        "stake",
        (this as any).stakesBig
      );
    },
    async withdrawStake() {
      await (this as any).$store.dispatch(
        "stake",
        (this as any).withdrawStakesBig
      );
    },
    async withdrawReward() {
      await (this as any).$store.dispatch("withdrawReward");
    },
    async exit() {
      await (this as any).$store.dispatch("exit");
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
