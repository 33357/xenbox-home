<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Table Explanation</span>
        </div>
      </template>
      <el-form label-width="30%">
        <el-form-item label="Max TotalSupply :">
          <div>50000000 YEN</div>
        </el-form-item>
        <el-form-item label="TotalSupply :">
          <div>1000 YEN</div>
        </el-form-item>
        <el-form-item label="Halving Countdown :">
          <div>10:10:10</div>
        </el-form-item>
        <el-form-item label="Mint Account :">
          <div>10000</div>
        </el-form-item>
        <el-form-item label="Pair TVL">
          <div>10000 ETH</div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
  
<script setup lang="ts">
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