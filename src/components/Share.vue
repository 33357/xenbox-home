<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>Share Explanation</span>
            </div>
        </template>

        <el-form label-width="30%">
            <el-form-item label="Total Share ETH :">
                <div> 123 ETH </div>
            </el-form-item>
            <el-form-item label="Share ETH :">
                <el-input v-model="shareAmount" type="string" />
            </el-form-item>
            <el-form-item label="Estimate Get :">
                <div> 123 YEN </div>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="share()">Share</el-button>
            </el-form-item>
        </el-form>

        <el-divider />
        <el-form label-width="30%">
            <el-form-item label="Total Locked Pair :">
                <div> 123 Pair </div>
            </el-form-item>
            <el-form-item label="Your Locked Pair :">
                <div> 123 Pair </div>
            </el-form-item>
            <el-form-item label="Your Claimable Pair :">
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
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.box-card {
    width: 50%;
    margin-left: auto;
    margin-right: auto;
}
</style>