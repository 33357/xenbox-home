<template>
  <el-card class="box-card">
    <el-scrollbar height="600px">
      <el-card
        v-for="tokenId in state.box.tokenIdList"
        :key="tokenId.toString()"
        :body-style="{ padding: '0px', marginBottom: '1px' }"
      >
        <el-image
          style="width: 100px; height: 100px"
          src="/public/1.png"
          fit="fill"
        />
        <div style="padding: 14px">
          <span
            >账号数量：{{
              state.box.tokenMap[tokenId.toString()].end
                .sub(state.box.tokenMap[tokenId.toString()].start)
                .toString()
            }}</span
          >
          <div class="bottom card-header">
            <div
              class="time"
              v-if="state.box.tokenMap[tokenId.toString()].time"
            >
              到期时间：{{
                new Date(
                  state.box.tokenMap[tokenId.toString()].time * 1000
                ).toLocaleString()
              }}
            </div>
            <el-button text class="button"> 提取 </el-button>
          </div>
        </div>
      </el-card>
    </el-scrollbar>
  </el-card>
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
  created() {
    this.getBoxData();
  },
  computed: mapState({
    state: (state: any) => state as State,
  }),
  methods: {
    ...mapActions(["getBoxData"]),
  },
};
</script>

<style>
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
</style>
