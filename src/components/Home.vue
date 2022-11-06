<template>
  <div>
    <img alt="Vue logo" src="../assets/logo.png" />
    <h1> Fair Minting + Halving + LP Staking </h1>
    <p>
      Second Generation XEN Mode
    </p>
  </div>
</template>

<script lang="ts">
import { log } from "../const";
import { mapState } from 'vuex'
import { State } from '../store'

export default {
  data() {
    return {
      activeIndex: "1",
    };
  },
  created() {
  },
  computed: mapState({
        state: state => (state as State),
    }),
  methods: {
  },
};

</script>

<style>
</style>
