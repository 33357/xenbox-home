<template>
    <div>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>Mint Explanation</span>
                </div>
            </template>

            <el-form label-width="30%">
                <el-form-item label="Next Block Mint :">
                    <div> 50 YEN </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="mint()">Mint</el-button>
                </el-form-item>
            </el-form>

            <el-divider />
            <el-form label-width="30%">
                <el-form-item label="Minted :">
                    <div> 50 YEN </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="claim()">Claim</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>
  
<script setup lang="ts">

function mint() {

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
    width: 480px;
    margin-left: auto;
    margin-right: auto;
}
</style>