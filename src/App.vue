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
      <Box v-if="activeIndex == '2'"></Box>
    </div>
  </el-config-provider>
</template>

<script lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { utils } from "./const";
import { mapState, mapActions } from "vuex";
import { State } from "./store";

export default {
  data() {
    return {
      activeIndex: "1",
      toggleDark: useToggle(useDark()),
    };
  },
  created() {
    window.addEventListener("load", async () => {
      utils.func.log("window load");
      await this.start();
    });
  },
  computed: mapState({
    state: (state:any) => state as State,
  }),
  methods: {
    ...mapActions(["start"]),
    handleSelect(key: string) {
      if (Number(key) > 0) {
        (this as any).activeIndex = key;
      }
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
