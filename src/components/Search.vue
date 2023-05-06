<template>
  <el-input v-model="searchInput" placeholder="输入地址或 ID">
    <template #append>
      <el-button :icon="SearchIcon" @click="search" />
    </template>
  </el-input>
  <el-scrollbar height="600px">
    <el-card
      v-for="tokenId in state.search.tokenIdList"
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
                state.mint.feeMap[version][
                  state.app.tokenMap[1][tokenId].end -
                    state.app.tokenMap[1][tokenId].start
                ] != 0
            "
          >
            实计获得：{{
              `${utils.format.bigToString(
                state.app.tokenMap[1][tokenId].mint
                  .mul(
                    10000 -
                      state.mint.feeMap[version][
                        state.app.tokenMap[1][tokenId].end -
                          state.app.tokenMap[1][tokenId].start
                      ]
                  )
                  .div(10000),
                18,
                0
              )} ${
                state.app.symbolMap[state.app.chainId].xen
              } (${utils.format.bigToString(
                state.app.tokenMap[1][tokenId].mint
                  .mul(
                    10000 -
                      state.mint.feeMap[version][
                        state.app.tokenMap[1][tokenId].end -
                          state.app.tokenMap[1][tokenId].start
                      ]
                  )
                  .div(10000)
                  .mul(
                    10000 -
                      state.mint.feeMap[version][
                        state.app.tokenMap[version][tokenId].end -
                          state.app.tokenMap[version][tokenId].start
                      ]
                  )
                  .div(10000)
                  .mul(utils.num.ether)
                  .div(state.mint.perEthAmount),
                18,
                4
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
</template>

<script lang="ts">
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { Search as SearchIcon } from "@element-plus/icons-vue";
import { utils } from "../const";

export default {
  data() {
    return {
      utils: utils,
      SearchIcon: SearchIcon,
      searchInput: "",
      version: 1
    };
  },
  computed: mapState({
    state: (state: any) => state as State
  }),
  methods: {
    ...mapActions(["getSearchData"]),
    async search() {
      await this.getSearchData(this.searchInput);
    }
  }
};
</script>

<style></style>
