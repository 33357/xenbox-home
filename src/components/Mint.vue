<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Mint Explanation</span>
        </div>
      </template>

      <el-form label-width="30%">
        <el-form-item label="Next Block Mint :">
          <div>{{ state.async.mint.nextBlockMint }} YEN</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="mint()">Mint</el-button>
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="30%">
        <el-form-item label="Minted :">
          <div>{{ state.async.mint.yourMinted }} YEN</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="claim()">Claim</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { log } from "../const";
import { mapState } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {};
  },
  async created() {
    await (this as any).$store.dispatch("getMintData");
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    mint() {},
    claim() {},
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
