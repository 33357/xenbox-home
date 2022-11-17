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
              Number(state.async.share.sharer.shares),
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
                      .mul(state.async.share.sharer.shares)
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
        <el-input v-model="shares" type="string" />
      </el-form-item>
      <el-form-item label="Estimate Get :">
        <div>
          {{
            utils.format.balance(
              state.async.share.totalShareETH.add(sharesBig).eq(0)
                ? 0
                : Number(
                    state.async.share.totalShareYEN
                      .mul(sharesBig)
                      .div(state.async.share.totalShareETH.add(sharesBig))
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
              Number(state.async.share.yourClaimablePair),
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
      shares: 0,
      sharesBig: BigNumber.from(0),
      utils: utils,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getShareData");
  },
  watch: {
    shares(value) {
      (this as any).sharesBig = BigNumber.from(value * 10 ** 9).mul(
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
        (this as any).sharesBig
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
