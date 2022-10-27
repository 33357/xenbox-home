<template>
  <el-menu class="el-menu-demo" mode="horizontal">
    <el-menu-item index="1"> YEN </el-menu-item>
    <el-menu-item index="2"> Share </el-menu-item>
    <el-menu-item index="3"> Mint </el-menu-item>
    <el-menu-item index="4"> Stake </el-menu-item>
    <el-menu-item index="5"> Table </el-menu-item>
    <el-menu-item h="full" @click="toggleDark()">
      <button class="border-none w-full bg-transparent cursor-pointer" style="height: var(--ep-menu-item-height);">
        <i inline-flex i="dark:ep-moon ep-sunny" />
      </button>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { toggleDark } from '~/composables';
</script>
