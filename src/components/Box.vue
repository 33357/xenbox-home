<template>
  <el-form label-width="30%">
    <el-form-item label="排序方式:">
      <el-radio-group v-model="sort">
        <el-radio-button label="id">ID</el-radio-button>
        <el-radio-button label="time">到期时间</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-scrollbar height="600px">
      <el-card
        v-for="{ version, tokenId } in state.box.tokenIdList"
        :key="tokenId"
        :body-style="{ padding: '0px', marginBottom: '1px' }"
      >
        <div v-if="state.app.tokenMap[version][tokenId].end != 0">
          <img
            style="width: 100px; height: 100px"
            :src="
              `/box${state.app.tokenMap[version][tokenId].end -
                state.app.tokenMap[version][tokenId].start}.png`
            "
            fit="fill"
          />
          <div class="card-header" style="padding: 5px">
            <span>ID: {{ tokenId }}</span>
            <span
              >账号数量:
              {{
                state.app.tokenMap[version][tokenId].end -
                  state.app.tokenMap[version][tokenId].start
              }}</span
            >
            <span v-if="state.app.tokenMap[version][tokenId].term != 0"
              >锁定时间:
              {{ state.app.tokenMap[version][tokenId].term }} 天</span
            >
            <span
              v-if="
                !state.app.tokenMap[version][tokenId].mint.eq(0) &&
                  state.app.feeMap[version][
                    state.app.tokenMap[version][tokenId].end -
                      state.app.tokenMap[version][tokenId].start
                  ] != 0
              "
            >
              实计获得:
              {{
                `${utils.format.bigToString(
                  state.app.tokenMap[version][tokenId].mint
                    .mul(
                      10000 -
                        state.app.feeMap[version][
                          state.app.tokenMap[version][tokenId].end -
                            state.app.tokenMap[version][tokenId].start
                        ]
                    )
                    .div(10000),
                  18,
                  0
                )} ${
                  state.app.chainMap[state.app.chainId].xen
                } (${utils.format.bigToString(
                  state.app.tokenMap[version][tokenId].mint
                    .mul(
                      10000 -
                        state.app.feeMap[version][
                          state.app.tokenMap[version][tokenId].end -
                            state.app.tokenMap[version][tokenId].start
                        ]
                    )
                    .div(10000)
                    .mul(utils.num.ether)
                    .div(state.app.perEthAmount),
                  18,
                  6
                )} ${state.app.chainMap[state.app.chainId].eth})`
              }}
            </span>
            <div v-if="state.app.tokenMap[version][tokenId].time != 0">
              到期时间:
              {{
                `${new Date(
                  state.app.tokenMap[version][tokenId].time * 1000
                ).toLocaleString()} (延期惩罚: ${utils.getPenalty(
                  state.app.tokenMap[version][tokenId].time
                )}%)`
              }}
            </div>
            <el-button
              @click="doClaim(version, tokenId)"
              :disabled="
                new Date().getTime() / 1000 <
                  state.app.tokenMap[version][tokenId].time ||
                  state.app.tokenMap[version][tokenId].time == 0
              "
            >
              开启
            </el-button>
          </div>
        </div>
      </el-card>
    </el-scrollbar>

    <el-dialog v-model="dialogVisible" title="开启宝箱" width="30%">
      <el-form label-width="30%">
        <el-form-item label="下一轮锁定时间">
          <el-input-number v-model="term" :min="1" @change="termChange" /> 天
        </el-form-item>
        <el-form-item
          label="预计获得:"
          v-if="
            state.app.feeMap[version][
              state.app.tokenMap[version][tokenId].end -
                state.app.tokenMap[version][tokenId].start
            ] != 0
          "
        >
          {{
            `${utils.format.bigToString(
              calculateMint
                .mul(
                  state.app.tokenMap[version][tokenId].end -
                    state.app.tokenMap[version][tokenId].start
                )
                .mul(
                  10000 -
                    state.app.feeMap[version][
                      state.app.tokenMap[version][tokenId].end -
                        state.app.tokenMap[version][tokenId].start
                    ]
                )
                .div(10000),
              18,
              0
            )} ${
              state.app.chainMap[state.app.chainId].xen
            } (${utils.format.bigToString(
              calculateMint
                .mul(
                  state.app.tokenMap[version][tokenId].end -
                    state.app.tokenMap[version][tokenId].start
                )
                .mul(
                  10000 -
                    state.app.feeMap[version][
                      state.app.tokenMap[version][tokenId].end -
                        state.app.tokenMap[version][tokenId].start
                    ]
                )
                .div(10000)
                .mul(utils.num.ether)
                .div(state.app.perEthAmount),
              18,
              6
            )} ${state.app.chainMap[state.app.chainId].eth})`
          }}
        </el-form-item>
        <el-form-item label="Gas 预测:">
          <a
            :href="
              `https://gas.33357.xyz/?c=${state.app.chainId}&g=${gasLimit}`
            "
            target="_blank"
          >
            {{ `https://gas.33357.xyz/?c=${state.app.chainId}&g=${gasLimit}` }}
          </a>
        </el-form-item>
        <el-form-item label="高级设置:">
          <el-switch v-model="advanced" />
        </el-form-item>
        <el-form-item label="Gas 价格:" v-if="advanced">
          <el-input v-model="gasPrice" placeholder="gasPrice"
            ><template #append> Gwei </template>
          </el-input>
        </el-form-item>
        <el-form-item label="预计 Gas 费用:" v-if="advanced && gasPrice != ''">
          {{
            `${utils.format.bigToString(
              utils.format
                .stringToBig(gasPrice, 9)
                .mul(
                  (gasLimit / 100) *
                    (state.app.tokenMap[version][tokenId].end -
                      state.app.tokenMap[version][tokenId].start)
                ),
              18,
              6
            )} ${state.app.chainMap[state.app.chainId].eth}`
          }}
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="dialogVisible = false"> 取消 </el-button>
          <el-button type="primary" @click="confirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </el-form>
