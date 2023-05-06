<template>
  <el-form label-width="30%">
    <el-form-item
      :label="
        `邀请链接${
          state.share.referFeePercent > 0
            ? `(${state.share.referFeePercent}%奖励)`
            : ''
        }：`
      "
    >
      {{
        `https://xenbox.store/?c=${state.app.chainId}&r=${state.app.userAddress}`
      }}
    </el-form-item>
    <el-form-item label="未领奖励：">
      {{
        `${utils.format.bigToString(state.share.reward, 18, 0)} ${
          state.app.symbolMap[state.app.chainId].xen
        }`
      }}
    </el-form-item>
    <el-form-item label="已邀请 xen 宝箱："> </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { utils } from "../const";

export default {
  data() {
    return {
      utils: utils
    };
  },
  created() {
    this.getShareData();
  },
  computed: mapState({
    state: (state: any) => state as State
  }),
  methods: {
    ...mapActions(["getShareData"]),
    async search() {}
  }
};
</script>

<style></style>
