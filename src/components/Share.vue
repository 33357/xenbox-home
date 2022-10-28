<template>
    <el-card class="box-card">
        <el-form label-width="200px">
            <el-form-item label="Total Share ETH Amount :">
                <div> 123 ETH </div>
            </el-form-item>
            <el-form-item label="Share ETH Amount :">
                <el-input v-model="shareAmount" type="string" />
            </el-form-item>
            <el-form-item label="Estimate Get YEN Amount :">
                <div> 123 YEN </div>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="share()">Share</el-button>
            </el-form-item>
        </el-form>
        <el-divider />
        <el-form label-width="200px">
            <el-form-item label="Total Locked Pair Amount :">
                <div> 123 Pair </div>
            </el-form-item>
            <el-form-item label="Your Locked Pair Amount :">
                <div> 123 Pair </div>
            </el-form-item>
            <el-form-item label="Your Claimable Pair Amount :">
                <div> 123 Pair </div>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="claim()">Claim</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'

const shareAmount = ref(0);

function share() {

}

function claim() {

}
</script>
  
<style>
.box-card {
    width: 50%;
}
</style>