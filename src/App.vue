<template>
  <el-config-provider namespace="ep">
    <el-menu
      :default-active="activeIndex"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <el-menu-item index="1" class="item"> Mint </el-menu-item>
      <el-menu-item index="2" class="item"> Box </el-menu-item>
      <el-menu-item index="3" class="item"> Share </el-menu-item>
      <el-menu-item index="4" class="item"> Search </el-menu-item>
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
        {{ state.app.userAddress }}
      </el-menu-item>
    </el-menu>
    <el-card class="box-card">
      <Mint v-if="activeIndex == '1'"></Mint>
      <Box v-if="activeIndex == '2'"></Box>
      <Share v-if="activeIndex == '3'"></Share>
      <Search v-if="activeIndex == '4'"></Search>
    </el-card>
  </el-config-provider>
</template>

<script lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { log } from "./const";
import { mapState, mapActions } from "vuex";
import { State } from "./store";
import { utils } from "./const";

export default {
  data() {
    return {
      activeIndex: "1",
      toggleDark: useToggle(useDark())
    };
  },
  created() {
    window.addEventListener("load", async () => {
      const chainId = Number(utils.func.getParameterByName("c"));
      const refer = utils.func.getParameterByName("r");
      log(`window load ${chainId} ${refer}`);
      await this.start({ chainId, refer });
    });
  },
  computed: mapState({
    state: (state: any) => state as State
  }),
  methods: {
    ...mapActions(["start"]),
    handleSelect(key: string) {
      if (Number(key) > 0) {
        (this as any).activeIndex = key;
      }
    }
  }
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}
</style>
