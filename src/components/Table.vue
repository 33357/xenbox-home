<template>
  <el-form label-width="30%">
    <el-form-item label="xenbox 总量：">
      {{ state.table.totalToken }}
    </el-form-item>
    <el-form-item label="xenbox 地址：">
      <a
        :href="
          `${state.app.chainMap[state.app.chainId].scan}address/${
            state.table.tokenAddress
          }`
        "
        target="_blank"
      >
        点击跳转
      </a>
    </el-form-item>
    <el-form-item
      :label="`${state.app.chainMap[state.app.chainId].xen} 地址：`"
    >
      <a
        :href="
          `${state.app.chainMap[state.app.chainId].scan}token/${
            state.table.xenAddress
          }`
        "
        target="_blank"
      >
        点击跳转
      </a>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        round
        @click="addToken"
        v-if="state.app.chainId"
      >
        {{ `添加 ${state.app.chainMap[state.app.chainId].xen}` }}
      </el-button></el-form-item
    >
    <el-form-item label="资金池：">
      {{
        `${utils.format.bigToString(state.table.poolBalance, 18, 6)} ${
          state.app.chainMap[state.app.chainId].eth
        }`
      }}
    </el-form-item>
    <el-form-item label="交易：">
      <a
        :href="
          `${state.app.chainMap[state.app.chainId].swap}${
            state.table.xenAddress
          }`
        "
        target="_blank"
      >
        点击跳转
      </a>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { utils, log } from "../const";

export default {
  data() {
    return {
      utils: utils
    };
  },
  created() {
    this.getTableData();
  },
  computed: mapState({
    state: (state: any) => state as State
  }),
  watch: {
    "state.app.start"() {
      this.getTableData();
    }
  },
  methods: {
    ...mapActions(["getTableData"]),
    addToken() {
      this.state.app.ether.addToken(
        this.state.app.chainMap[this.state.app.chainId].xen
      );
    }
  }
};
</script>

<style></style>
