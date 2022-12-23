<template>
  <el-card class="box-card">
    <el-scrollbar height="600px">
      <el-card
        v-for="tokenId in state.box.tokenIdList"
        :key="tokenId.toString()"
        :body-style="{ padding: '0px', marginBottom: '1px' }"
      >
        <img
          v-if="
            state.box.tokenMap[tokenId.toString()].end
              .sub(state.box.tokenMap[tokenId.toString()].start)
              .eq(10)
          "
          style="width: 100px; height: 100px"
          src="/public/1.png"
          fit="fill"
        />
        <img
          v-if="
            state.box.tokenMap[tokenId.toString()].end
              .sub(state.box.tokenMap[tokenId.toString()].start)
              .eq(20)
          "
          style="width: 100px; height: 100px"
          src="/public/2.png"
          fit="fill"
        />
        <img
          v-if="
            state.box.tokenMap[tokenId.toString()].end
              .sub(state.box.tokenMap[tokenId.toString()].start)
              .eq(50)
          "
          style="width: 100px; height: 100px"
          src="/public/3.png"
          fit="fill"
        />
        <img
          v-if="
            state.box.tokenMap[tokenId.toString()].end
              .sub(state.box.tokenMap[tokenId.toString()].start)
              .eq(100)
          "
          style="width: 100px; height: 100px"
          src="/public/4.png"
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
          <div
            class="bottom card-header"
            v-if="state.box.tokenMap[tokenId.toString()].time"
          >
            <div class="time">
              到期时间：{{
                new Date(
                  state.box.tokenMap[tokenId.toString()].time * 1000
                ).toLocaleString()
              }}
            </div>
            <el-button
              class="button"
              @click="doClaim(tokenId)"
              :disabled="
                new Date().getTime() / 1000 <
                state.box.tokenMap[tokenId.toString()].time
              "
            >
              提取
            </el-button>
          </div>
        </div>
      </el-card>
    </el-scrollbar>
  </el-card>
  <el-dialog v-model="dialogVisible" title="重新锁定时间" width="30%">
    <el-input-number v-model="term" :min="1" @change="termChange" /> 天
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false"> 取消 </el-button>
        <el-button type="primary" @click="confirm"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { utils } from "../const";
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { BigNumber } from "ethers";

export default {
  data() {
    return {
      utils: utils,
      dialogVisible: false,
      term: 30,
      tokenId: BigNumber.from(0),
    };
  },
  created() {
    this.getBoxData();
  },
  computed: mapState({
    state: (state: any) => state as State,
  }),
  methods: {
    ...mapActions(["getBoxData", "claim"]),
    confirm() {
      this.dialogVisible = false;
      this.claim({ tokenId: this.tokenId, term: this.term });
    },
    doClaim(tokenId: BigNumber) {
      this.tokenId = tokenId;
      this.dialogVisible = true;
    },
    termChange(num: number | undefined) {
      if (num) {
        this.term = num;
      }
    },
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
