<template lang="html">

  <v-container fluid grid-list-md>
    <v-layout justify-center fill-height>
      <!-- 탭 -->
      <v-flex xs12>
        <v-card flat >
            <v-tabs
              show-arrows
              height="37"
              :value="getActiveTab"
              slider-color="none"
              color="#fbfbfb"><!--store.state.activeTab : 0, 다른 숫자-->
                <v-tab
                  v-for="tab in getTabs"
                  :key="tab.id"
                  class="tabbar_tab">
                  {{tab.title}}
                  <v-btn v-if='tab.canClose === true' small flat left icon @click.stop="closeTab(tab.id)">
                    <v-icon small @click="closeTab(tab.id)">close</v-icon>
                  </v-btn>
                </v-tab>
              <!-- 탭 내용 -->
                <v-tab-item
                  v-for="tab in getTabs"
                  :key="tab.id"
                  :value="tab.id"
                  transition="slide-x-transition"
                  class="tabItemCard" name="tab-fade">
                  <component :is="tab.comp" :contents="tab.contents"></component>
                </v-tab-item>
              <!-- /탭 내용 -->
            </v-tabs>
        </v-card>
      </v-flex>
      <!-- /탭 -->
    </v-layout>
  </v-container>

</template>

<script>

import BM_result from './BM_result.vue'
import BM_detail from './BM_detail.vue'
import BM_error from './Error.vue'
import BM_graph from './Graph.vue'

export default {
  components: {
    BM_result,
    BM_detail,
    BM_graph,
    BM_error,
  },
  data() {
    return {

    }
  }, //data() End

  created() {

  },

  computed: {
    getActiveTab(){
      return this.$store.state.activeTab
    },

    getTabs(){
      return this.$store.state.tabs
    },

  },


  methods: {
    closeTab(tab) {
      // console.log('Closing Tab ' + tab)
      this.$store.commit('closeTab', tab)
    },
  }
}

</script>

<style lang="css" scoped>

/* table.v-table tbody tr td {
  font-size: 14px;
} */
.theme--light.v-btn-toggle {
  background-color: #e0e0e0;
}
.v-btn {
  border-radius: 14px;
}
.v-btn:before {
  border-radius: 14px;
}
.v-input input {
  max-height: 50px;
  width: 500px;
}
.dateRange {
  width: 700px;
}
.v-input {
  max-height: 32px;
  min-width: 500px;
}
.tabbar_tab {
  font-weight: 400;
  text-transform: none;
}
/* rgb(237, 141, 28)  orange */
/* rgb(136, 163, 215)  blue */
>>> .v-tabs__item--active {
  color: rgb(224, 98, 6);
  font-weight: 500;
  background-color: rgba(204, 203, 203, 0.72);
  border-width: thin;
  border-color: rgba(218, 218, 218, 0.73);
  border-top-style: solid;
  border-left-style: solid;
  border-right-style: solid;
  border-bottom-style: none;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
  z-index: 200;
}

.resultPageAll {
  border-bottom-right-radius: 15px;
  border-bottom-left-radius: 15px;
}

.tabItemCard {
  border-width: thin;
  border-style: solid;
  border-color: rgba(218, 218, 218, 0.73);
  z-index: 100;
}


  .tab-fade-enter-active, {
     transition: .0001s ease;
   }
   .tab-fade-leave-active{
     transition: .0001s ease;
   }

  .tab-fade-enter, .tab-fade-leave-to{
   opacity: 0;
   }

</style>
