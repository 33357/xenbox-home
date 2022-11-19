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
          <div>
            {{
              utils.format.balance(
                Number(state.async.table.totalSupply),
                18,
                "YEN",
                5
              )
            }}
          </div>
        </el-form-item>
        <el-form-item label="Halving Date :">
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
          <div>{{ state.async.table.feeMul }} ‰ (Dynamic Rate: 20% Burn, 80% For LP)</div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { log, utils } from "../const";
import { mapState } from "vuex";
import { State } from "../store";

export default {
  data() {
    return {
      utils: utils,
    };
  },
  async created() {
    await (this as any).$store.dispatch("getTableData");
  },
  computed: mapState({
    state: (state) => state as State,
  }),
  methods: {},
};
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
