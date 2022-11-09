<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Share Explanation</span>
      </div>
    </template>

    <el-form label-width="30%">
      <el-form-item label="Total Share ETH :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.totalShareETH),
              18,
              "ETH",
              5
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Your Share ETH :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.sharer.shareAmount),
              18,
              "ETH",
              5
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Total Share YEN :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.totalShareYEN),
              18,
              "YEN",
              5
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Your Share YEN :">
        <div>
          {{
            utils.format.balance(
              state.async.share.totalShareETH.eq(0)
                ? 0
                : Number(
                    state.async.share.totalShareYEN
                      .mul(state.async.share.sharer.shareAmount)
                      .div(state.async.share.totalShareETH)
                  ),
              18,
              "YEN",
              5
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Share ETH :">
        <el-input v-model="shareAmount" type="string" />
      </el-form-item>
      <el-form-item label="Estimate Get :">
        <div>
          {{
            utils.format.balance(
              state.async.share.totalShareETH.add(shareAmountBig).eq(0)
                ? 0
                : Number(
                    state.async.share.totalShareYEN
                      .mul(shareAmountBig)
                      .div(state.async.share.totalShareETH.add(shareAmountBig))
                  ),
              18,
              "YEN",
              5
            )
          }}
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="share()">Share</el-button>
      </el-form-item>
    </el-form>

    <el-divider />
    <el-form label-width="30%">
      <el-form-item label="Total Locked Pair :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.totalLockedPair),
              18,
              "Pair",
              5
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Your Claimable Pair :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.sharer.getAmount),
              18,
              "Pair",
              5
            )
          }}
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="get()">Get</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { log, utils, BigNumber } from "../const";
import { mapState } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      shareAmount: 0,
      shareAmountBig: BigNumber.from(0),
      utils: utils,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getShareData");
  },
  watch: {
    shareAmount(value) {
      (this as any).shareAmountBig = BigNumber.from(value * 10 ** 9).mul(
        10 ** 9
      );
    },
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    async share() {
      await (this as any).$store.dispatch(
        "share",
        (this as any).shareAmountBig
      );
    },
    async get() {
      await (this as any).$store.dispatch("get");
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
  width: 50%;
  margin-left: auto;
  margin-right: auto;
}
</style>
