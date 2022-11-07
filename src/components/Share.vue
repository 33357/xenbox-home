<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Share Explanation</span>
      </div>
    </template>

    <el-form label-width="30%">
      <el-form-item label="Total Share ETH :">
        <div>{{ state.async.share.totalShareETH }} ETH</div>
      </el-form-item>
      <el-form-item label="Total Share YEN :">
        <div>{{ state.async.share.totalShareYEN }} YEN</div>
      </el-form-item>
      <el-form-item label="Share ETH :">
        <el-input v-model="shareAmount" type="string" />
      </el-form-item>
      <el-form-item label="Estimate Get :">
        <div>123 YEN</div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="share()">Share</el-button>
      </el-form-item>
    </el-form>

    <el-divider />
    <el-form label-width="30%">
      <el-form-item label="Total Locked Pair :">
        <div>{{ state.async.share.totalLockedPair }} Pair</div>
      </el-form-item>
      <el-form-item label="Your Locked Pair :">
        <div>{{ state.async.share.sharer.shareAmount }} Pair</div>
      </el-form-item>
      <el-form-item label="Your Claimable Pair :">
        <div>{{ state.async.share.sharer.getAmount }} Pair</div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="get()">Get</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { log } from "../const";
import { mapState } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      shareAmount: 0,
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
