<template>
  <el-card class="box-card">
    <el-form label-width="30%">
      <el-form-item label="XEN 宝箱">
        <el-image
          v-if="account == 10"
          style="width: 300px; height: 300px"
          src="/public/1.png"
          fit="fill"
        />
        <el-image
          v-if="account == 20"
          style="width: 300px; height: 300px"
          src="/public/2.png"
          fit="fill"
        />
        <el-image
          v-if="account == 50"
          style="width: 300px; height: 300px"
          src="/public/3.png"
          fit="fill"
        />
        <el-image
          v-if="account == 100"
          style="width: 300px; height: 300px"
          src="/public/4.png"
          fit="fill"
        />
      </el-form-item>
      <el-form-item label="账号数量">
        <el-radio-group v-model="account" label="label position">
          <el-radio-button label="100">100</el-radio-button>
          <el-radio-button label="50">50</el-radio-button>
          <el-radio-button label="20">20</el-radio-button>
          <el-radio-button label="10">10</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="锁定时间">
        <el-input-number v-model="term" :min="1" @change="termChange" /> 天
      </el-form-item>
      <el-form-item label="预期获得">
        {{ `100 XEN` }}
      </el-form-item>
      <el-button type="primary" round @click="doMint"> 铸造 </el-button>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { utils } from "../const";
import { mapState, mapActions } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      utils: utils,
      account: 100,
      term: 30,
    };
  },
  created() {},
  computed: mapState({
    state: (state: any) => state as State,
  }),
  methods: {
    ...mapActions(["mint"]),
    termChange(num: number | undefined) {
      if (num) {
        this.term = num;
      }
    },
    doMint() {
      this.mint({ amount: this.account, term: this.term });
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
  width: 60%;
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
