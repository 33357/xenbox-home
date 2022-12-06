<template>
  <div>
    <img alt="YEN logo" src="/public/logo.png" />
    <h1>Gas Minting + Halving + LP Staking</h1>
    <p>Second Generation XEN Mode</p>
    <el-button type="primary" @click="addToken"> Add YEN </el-button>
    <el-button type="primary" @click="utils.go.token(state.sync.chainId,state.sync.yenAddress)"> Go Etherscan </el-button>
  </div>
</template>

<script lang="ts">
import { utils } from "../const";
import { mapState, mapActions } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      utils:utils,
    };
  },
  created() {},
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    ...mapActions([
      "addToken",
    ]),
  },
};
</script>

<style>
</style>
