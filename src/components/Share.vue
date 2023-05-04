<template></template>
  
<script lang="ts">
import { mapState, mapActions } from "vuex";
import { State } from "../store";
import { utils } from "../const";

export default {
  data() {
    return {
      utils: utils,
    };
  },
  computed: mapState({
    state: (state: any) => state as State,
  }),
  methods: {
    ...mapActions(["getSearchData"]),
    async search() {

    },
  },
};
</script>
  
<style></style>
  