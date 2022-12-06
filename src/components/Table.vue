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
          <div>43200000 YEN</div>
        </el-form-item>
        <el-form-item label="Burned :">
          <div>
            {{
              `${utils.format.bigToString(state.async.table.burned, 18)} YEN`
            }}
          </div>
        </el-form-item>
        <el-form-item label="TotalSupply :">
          <div>
            {{
              `${utils.format.bigToString(
                state.async.table.totalSupply,
                18
              )} YEN`
            }}
          </div>
        </el-form-item>
        <el-form-item label="Per Block Mint :">
          <div>
            {{
              `${utils.format.bigToString(
                state.async.table.blockMints,
                18
              )} YEN`
            }}
            (50% To Miner, 50% To LP)
          </div>
        </el-form-item>
        <el-form-item label="Next Halving Date :(30 days to halve)">
          <div>
            {{
              new Date(
                (Number(
                  state.async.table.halvingBlock.sub(state.sync.thisBlock)
                ) *
                  12 +
                  state.sync.thisTime) *
                  1000
              ).toLocaleString()
            }}
          </div>
        </el-form-item>
        <el-form-item label="Transfer Fee :">
          <div>
            1 ‰ (50% To Burn, 50% To LP)
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { utils } from "../const";
import { mapState, mapActions } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      utils: utils,
    };
  },
  async created() {
    await this.getTableData();
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {
    ...mapActions(["getTableData"]),
  },
};
</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 40%;
  margin-left: auto;
  margin-right: auto;
}
</style>
