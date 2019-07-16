<template lang="html">

  <v-container>
    <v-layout justify-space-around row wrap>
      <!--DB목록&워크로드 목록-->
      <v-flex xs12 sm5 md5 xl5>
        <!--DB목록-->

        <v-flex xs12>
          <dgList :conf="db_configs"></dgList>
        </v-flex>
        <!--/DB목록-->
        <v-flex xs12>
          &nbsp;
        </v-flex>
        <!--워크로드 목록-->

        <v-flex xs12>
          <dgList :conf="wl_configs"></dgList>
        </v-flex>
        <!--/워크로드 목록-->
      </v-flex>
      <!--/DB목록&워크로드 목록-->

      <!--오른쪽 Benchmarks 매칭 부분-->
      <v-flex xs12 sm5 md5 xl5>
        <ValidationObserver ref="obs">
          <v-card :value="benchmarkData">
            <v-form ref="form" v-model="valid">
              <v-toolbar flat color="rgb(242, 120, 19)">
                <v-toolbar-title>
                  <h3>Benchmarks</h3>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <!-- 추후에 개발완료해서 다시 살릴 것 -->
                <!--TreeView-->
                <!-- <v-tooltip top>
                              <v-icon slot="activator" @click="treeDialog=true" color="#34495E">check_box</v-icon>
                              <span>CheckBox</span>
                            </v-tooltip>
                            <v-dialog v-model="treeDialog" max-width="700px">
                              <v-card>
                                <v-card-title>
                                  <v-toolbar card color="white">
                                    <h1>Benchmarks Checkbox</h1>
                                  </v-toolbar>
                                  <v-card-text>
                                    <v-treeview v-model="tree"
                                                :items="items"
                                                activatable
                                                active-class="grey lighten-4 indigo--text"
                                                selected-color="indigo"
                                                open-on-click
                                                selectable
                                                expand-icon="mdi-chevron-down"
                                                on-icon="mdi-bookmark"
                                                off-icon="mdi-bookmark-outline"
                                                indeterminate-icon="mdi-bookmark-minus">
                                      <div>
                                        Selected items: {{ selectedItems }}
                                      </div>
                                    </v-treeview>
                                  </v-card-text>
                                </v-card-title>
                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn color="red" flat @click="close">close</v-btn>
                                  <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
                                </v-card-actions>
                              </v-card>
                            </v-dialog> -->
                <!--/TreeView-->

                <!--벤치마킹 고급 설정 dialog-->

                <v-tooltip top>
                  <v-btn class="mb-2" icon slot="activator" @click="onDialog">
                    <v-icon>settings</v-icon>
                  </v-btn>
                  <span>IO Graph setting</span>
                </v-tooltip>
                <v-dialog v-model="dialog" max-width="400px">
                  <v-card>
                    <v-card-title>
                      <span class="headline">IO Latency Graph 고급 설정</span>
                    </v-card-title>
                    <v-card-text>
                      <v-container grid-list-md>
                        <v-layout wrap>
                          <v-flex xs12>
                            <v-text-field v-model="r_window_size" label="Analysis Window Size(sec)" mask="#################"></v-text-field>
                          </v-flex>
                          <v-flex xs12>
                            <v-text-field v-model="r_threshold" label="Threshold"></v-text-field>
                          </v-flex>

                        </v-layout>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="red" flat @click="close">close</v-btn>
                      <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <!--/벤치마킹 고급 설정 dialog-->
              </v-toolbar>

              <!-- 벤치마킹 이름 입력 부분 -->
              <v-layout justify-center>
                <v-flex xs11 sm11 md11 xl11>
                  <v-card flat color="white">
                    <v-flex xs8 sm8 md8 xl8 ma-4>
                      <v-text-field :counter="20" v-model="r_name" label="*벤치마킹 이름(필수)" :rules="nameRules" required></v-text-field>
                    </v-flex>

                  </v-card>
                </v-flex>

                <v-tooltip top>
                  <v-btn icon slot="activator">
                    <v-icon @click="reset()">cached</v-icon>
                  </v-btn>
                  <span>초기화</span>
                </v-tooltip>

              </v-layout>
              <!-- /벤치마킹 이름 입력 부분 -->

              <v-flex ma-1 pa-3>
                <v-card flat color="rgb(255, 214, 180)">
                  <v-container id="scroll-target"
                               style="max-height: 750px"
                               class="scroll-y">
                    <v-layout v-scroll:#scroll-target="onScroll" column style="height: 100%">
                        <v-subheader>※ 왼쪽의 NoSQL, Workloads 파일을 이곳에 드래그하여 NoSQL별 Workloads를 매칭</v-subheader>
                      <draggable :list="benchmarks" :group="{name : gr}" style="min-height: 10px">
                      </draggable>
                      <!-- draggable로 벤치마크 파일 만드는 부분 -->

                      <v-flex class=" pa-3 ma-1">
                        <template v-for="item in benchmarks">
                          <!-- <v-list :key="item.n_id" two-line> -->
                                    <v-list two-line>
                                        <v-subheader>
                                          {{ item.drg_name }}
                                        </v-subheader>
                                        <draggable :list="item.w_ids" :group="{name : gr}" style="min-height: 10px">
                                          <!-- <draggable :list="item.benchmarks.benchmarks.w_id" :group="{name : gr}" style="min-height: 10px"> -->


                                          <!-- <template v-for="(wl, j) in item.workloads">
                                            <v-list-tile :key="j" avatar class='handle'> -->


                                          <template v-for="(wl, j) in item.w_ids">
                                            <v-list-tile :key="j" avatar class='handle'>
                                              <v-list-tile-avatar>
                                                <v-icon>folder</v-icon>
                                              </v-list-tile-avatar>
                                              <v-list-tile-content>
                                                <v-list-tile-title v-html="wl.drg_name"></v-list-tile-title>
                                                <v-list-tile-sub-title v-html="wl.totlOperation"></v-list-tile-sub-title>
                                              </v-list-tile-content>
                                            </v-list-tile>
                                          </template>

                        </draggable>
                        </v-list>
                        <v-divider :key="item.key"></v-divider>
                        </template>
                      </v-flex>
                    </v-layout>
                  </v-container>
                  <!-- draggable로 벤치마크 파일 만드는 부분 -->
                </v-card>
              </v-flex>

            </v-form>
          </v-card>
        </ValidationObserver>
        <!--실행버튼-->
        <v-layout justify-end>
          <v-btn color="red" round @click="sendBenchmarkData()" :disabled="!valid">
            <h3>실행</h3>
          </v-btn>
        </v-layout>
        <!--/실행버튼-->
      </v-flex>
      <!--/오른쪽 Benchmarks 매칭 부분-->

    </v-layout>
  </v-container>

