<template>
  <el-card class="box-card">
    <el-scrollbar height="600px">
      <el-card
        v-for="tokenId in state.box.tokenIdList"
        :key="tokenId.toString()"
        :body-style="{ padding: '0px', marginBottom: '1px' }"
      >
        <img
          style="width: 100px; height: 100px"
          :src="`/box${state.box.tokenMap[tokenId.toString()].end
              .sub(state.box.tokenMap[tokenId.toString()].start).toNumber()}.png`"
          fit="fill"
        />
        <div style="padding: 5px">
          <div
            class="bottom card-header"
            v-if="state.box.tokenMap[tokenId.toString()].time"
          >
            <span
              >账号数量：{{
                state.box.tokenMap[tokenId.toString()].end
                  .sub(state.box.tokenMap[tokenId.toString()].start)
                  .toString()
              }}</span
            >
            <span
              >锁定时间：
              {{ state.box.tokenMap[tokenId.toString()].term }}
              天</span
            >
            <span
              >预计获得：
              {{
                (state.box.tokenMap[tokenId.toString()].end
                  .sub(state.box.tokenMap[tokenId.toString()].start)
                  .toNumber() *
                  state.box.tokenMap[tokenId.toString()].term *
                  state.app.amount *
                  (10000 - state.mint.fee)) /
                10000
              }}
              XEN</span
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
              开启
            </el-button>
          </div>
        </div>
      </el-card>
    </el-scrollbar>
  </el-card>
  <el-dialog v-model="dialogVisible" title="开启宝箱" width="30%">
    <el-form label-width="30%">
      <el-form-item label="重新锁定时间">
        <el-input-number v-model="term" :min="1" @change="termChange" /> 天
      </el-form-item>
      <el-form-item label="预计获得" v-if="state.mint.fee != 0">
        {{
          (state.box.tokenMap[tokenId.toString()].end
            .sub(state.box.tokenMap[tokenId.toString()].start)
            .toNumber() *
            term *
            state.app.amount *
            (10000 - state.mint.fee)) /
          10000
        }}
        XEN
      </el-form-item>
    </el-form>
    <template #footer>
      <span>
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
    async confirm() {
      await this.claim({ tokenId: this.tokenId, term: this.term });
      this.dialogVisible = false;
      this.getBoxData();
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
