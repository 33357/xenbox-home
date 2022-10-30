<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Stake Explanation</span>
        </div>
      </template>

      <el-form label-width="50%">
        <el-form-item label="Pair Stake Amount :">
          <div> 123 ETH </div>
        </el-form-item>
        <el-form-item label="Predict APY :">
          <div> 100 % </div>
        </el-form-item>
        <el-form-item label="stake Amount :">
          <el-input v-model="stakeAmount" type="string" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="stake()">Stake</el-button>
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="50%">
        <el-form-item label="Your Stake Amount :">
          <div> 123 ETH </div>
        </el-form-item>
        <el-form-item label="withdrawStake Amount :">
          <el-input v-model="withdrawStakeAmount" type="string" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="withdrawStake()">Claim</el-button>
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="50%">
        <el-form-item label="Your Reward Amount :">
          <div> 123 ETH </div>
        </el-form-item>
        <el-form-item label="withdrawReward Amount :">
          <el-input v-model="withdrawRewardAmount" type="string" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="withdrawReward()">WithdrawReward</el-button>
        </el-form-item>
      </el-form>

      <el-divider />
      <el-form label-width="50%">
        <el-form-item>
          <el-button type="primary" @click="exit()">Exit</el-button>
        </el-form-item>
      </el-form>

    </el-card>
  </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'

const stakeAmount = ref(0);
const withdrawStakeAmount = ref(0);
const withdrawRewardAmount = ref(0);

function stake() {

}

function withdrawStake() {

}

function withdrawReward() {

}

function exit() {

}
</script>
  
<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 480px;
  margin-left: auto;
  margin-right: auto;
}
</style>