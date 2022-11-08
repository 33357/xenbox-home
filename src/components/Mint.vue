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
          <div>
            {{
              utils.format.balance(
                Number(state.async.mint.nextBlockMint),
                18,
                "YEN",
                5
              )
            }}
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="mint()">Mint</el-button>
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="30%">
        <el-form-item label="Minted :">
          <div>
            {{
              utils.format.balance(
                Number(state.async.mint.yourMinted),
                18,
                "YEN",
                5
              )
            }}
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="claim()">Claim</el-button>
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
      utils: utils,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getMintData");
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    async mint() {
      await (this as any).$store.dispatch("mint");
    },
    async claim() {
      await (this as any).$store.dispatch("claim");
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
