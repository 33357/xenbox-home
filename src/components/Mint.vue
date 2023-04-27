<template>
  <el-form label-width="30%">
    <el-form-item label="交易：">
      <a href="https://opensea.io/zh-CN/collection/xenbox" target="_blank">
        Opensea
      </a>
    </el-form-item>
    <el-form-item label="社群：">
      <a href="https://t.me/xenboxstore" target="_blank"> Telegram </a>
    </el-form-item>
    <el-form-item label="XEN 宝箱">
      <img
        style="width: 250px; height: 250px"
        :src="`/box${account}.png`"
        fit="fill"
      />
    </el-form-item>
    <el-form-item label="账号数量：">
      <el-radio-group v-model="account" label="label position">
        <el-radio-button label="100">100</el-radio-button>
        <el-radio-button label="50">50</el-radio-button>
        <el-radio-button label="20">20</el-radio-button>
        <el-radio-button label="10">10</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="锁定时间：">
      <el-input-number v-model="term" :min="1" @change="termChange" /> 天
    </el-form-item>
    <el-form-item label="预计获得：" v-if="state.mint.fee != 0">
      {{
        utils.format.bigToString(
          calculateMint
            .mul(account)
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
    <el-form-item label="最大费用：" v-if="advanced">
      <el-input v-model="maxFeePerGas" placeholder="maxFeePerGas"
        ><template #append> Gwei </template>
      </el-input>
    </el-form-item>
    <el-form-item label="最大优先费用:" v-if="advanced">
      <el-input
        v-model="maxPriorityFeePerGas"
        placeholder="maxPriorityFeePerGas"
      >
        <template #append> Gwei </template>
      </el-input>
    </el-form-item>
    <el-form-item label="预计 Gas 费用:" v-if="advanced && maxFeePerGas != ''">
      {{
        utils.format.bigToString(
          utils.format.stringToBig(maxFeePerGas, 9).mul((gas / 100) * account),
          18
        )
      }}
      ETH
    </el-form-item>
    <el-form-item>
      <el-button type="primary" round @click="doMint"> 铸造 </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { BigNumber, utils, log } from "../const";

export default {
  data() {
    return {
      utils: utils,
      account: 100,
      term: 100,
      calculateMint: BigNumber.from(0),
      advanced: false,
      maxFeePerGas: "",
      maxPriorityFeePerGas: "",
      gas: 19000000,
    };
  },
  created() {
    this.getCalculateMint();
  },
  computed: mapState({
    state: (state: any) => state as State,
  }),
  watch: {
    advanced(value) {
      if (value == false) {
        this.maxFeePerGas = "";
        this.maxPriorityFeePerGas = "";
      }
    },
    term() {
      this.getCalculateMint();
    },
    "state.app.start"() {
      this.getCalculateMint();
    },
  },
  methods: {
    ...mapActions(["getMintData", "mint"]),
    async getCalculateMint() {
      if (this.state.app.ether.xenBoxHelper) {
        this.calculateMint =
          await this.state.app.ether.xenBoxHelper.calculateMintRewardNew(
            Math.ceil((this.state.app.rankMap[30] * this.term) / 30),
            this.term
          );
      }
    },
    termChange(num: number | undefined) {
      if (num) {
        this.term = num;
      }
    },
    doMint() {
      this.mint({
        amount: this.account,
        term: this.term,
        maxFeePerGas:
          this.maxFeePerGas == ""
            ? undefined
            : utils.format.stringToBig(this.maxFeePerGas, 9),
        maxPriorityFeePerGas:
          this.maxPriorityFeePerGas == ""
            ? undefined
            : utils.format.stringToBig(this.maxPriorityFeePerGas, 9),
      });
    },
  },
};
</script>

<style></style>