</template>

<script>

  import draggable from 'vuedraggable'
  import testJson from '../assets/test.json'
  import dgList from './draggable_list.vue'
  import { ValidationObserver } from 'vee-validate'
  // import VTextFieldWithValidation from './inputs/VTextFieldWithValidation'

  export default {
    data: () => ({
      gr: 'drag_group',
      db_configs: [], //store.state.db_configsTest
      wl_configs: [], //store.state.WLfiles
      DBfilesConfigs: [],
      dialog: false,
      treeDialog: false,
      valid: true,
      r_name: '',
      r_window_size: 10,
      r_threshold: 3000,
      nameRules: [v => !!v || 'Name is required']
    }),

    components: {
      dgList,
      draggable,
      ValidationObserver
    },

    created() {
      this.$store.dispatch('getDBs')

      // let dblists = this.$store.state.db_configsTest //store에 넣어놓은 가데이터 변수에 저장
      // this.db_configs = { title: 'NoSQL', gr: this.gr, lists: dblists } //화면에 리스트로 표현
      //
      // //test.json파일의 benchmarks[]값을 store.state.benchmarks[]에 set함
      // this.$store.commit('setItems', testJson.benchmarks)

      this.$store.dispatch('getWLfiles')

      //
      // let wllists = this.$store.state.WLfilesFilter
      // this.wl_configs = { title: 'Workloads', gr: this.gr, lists: wllists }
      // // console.log(this.$store.state.benchmarks);
    },

    computed: {
      benchmarks: {
        get() {
          let dblists = this.$store.state.DBfilesConfigs //setDBfiles에서 dbconfigs의 파일만이 저장된 DBfilesConfigs를 사용
          this.db_configs = { title: 'NoSQL', gr: this.gr, lists: dblists } //화면에 리스트로 표현

          let wllists = this.$store.state.WLfilesFilter
          this.wl_configs = { title: 'Workloads', gr: this.gr, lists: wllists }

          return this.$store.state.benchmarks
        },

        set(value) {
          this.$store.commit('setItems', value)
        }
      },

      benchmarkData() {
        return this.$store.state.benchmarks
      },

      getDBfiles() {
        return this.$store.state.DBfiles
      },

      getWLfiles() {
        return this.$store.state.WLfilesFilter
      }

      // setwl() {
      //   this.wllists = this.$store.state.WLfilesFilter
      //   this.wl_configs = { title: 'Workloads', gr: this.gr, lists: wllists }
      // }
    },

    methods: {
      close() {
        this.dialog = false
      },

      save() {
        //this.$store.dispatch('makeBenchmarks', {"r_window_size" : this.r_window_size} )
        this.dialog = false
      },

      onDialog() {
        this.dialog = true
        this.$refs.tab_dlg.onSelect()
      },

      sendBenchmarkData() {
        // console.log(this.r_name)
        this.$store.dispatch('makeBenchmarks', {
          r_name: this.r_name,
          r_window_size: this.r_window_size,
          r_threshold: this.r_threshold
        })
      },

      reset() {
        let self = this
        setTimeout(function() {
          self.$store.dispatch('')
          location.reload('')
        }, 20000) //20sec
      }
    }
  }

</script>

<style lang="css" scoped>

  .hover {
    cursor: pointer;
  }
  h3 {
    color: rgb(255, 255, 255);
  }

</style>
