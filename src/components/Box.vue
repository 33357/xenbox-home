<template>
    <div>
      
    </div>
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
    created() {},
    computed: mapState({
      state: (state: any) => state as State,
    }),
    methods: {},
  };
  </script>
  
  <style></style>