<template>
  <div>
    <div>
      <el-image
        v-if="mintNum == 10"
        style="width: 300px; height: 300px"
        src="/public/1.png"
        fit="fill"
      />
      <el-image
        v-if="mintNum == 20"
        style="width: 300px; height: 300px"
        src="/public/2.png"
        fit="fill"
      />
      <el-image
        v-if="mintNum == 50"
        style="width: 300px; height: 300px"
        src="/public/3.png"
        fit="fill"
      />
      <el-image
        v-if="mintNum == 100"
        style="width: 300px; height: 300px"
        src="/public/4.png"
        fit="fill"
      />
    </div>
    <div>
      <el-radio-group v-model="mintNum" label="label position">
        <el-radio-button label="10">10</el-radio-button>
        <el-radio-button label="20">20</el-radio-button>
        <el-radio-button label="50">50</el-radio-button>
        <el-radio-button label="100">100</el-radio-button>
      </el-radio-group>
    </div>
    <el-divider />
    <el-button type="primary" round> Mint </el-button>
  </div>
</template>

<script lang="ts">
import { utils } from "../const";
import { mapState, mapActions } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      utils: utils,
      mintNum: 100,
    };
  },
  created() {},
  computed: mapState({
    state: (state: any) => state as State,
  }),
  methods: {},
};
</script>

<style></style>
