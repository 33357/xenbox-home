<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Share Explanation</span>
      </div>
    </template>

    <el-form label-width="30%">
      <el-form-item label="Share Deadline :">
        <div v-if="state.async.share.shareEndBlock.gte(state.sync.thisBlock)">
          {{
            new Date(
              (Number(
                state.async.share.shareEndBlock.sub(state.sync.thisBlock)
              ) *
                12 +
                state.sync.thisTime) *
                1000
            ).toLocaleString()
          }}
        </div>
        <div v-else>End Sharing</div>
      </el-form-item>
      <el-form-item label="Total Share ETH :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.totalShareETH),
              18,
              "ETH",
              10
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Your Share ETH :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.sharer.shares),
              18,
              "ETH",
              10
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Total Share YEN :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.totalShareYEN),
              18,
              "YEN",
              10
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Your Share YEN :">
        <div>
          {{
            utils.format.balance(
              state.async.share.totalShareETH.eq(0)
                ? 0
                : Number(
                    state.async.share.totalShareYEN
                      .mul(state.async.share.sharer.shares)
                      .div(state.async.share.totalShareETH)
                  ),
              18,
              "YEN",
              10
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Share ETH :">
        <el-input v-model="shares" type="string" />
      </el-form-item>
      <el-form-item label="Estimate Get :">
        <div>
          {{
            utils.format.balance(
              state.async.share.totalShareETH.add(sharesBig).eq(0)
                ? 0
                : Number(
                    state.async.share.totalShareYEN
                      .mul(sharesBig)
                      .div(state.async.share.totalShareETH.add(sharesBig))
                  ),
              18,
              "YEN",
              10
            )
          }}
        </div>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="doShare()"
          :disabled="state.async.share.shareEndBlock.lt(state.sync.thisBlock)"
          :loading="shareLoad"
          >Share</el-button
        >
      </el-form-item>
    </el-form>

    <el-divider />
    <el-form label-width="30%">
      <el-form-item label="Total Locked Pair :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.totalLockedPair),
              18,
              "Pair",
              10
            )
          }}
        </div>
      </el-form-item>
      <el-form-item label="Your Claimable Pair :">
        <div>
          {{
            utils.format.balance(
              Number(state.async.share.yourClaimablePair),
              18,
              "Pair",
              10
            )
          }}
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="doGet()" :loading="getLoad"
          >Get</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { log, utils, BigNumber } from "../const";
import { mapState, mapActions } from "vuex";
import { State, YENModel } from "../store";

export default {
  data() {
    return {
      shares: 0,
      sharesBig: BigNumber.from(0),
      utils: utils,
      shareLoad: false,
      getLoad: false,
    };
  },
  async created() {
    await this.getShareData();
  },
  watch: {
    shares(value) {
      this.sharesBig = BigNumber.from(value * 10 ** 9).mul(10 ** 9);
    },
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    ...mapActions(["getShareData", "share", "getShare"]),
    async doShare() {
      this.shareLoad = true;
      await this.share({
        shares: this.sharesBig,
        func: async (
          e: YENModel.ContractTransaction | YENModel.ContractReceipt | null
        ) => {
          if (!e) {
            this.shareLoad = false;
          } else if (e.blockNumber) {
            this.shareLoad = false;
            await this.getShareData();
          }
        },
      });
    },
    async doGet() {
      this.getLoad = true;
      await this.getShare(
        async (
          e: YENModel.ContractTransaction | YENModel.ContractReceipt | null
        ) => {
          if (!e) {
            this.getLoad = false;
          } else if (e.blockNumber) {
            this.getLoad = false;
            await this.getShareData();
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
  width: 50%;
  margin-left: auto;
  margin-right: auto;
}
</style>
