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

      <el-divider />
      <el-form label-width="30%">
        <el-table :data="mintedList" stripe height="300" style="width: 100%">
          <el-table-column prop="block" label="Block" width="150" />
          <el-table-column prop="minted" label="Minted" width="200" />
          <el-table-column prop="person" label="Person" width="150" />
          <el-table-column prop="total" label="Total" />
        </el-table>
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
      mintedList: [],
    };
  },
  async created() {
    await this.getMintData(this.getMintedData);
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
    async getMintedData() {
      const mintedList: {
        block: number;
        minted: string;
        person: number;
        total: string;
      }[] = [];
      this.state.async.mint.personBlockList.forEach((blockNumber) => {
        if (
          this.state.async.mint.block[blockNumber] &&
          !this.state.async.mint.block[blockNumber].mints.eq(0)
        ) {
          mintedList.push({
            block: blockNumber,
            minted: utils.format.balance(
              Number(
                this.state.async.mint.block[blockNumber].mints.div(
                  this.state.async.mint.block[blockNumber].persons
                )
              ),
              18,
              "YEN",
              10
            ),
            person: Number(this.state.async.mint.block[blockNumber].persons),
            total: utils.format.balance(
              Number(this.state.async.mint.block[blockNumber].mints),
              18,
              "YEN",
              10
            ),
          });
        }
      });
      this.mintedList = mintedList as any;
    },
    async doMint() {
      this.mintLoad = true;
      await this.mint(
        async (
          e: YENModel.ContractTransaction | YENModel.ContractReceipt | null
        ) => {
          if (!e) {
            this.mintLoad = false;
          } else if (e.blockNumber) {
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
            await this.getMintData(this.getMintedData);
            this.getBlockMintData();
          }
        }
      );
    },
    async doClaim() {
      this.claimLoad = true;
      await this.claim(
        async (
          e: YENModel.ContractTransaction | YENModel.ContractReceipt | null
        ) => {
          if (!e) {
            this.claimLoad = false;
          } else if (e.blockNumber) {
            this.claimLoad = false;
            await this.getMintData(this.getMintedData);
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

.infinite-list {
  height: 300px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: rgb(216, 233, 253);
  margin: 10px;
  color: rgb(20, 122, 246);
}
.infinite-list .infinite-list-item + .list-item {
  margin-top: 10px;
}
</style>
