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
    <el-form-item label="Gas 预测：">
      <a
        :href="`https://gas.33357.club/?c=${state.app.chainId}&g=${gasLimit}`"
        target="_blank"
      >
        {{ `https://gas.33357.club/?c=${state.app.chainId}&g=${gasLimit}` }}
      </a>
    </el-form-item>
    <el-form-item label="XEN 宝箱">
      <img
        style="width: 250px; height: 250px"
        :src="`/box${amount}.png`"
        fit="fill"
      />
    </el-form-item>
    <el-form-item label="账号数量：">
      <el-radio-group v-model="amount" label="label position">
        <el-radio-button label="100">100</el-radio-button>
        <el-radio-button label="50">50</el-radio-button>
        <el-radio-button label="20">20</el-radio-button>
        <el-radio-button label="10">10</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="锁定时间：">
      <el-input-number v-model="term" :min="1" @change="termChange" /> 天
    </el-form-item>
    <el-form-item
      label="手续费率："
      v-if="state.app.feeMap[version][amount] != 0"
    >
      {{ state.app.feeMap[version][amount] / 100 }} %
    </el-form-item>
    <el-form-item
      label="预计获得："
      v-if="state.app.feeMap[version][amount] != 0 && !calculateMint.eq(0)"
    >
      {{
        `${utils.format.bigToString(
          calculateMint
            .mul(amount)
            .mul(10000 - state.app.feeMap[version][amount])
            .div(10000),
          18,
          0
        )} ${
          state.app.symbolMap[state.app.chainId].xen
        } (${utils.format.bigToString(
          calculateMint
            .mul(amount)
            .mul(10000 - state.app.feeMap[version][amount])
            .div(10000)
            .mul(utils.num.ether)
            .div(state.app.perEthAmount),
          18,
          6
        )} ${state.app.symbolMap[state.app.chainId].eth})`
      }}
    </el-form-item>
    <el-form-item label="高级设置：">
      <el-switch v-model="advanced" />
    </el-form-item>
    <el-form-item label="Gas 价格：" v-if="advanced">
      <el-input v-model="gasPrice" placeholder="gasPrice"
        ><template #append> Gwei </template>
      </el-input>
    </el-form-item>
    <el-form-item label="预计 Gas 费用:" v-if="advanced && gasPrice != ''">
      {{
        `${utils.format.bigToString(
          utils.format.stringToBig(gasPrice, 9).mul((gasLimit / 100) * amount),
          18,
          6
        )} ${state.app.symbolMap[state.app.chainId].eth}`
      }}
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
import { toRaw } from "vue";

export default {
  data() {
    return {
      utils: utils,
      amount: 100,
      term: 0,
      version: 1,
      calculateMint: BigNumber.from(0),
      ethPrice: BigNumber.from(0),
      advanced: false,
      gasPrice: "",
      gasLimit: 19000000
    };
  },
  created() {
    this.getCalculateMint();
    this.term = this.state.app.defaultTerm;
  },
  computed: mapState({
    state: (state: any) => state as State
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
    "state.app.start"() {
      this.getCalculateMint();
    }
  },
  methods: {
    ...mapActions(["getMintData", "mint"]),
    async getCalculateMint() {
      if (this.state.app.ether.xenBoxHelper) {
        this.calculateMint = await toRaw(
          this.state.app.ether.xenBoxHelper
        ).calculateMintRewardNew(
          Math.ceil(
            (this.state.app.rankMap[this.state.app.defaultTerm] * this.term) /
              this.state.app.defaultTerm
          ),
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
        amount: this.amount,
        term: this.term,
        refer: this.state.storage.referMap[this.state.app.chainId]
          ? this.state.storage.referMap[this.state.app.chainId]
          : utils.num.min,
        gasPrice:
          this.gasPrice == ""
            ? undefined
            : utils.format.stringToBig(this.gasPrice, 9)
      });
    }
  }
};
</script>

<style></style>
