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

    <el-dialog
      v-model="mintDialogVisible"
      title="Minted"
      width="30%"
      align-center
    >
      <span>{{ mintDialogText }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="mintDialogVisible = false">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { log, utils } from "../const";
import { mapState } from "vuex";
import { State, YENModel } from "../store";
import { ElNotification } from "element-plus";
import { toRaw } from "vue";

export default {
  data() {
    return {
      utils: utils,
      mintDialogText: "",
      mintLoad: false,
      claimLoad: false,
      mintDialogVisible: false,
      blockNumber: 0,
      timeInter: null,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getMintData");
    await this.listenBlock();
    this.timeInter = setInterval(this.listenBlock, 6000) as any;
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  beforeUnmount() {
    clearInterval(this.timeInter as any);
    this.timeInter = null;
  },
  methods: {
    async mint() {
      this.mintLoad = true;
      await (this as any).$store.dispatch(
        "mint",
        async (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            this.mintLoad = false;
            const blockNumber = e.blockNumber;
            if (blockNumber) {
              await (this as any).$store.dispatch("getBlock", blockNumber);
              this.mintDialogText = `You Minted ${utils.format.balance(
                Number(
                  this.state.async.mint.block[blockNumber].mints.div(
                    this.state.async.mint.block[blockNumber].persons
                  )
                ),
                18,
                "YEN",
                10
              )}, ${
                this.state.async.mint.block[blockNumber].persons
              } Person Share ${utils.format.balance(
                Number(this.state.async.mint.block[blockNumber].mints),
                18,
                "YEN",
                10
              )} !`;
              this.mintDialogVisible = true;
            }
          }
        }
      );
    },
    async claim() {
      this.claimLoad = true;
      await (this as any).$store.dispatch(
        "claim",
        (e: YENModel.ContractTransaction | YENModel.ContractReceipt) => {
          if (e.blockHash) {
            this.claimLoad = false;
          }
        }
      );
    },
    async listenBlock() {
      if (this.state.sync.ether.singer) {
        const blockNumber = await toRaw(
          this.state.sync.ether.singer
        ).provider?.getBlockNumber();
        if (blockNumber && blockNumber > this.blockNumber) {
          this.blockNumber = blockNumber;
          await (this as any).$store.dispatch("getBlock", blockNumber);
          log(
            `listen ${blockNumber} ${this.state.async.mint.block[blockNumber].persons}`
          );
          // if (this.state.async.mint.block[blockNumber].persons.gt(0)) {
            ElNotification({
              title: `Block ${blockNumber} Minted`,
              message: `${
                this.state.async.mint.block[blockNumber].persons
              } Person Share ${utils.format.balance(
                Number(this.state.async.mint.block[blockNumber].mints),
                18,
                "YEN",
                10
              )} !`,
              duration: 12000,
            });
          // }
        }
      }
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
