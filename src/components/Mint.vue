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
          <el-button type="primary" @click="doMint()" :loading="mintLoad"
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
          <el-button type="primary" @click="doClaim()" :loading="claimLoad"
            >Claim</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { log, utils } from "../const";
import { mapState, mapActions } from "vuex";
import { State, YENModel } from "../store";
import { ElNotification } from "element-plus";

export default {
  data() {
    return {
      utils: utils,
      mintDialogText: "",
      mintLoad: false,
      claimLoad: false,
    };
  },
  async created() {
    await this.getMintData();
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    ...mapActions([
      "getMintData",
      "getBlockMintData",
      "mint",
      "claim",
      "getBlock",
    ]),
    async doMint() {
      this.mintLoad = true;
      await this.mint(
        async (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockNumber) {
            this.mintLoad = false;
            await this.getBlock(e.blockNumber);
            ElNotification({
              title: `Block ${e.blockNumber} Minted`,
              message: `You Minted ${utils.format.balance(
                Number(
                  this.state.async.mint.block[e.blockNumber].mints.div(
                    this.state.async.mint.block[e.blockNumber].persons
                  )
                ),
                18,
                "YEN",
                10
              )}, ${
                this.state.async.mint.block[e.blockNumber].persons
              } Person Share ${utils.format.balance(
                Number(this.state.async.mint.block[e.blockNumber].mints),
                18,
                "YEN",
                10
              )} !`,
              duration: 36000,
              offset: 50,
              type: "success",
            });
            this.getMintData();
            this.getBlockMintData();
          }
        }
      );
    },
    async doClaim() {
      this.claimLoad = true;
      await this.claim(
        async (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            this.claimLoad = false;
            await this.getMintData();
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
