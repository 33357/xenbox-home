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
      <block v-if="state.app.tokenMap[tokenId].end != 0">
        <img
          style="width: 100px; height: 100px"
          :src="`/box${
            state.app.tokenMap[tokenId].end - state.app.tokenMap[tokenId].start
          }.png`"
          fit="fill"
        />
        <div class="bottom card-header" style="padding: 5px">
          <span>ID：{{ tokenId }}</span>
          <span
            >账号数量：{{
              state.app.tokenMap[tokenId].end -
              state.app.tokenMap[tokenId].start
            }}</span
          >
          <span v-if="state.app.tokenMap[tokenId].term != 0"
            >锁定时间：
            {{ state.app.tokenMap[tokenId].term }}
            天</span
          >
          <span v-if="state.mint.fee != 0"
            >预计获得：
            {{
              ((state.app.tokenMap[tokenId].end -
                state.app.tokenMap[tokenId].start) *
                state.app.tokenMap[tokenId].term *
                state.app.amount *
                (10000 - state.mint.fee)) /
              10000
            }}
            XEN</span
          >
          <div v-if="state.app.tokenMap[tokenId].time != 0">
            到期时间：{{
              new Date(state.app.tokenMap[tokenId].time * 1000).toLocaleString()
            }}
          </div>
        </div>
      </block>
    </el-card>
  </el-scrollbar>
</template>

<script lang="ts">
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { Search as SearchIcon } from "@element-plus/icons-vue";

export default {
  data() {
    return {
      SearchIcon: SearchIcon,
      searchInput: "",
    };
  },
  computed: mapState({
    state: (state: any) => state as State,
  }),
  methods: {
    ...mapActions(["getSearchData"]),
    async search() {
      await this.getSearchData(this.searchInput);
    },
  },
};
</script>

<style></style>
