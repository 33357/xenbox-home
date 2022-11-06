<template>
  <el-config-provider namespace="ep">
    <el-menu
      :default-active="activeIndex"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <el-menu-item index="1" class="item"> YEN </el-menu-item>
      <el-menu-item index="2" class="item"> Share </el-menu-item>
      <el-menu-item index="3" class="item"> Mint </el-menu-item>
      <el-menu-item index="4" class="item"> Stake </el-menu-item>
      <el-menu-item index="5" class="item"> Table </el-menu-item>
      <el-menu-item index="-1" class="item" @click="toggleDark()">
        <button
          class="border-none w-full bg-transparent cursor-pointer"
          style="height: var(--ep-menu-item-height)"
        >
          <i inline-flex i="dark:ep-moon ep-sunny" />
        </button>
      </el-menu-item>
      <div class="flex-grow" />
      <el-menu-item index="-2" class="item" @click="linkWeb3()">
        {{ state.sync.userAddress }}
      </el-menu-item>
    </el-menu>
    <div>
      <Home v-if="activeIndex == '1'"></Home>
      <Share v-if="activeIndex == '2'"></Share>
      <Mint v-if="activeIndex == '3'"></Mint>
      <Stake v-if="activeIndex == '4'"></Stake>
      <Table v-if="activeIndex == '5'"></Table>
    </div>
  </el-config-provider>
</template>

<script lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { log } from "./const";
import { mapState } from "vuex";
import { State } from "./store";

export default {
  data() {
    return {
      activeIndex: "1",
    };
  },
  created() {
    window.addEventListener("load", async () => {
      log("window load");
      await (this as any).$store.dispatch("start");
    });
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    toggleDark() {
      useToggle(useDark());
    },
    handleSelect(key: string) {
      if (Number(key) > 0) {
        (this as any).activeIndex = key;
      }
    },
    linkWeb3() {},
  },
};
</script>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
}

.item {
  width: 7%;
}

.flex-grow {
  flex-grow: 1;
}
</style>