</template>

<script lang="ts">
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { BigNumber, utils, log } from "../const";

export default {
  data() {
    return {
      utils: utils,
      dialogVisible: false,
      term: 0,
      tokenId: 0,
      version: 1,
      calculateMint: BigNumber.from(0),
      advanced: false,
      sort: "id",
      gasPrice: "",
      gasLimit: 7000000
    };
  },
  created() {
    this.term = this.state.app.defaultTerm;
    this.getBoxData();
  },
  computed: mapState({
    state: (state: any) => state as State
  }),
  watch: {
    advanced(value) {
      if (value == false) {
        this.gasPrice = "";
      }
    },
    sort() {
      this.sortList();
    },
    "state.app.tokenMap": {
      handler() {
        this.sortList();
      },
      deep: true
    },
    term() {
      this.getCalculateMint();
    }
  },
  methods: {
    ...mapActions(["getBoxData", "claim"]),
    async sortList() {
      if (this.sort == "id") {
        this.state.box.tokenIdList.sort((a, b) => {
          return a.tokenId - b.tokenId;
        });
      } else if (this.sort == "time") {
        this.state.box.tokenIdList.sort((a, b) => {
          return (
            this.state.app.tokenMap[a.version][a.tokenId].time -
            this.state.app.tokenMap[b.version][b.tokenId].time
          );
        });
      }
    },
    async getCalculateMint() {
      if (this.state.app.ether.xenBoxHelper) {
        this.calculateMint = await this.state.app.ether.xenBoxHelper.calculateMintRewardNew(
          Math.ceil(
            (this.state.app.rankMap[this.state.app.defaultTerm] * this.term) /
              this.state.app.defaultTerm
          ),
          this.term
        );
      }
    },
    async confirm() {
      await this.claim({
        version: this.version,
        tokenId: this.tokenId,
        term: this.term,
        gasPrice:
          this.gasPrice == ""
            ? undefined
            : utils.format.stringToBig(this.gasPrice, 9)
      });
      this.dialogVisible = false;
      this.getBoxData();
    },
    doClaim(version: number, tokenId: number) {
      this.version = version;
      this.tokenId = tokenId;
      this.dialogVisible = true;
      this.getCalculateMint();
    },
    termChange(num: number | undefined) {
      if (num) {
        this.term = num;
      }
    }
  }
};
</script>

<style></style>
