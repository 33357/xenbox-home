<template>
  <el-form label-width="30%">
    <el-form-item
      :label="
        `邀请链接${
          state.share.referFeePercent > 0
            ? `(${state.share.referFeePercent}%奖励)`
            : ''
        }：`
      "
    >
      {{
        `https://xenbox.store/?c=${state.app.chainId}&r=${state.app.userAddress}`
      }}
    </el-form-item>
    <el-form-item label="未领奖励：">
      {{
        `${utils.format.bigToString(state.share.reward, 18, 0)} ${
          state.app.symbolMap[state.app.chainId].xen
        } (${utils.format.bigToString(
          state.share.reward.mul(utils.num.ether).div(state.app.perEthAmount),
          18,
          6
        )} ${state.app.symbolMap[state.app.chainId].eth})`
      }}
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        round
        @click="getReward"
        :disabled="state.share.reward.eq(0)"
      >
        领取
      </el-button>
    </el-form-item>
    <el-form-item label="已邀请 xen 宝箱：">
      <el-scrollbar height="600px">
        <el-card
          v-for="tokenId in state.share.tokenIdList"
          :key="tokenId"
          :body-style="{ padding: '0px', marginBottom: '1px' }"
        >
          <div v-if="state.app.tokenMap[1][tokenId].end != 0">
            <img
              style="width: 100px; height: 100px"
              :src="
                `/box${state.app.tokenMap[1][tokenId].end -
                  state.app.tokenMap[1][tokenId].start}.png`
              "
              fit="fill"
            />
            <div class="bottom card-header" style="padding: 5px">
              <span>ID：{{ tokenId }}</span>
              <span
                >账号数量：{{
                  state.app.tokenMap[1][tokenId].end -
                    state.app.tokenMap[1][tokenId].start
                }}</span
              >
              <span v-if="state.app.tokenMap[1][tokenId].term != 0"
                >锁定时间：
                {{ state.app.tokenMap[1][tokenId].term }}
                天</span
              >
              <span
                v-if="
                  !state.app.tokenMap[1][tokenId].mint.eq(0) &&
                    state.app.feeMap[version][
                      state.app.tokenMap[1][tokenId].end -
                        state.app.tokenMap[1][tokenId].start
                    ] != 0
                "
              >
                到期奖励：{{
                  `${utils.format.bigToString(
                    state.app.tokenMap[1][tokenId].mint
                      .mul(
                        state.app.feeMap[version][
                          state.app.tokenMap[1][tokenId].end -
                            state.app.tokenMap[1][tokenId].start
                        ]
                      )
                      .div(10000)
                      .mul(state.share.referFeePercent)
                      .div(100),
                    18,
                    0
                  )} ${
                    state.app.symbolMap[state.app.chainId].xen
                  } (${utils.format.bigToString(
                    state.app.tokenMap[1][tokenId].mint
                      .mul(
                        10000 -
                          state.app.feeMap[version][
                            state.app.tokenMap[1][tokenId].end -
                              state.app.tokenMap[1][tokenId].start
                          ]
                      )
                      .div(10000)
                      .mul(state.share.referFeePercent)
                      .div(100)
                      .mul(utils.num.ether)
                      .div(state.app.perEthAmount),
                    18,
                    6
                  )} ${state.app.symbolMap[state.app.chainId].eth})`
                }}
              </span>
              <div v-if="state.app.tokenMap[1][tokenId].time != 0">
                到期时间：{{
                  new Date(
                    state.app.tokenMap[1][tokenId].time * 1000
                  ).toLocaleString()
                }}
              </div>
            </div>
          </div>
        </el-card>
      </el-scrollbar>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { utils } from "../const";

export default {
  data() {
    return {
      utils: utils,
      version: 1
    };
  },
  created() {
    this.getShareData();
  },
  computed: mapState({
    state: (state: any) => state as State
  }),
  methods: {
    ...mapActions(["getShareData", "getReward"])
  }
};
</script>

<style></style>
