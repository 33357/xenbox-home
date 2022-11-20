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
      <el-menu-item index="-2" class="item2">
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
import { log, utils } from "./const";
import { mapState, mapActions } from "vuex";
import { State } from "./store";
import { ElNotification } from "element-plus";

export default {
  data() {
    return {
      activeIndex: "1",
      toggleDark: useToggle(useDark()),
    };
  },
  created() {
    window.addEventListener("load", async () => {
      log("window load");
      await this.start();
      await this.runListen();
      setInterval(this.runListen, 6000);
    });
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    ...mapActions(["start", "listenBlock"]),
    handleSelect(key: string) {
      if (Number(key) > 0) {
        (this as any).activeIndex = key;
      }
    },
    async runListen() {
      await this.listenBlock(async (blockNumber: number) => {
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
          duration: 36000,
          offset: 50,
          type: 'info',
        });
        // }
      });
    },
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

.item2 {
  width: 25%;
}

.flex-grow {
  flex-grow: 1;
}
</style>
