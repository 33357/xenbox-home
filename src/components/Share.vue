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
      <el-form-item label="Share ETH :">
        <el-input v-model="shareAmount" type="string" />
      </el-form-item>
      <el-form-item label="Estimate Get :">
        <div>0 YEN</div>
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
      <el-form-item label="Your Locked Pair :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.sharer.shareAmount),
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
import { log, utils } from "../const";
import { mapState } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      shareAmount: 0,
      utils: utils,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getShareData");
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    share() {},
    get() {},
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
