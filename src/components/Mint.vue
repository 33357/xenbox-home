<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Mint Explanation</span>
        </div>
      </template>

      <el-form label-width="30%">
        <el-form-item label="Next Block Mint (Block Miners Share Rewards) :">
          <div>
            {{
              utils.format.balance(
                Number(state.async.mint.nextBlockMint),
                18,
                "YEN",
                10
              )
            }}
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="mint()" :loading="mintLoad"
            >Mint</el-button
          >
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
                10
              )
            }}
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="claim()" :loading="claimLoad"
            >Claim</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { log, utils } from "../const";
import { mapState } from "vuex";
import { State, YENModel } from "../store";

export default {
  data() {
    return {
      utils: utils,
      mintLoad: false,
      claimLoad: false,
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
      (this as any).mintLoad = true;
      await (this as any).$store.dispatch(
        "mint",
        (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            (this as any).mintLoad = false;
          }
        }
      );
    },
    async claim() {
      (this as any).claimLoad = true;
      await (this as any).$store.dispatch(
        "claim",
        (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            (this as any).claimLoad = false;
          }
        }
      );
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
