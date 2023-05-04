<template>
  <el-scrollbar height="600px">
    <el-card
      v-for="tokenId in state.box.tokenIdList"
      :key="tokenId"
      :body-style="{ padding: '0px', marginBottom: '1px' }"
    >
      <block v-if="state.app.tokenMap[tokenId].end != 0">
        <img
          style="width: 100px; height: 100px"
          :src="`/box${
            state.app.tokenMap[tokenId].end - state.app.tokenMap[tokenId].start
          }.png`"
          fit="fill"
        />
        <div class="card-header" style="padding: 5px">
          <span>ID：{{ tokenId }}</span>
          <span
            >账号数量：{{
              state.app.tokenMap[tokenId].end -
              state.app.tokenMap[tokenId].start
            }}</span
          >
          <span v-if="state.app.tokenMap[tokenId].term != 0"
            >锁定时间：{{ state.app.tokenMap[tokenId].term }} 天</span
          >
          <span
            v-if="
              !state.app.tokenMap[tokenId].mint.eq(0) && state.mint.fee != 0
            "
          >
            实计获得：{{
              utils.format.bigToString(
                state.app.tokenMap[tokenId].mint
                  .mul(10000 - state.mint.fee)
                  .div(10000),
                18
              )
            }}
            XEN
          </span>
          <div v-if="state.app.tokenMap[tokenId].time != 0">
            到期时间：{{
              new Date(state.app.tokenMap[tokenId].time * 1000).toLocaleString()
            }}
          </div>
          <el-button
            @click="doClaim(tokenId)"
            :disabled="
              new Date().getTime() / 1000 < state.app.tokenMap[tokenId].time ||
              state.app.tokenMap[tokenId].time == 0
            "
          >
            开启
          </el-button>
        </div>
      </block>
    </el-card>
  </el-scrollbar>
  <el-dialog v-model="dialogVisible" title="开启宝箱" width="30%">
    <el-form label-width="30%">
      <el-form-item label="重新锁定时间">
        <el-input-number v-model="term" :min="1" @change="termChange" /> 天
      </el-form-item>
      <el-form-item label="预计获得" v-if="state.mint.fee != 0">
        {{
          utils.format.bigToString(
            calculateMint
              .mul(
                state.app.tokenMap[tokenId].end -
                  state.app.tokenMap[tokenId].start
              )
              .mul(10000 - state.mint.fee)
              .div(10000),
            18
          )
        }}
        XEN
      </el-form-item>
      <el-form-item label="高级设置：">
        <el-switch v-model="advanced" />
      </el-form-item>
      <el-form-item label="Gas 价格：" v-if="advanced">
        <el-input v-model="gasPrice" placeholder="gasPrice"
          ><template #append> Gwei </template>
        </el-input>
      </el-form-item>
      <el-form-item
        label="预计 Gas 费用:"
        v-if="advanced && gasPrice != ''"
      >
        {{
          utils.format.bigToString(
            utils.format
              .stringToBig(gasPrice, 9)
              .mul(
                (gas / 100) *
                  (state.app.tokenMap[tokenId].end -
                    state.app.tokenMap[tokenId].start)
              ),
            18
          )
        }}
        ETH
      </el-form-item>
    </el-form>
    <template #footer>
      <span>
        <el-button @click="dialogVisible = false"> 取消 </el-button>
        <el-button type="primary" @click="confirm"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { BigNumber, utils } from "../const";

export default {
  data() {
    return {
      utils: utils,
      dialogVisible: false,
      term: 100,
      tokenId: 0,
      calculateMint: BigNumber.from(0),
      advanced: false,
      gasPrice: "",
      gas: 7000000,
    };
  },
  created() {
    this.getBoxData();
  },
  computed: mapState({
    state: (state: any) => state as State,
  }),
  watch: {
    advanced(value) {
      if (value == false) {
        this.gasPrice = "";
      }
    },
    term() {
      this.getCalculateMint();
    },
  },
  methods: {
    ...mapActions(["getBoxData", "claim", "getRankData"]),
    async getCalculateMint() {
      if (this.state.app.ether.xenBoxHelper) {
        this.calculateMint =
          await this.state.app.ether.xenBoxHelper.calculateMintRewardNew(
            Math.ceil((this.state.app.rankMap[30] * this.term) / 30),
            this.term
          );
      }
    },
    async confirm() {
      await this.claim({
        tokenId: this.tokenId,
        term: this.term,
        gasPrice:
          this.gasPrice == ""
            ? undefined
            : utils.format.stringToBig(this.gasPrice, 9)
      });
      this.dialogVisible = false;
      this.getBoxData();
    },
    doClaim(tokenId: number) {
      this.tokenId = tokenId;
      this.dialogVisible = true;
      this.getCalculateMint();
    },
    termChange(num: number | undefined) {
      if (num) {
        this.term = num;
      }
    },
  },
};
</script>

<style></style>
