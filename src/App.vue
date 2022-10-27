<template>
  <el-config-provider namespace="ep">
    <el-menu mode="horizontal">
      <el-menu-item index="1" class="item" @click="changePage(1)"> YEN </el-menu-item>
      <el-menu-item index="2" class="item" @click="changePage(2)"> Share </el-menu-item>
      <el-menu-item index="3" class="item" @click="changePage(3)"> Mint </el-menu-item>
      <el-menu-item index="4" class="item" @click="changePage(4)"> Stake </el-menu-item>
      <el-menu-item index="5" class="item" @click="changePage(5)"> Table </el-menu-item>
      <el-menu-item h="full" class="item" @click="toggleDark()">
        <button class="border-none w-full bg-transparent cursor-pointer" style="height: var(--ep-menu-item-height);">
          <i inline-flex i="dark:ep-moon ep-sunny" />
        </button>
      </el-menu-item>
    </el-menu>
    <div>
      <Home v-if="pageNum == 1"></Home>
      <Mint v-if="pageNum == 2"></Mint>
      <Share v-if="pageNum == 3"></Share>
      <Stake v-if="pageNum == 4"></Stake>
      <Table v-if="pageNum == 5"></Table>
    </div>
  </el-config-provider>
</template>

<script lang="ts" setup>
import { useDark, useToggle } from '@vueuse/core'

const toggleDark = useToggle(useDark())
let pageNum = 1;

function changePage(num: number) {
  pageNum = num;
}

</script>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
}

.item {
  width: 7%;
}
</style>
