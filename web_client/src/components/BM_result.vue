<template lang="html">

  <v-flex xs12 class="tabItemCard">
    <v-card flat>
      <v-layout justify-center row wrap>
        <!--기간조회-->
        <v-flex xs12 sm11 md11 xl11 mt-4>
          <v-card flat class="daterange--default">
            <v-toolbar flat color="white">
              <v-toolbar-title>
                <b>기간 조회&nbsp;</b> &nbsp;From
                <v-chip close @input="removeChip(0)">{{ chipRange[0] }}</v-chip>
                To
                <v-chip close @input="removeChip(1)">{{ chipRange[1] }}</v-chip>
              </v-toolbar-title>
              <!-- <v-spacer></v-spacer> -->

                <v-tooltip top>
                  <v-btn icon  slot="activator">
                    <v-icon  @click="clickSearchBtn()">{{ showDatePicker ? 'done' : 'search'}}</v-icon>
                  </v-btn>
                  <span>click !</span>
                </v-tooltip>

              <v-btn @click="clickSearchAll()" dark color="blue lighten-2">전체 기간</v-btn>
            </v-toolbar>
            <!--DatePicker-->
            <v-slide-y-transition >
              <v-flex xs12 v-show="showDatePicker">
                <v-card-text>
                  <v-daterange :options="dateRangeOptions" @input="onDateRangeChange" />
                </v-card-text>
              </v-flex>

            </v-slide-y-transition>
            <!--/DatePicker-->
          </v-card>
        </v-flex>
        <!--/기간조회-->

        <!--결과 테이블 -->
        <v-flex xs12 sm11 md11 xl11 mb-5>
          <v-toolbar flat color="grey lighten-2">
            <v-toolbar-title>
              <v-flex xs5>
                <h4 class="headline">벤치마킹 결과 &nbsp;&nbsp;</h4>
              </v-flex>
            </v-toolbar-title>
            <!-- 벤치마킹 수행상태 -->
            <v-btn-toggle v-model="toggle" mandatory>
              <v-btn @click="btnToggle(5)" flat color="blue darken-4">전체</v-btn>
              <v-btn @click="btnToggle(0)" flat color="blue darken-4">수행준비</v-btn>
              <v-btn @click="btnToggle(1)" flat color="blue darken-4">수행중</v-btn>
              <v-btn @click="btnToggle(2)" flat color="blue darken-4">수행취소</v-btn>
              <v-btn @click="btnToggle(3)" flat color="blue darken-4">수행완료</v-btn>
            </v-btn-toggle>
            <v-spacer></v-spacer>
            <v-tooltip top>
              <v-btn icon  slot="activator">
                <v-icon  @click="reload()">cached</v-icon>
              </v-btn>
              <span>새로 고침</span>
            </v-tooltip>
            <!-- /벤치마킹 수행상태 -->
          </v-toolbar>

          <!--벤치마킹 결과 테이블-->
          <v-data-table :headers="BMheaders"
                        :items="getBMresults"
                        :custom-sort="customSort"
                        item-key="r_id"
                        class="elevation-1"
                        :must-sort="true"
                        :pagination.sync="pagination"
                        expand>
            <template v-slot:items="props">
                <tr>
                  <td class="text-xs-center">{{ props.item.flagStr }}</td>
                  <td class="text-xs-center">{{ props.item.r_id }}</td>
                  <td class="text-xs-center">{{ props.item.r_name }}</td>
                  <td class="text-xs-center">{{ props.item.r_c_timestamp }}</td>
                  <td class="text-xs-center">{{ props.item.r_s_timestamp }}</td>
                  <td class="text-xs-center">{{ props.item.r_e_timestamp }}</td>
                  <td class="text-xs-center">{{ props.item.totalTimestamp }}</td>
                  <td class="text-xs-center">
                    <v-btn
                      v-if='props.item.graph !==undefined'
                      @click="openNewTab(props.item.graph, props.item.r_name, props.item.r_id)"
                      icon>
                      <!-- props.item.graph는 store actions getBMresults에 정의된 value.graph를 의미 : error또는 equalizer -->
                      <v-icon color="blue">{{ props.item.graph }}</v-icon>
                    </v-btn>
                  </td>
                  <td class="text-xs-center">
                    <v-menu right top>
                      <v-btn icon slot="activator"><v-icon>more_vert</v-icon></v-btn>
                      <v-list dense >
                        <v-list-tile
                          @click="openNewTab(0, props.item.r_name, props.item.r_id)">
                          <v-list-tile-title>벤치마킹 정보 보기</v-list-tile-title>
                        </v-list-tile>
                        <v-divider></v-divider>
                        <v-list-tile >
                          <v-list-tile-title>수행 취소</v-list-tile-title>
                        </v-list-tile>
                        <v-divider></v-divider>
                        <v-list-tile >
                          <v-list-tile-title>재설정</v-list-tile-title>
                        </v-list-tile>
                        <v-divider></v-divider>
                        <v-list-tile >
                          <v-list-tile-title>재실행</v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                  </td>

                  <td class="text-xs-center">
                  <v-btn  icon   @click="props.expanded = !props.expanded">
                    <v-icon>{{ props.expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>

            <!--DB별 벤치마킹 정보 테이블-->
            <template v-slot:expand="props">
              <v-flex xs12 v-for="db in props.item.relation">
               <v-card flat color="grey lighten-3">
                  <v-layout justify-center row wrap>
                    <v-flex xs8 ma-3>
                      <v-toolbar flat dense color="rgb(216, 220, 236)" v-for="dbc in db.Dbconfigs">
                        <h2 class="title">
                          {{ dbc.nc_name }} &nbsp;(ver.{{ dbc.n_version }})
                        </h2>
                      </v-toolbar>
                      <v-data-table
                      :headers="BM_DBheaders"
                      :items="db.wlconfigs"
                      hide-actions
                      item-key="db.nc_id"
                      class="elevation-1"
                      >
                      <template v-slot:items="props">
                        <td class="text-xs-center">{{ props.item.w_name}}</td>
                        <td class="text-xs-center">{{ props.item.prop.operationcount}}</td>
                      <!-- items와 computed에서 정의한 함수를 바인딩하여 WLfiles[]를 표현 -->
                        <td class="text-xs-center">{{ props.item.w_read }}</td>
                        <td class="text-xs-center">{{ props.item.w_update}}</td>
                        <td class="text-xs-center">{{ props.item.w_insert }}</td>
                        <td class="text-xs-center">{{ props.item.w_scan }}</td>
                        <td class="text-xs-center">{{ props.item.w_readmodifywrite }}</td>
                      </template>

          </v-data-table>
        </v-flex>
      </v-layout>
    </v-card>
  </v-flex>
  </template>
  <!--/DB별 벤치마킹 정보 테이블-->
  </v-data-table>
  </v-flex>
  <!--/결과 테이블 -->
  </v-layout>
  </v-card>
  </v-flex>

</template>

<script>

  import 'vuetify-daterange-picker/dist/vuetify-daterange-picker.css'
  import { format, subDays } from 'date-fns'
  export default {
    data() {
      return {
        pagination: {
          sortBy: 'create'
        },
        toggle: 0,
        chip: [],
        dates: ['2018-09-15', '2018-09-20'],
        menu1: false,
        chipRange: [],
        range: [],
        dateRangeOptions: {
          startDate: format(subDays(new Date(), 30), 'YYYY-MM-DD'),
          endDate: format(new Date(), 'YYYY-MM-DD'),
          format: 'YYYY/MM/DD',
          presets: [
            {
              label: 'Today',
              range: [format(new Date(), 'YYYY-MM-DD'), format(new Date(), 'YYYY-MM-DD')]
            },
            {
              label: 'Yesterday',
              range: [format(subDays(new Date(), 1), 'YYYY-MM-DD'), format(new Date(), 'YYYY-MM-DD')]
            },
            {
              label: 'Last 30 Days',
              range: [format(subDays(new Date(), 30), 'YYYY-MM-DD'), format(new Date(), 'YYYY-MM-DD')]
            },
          ]
        },

        menu: false,
        modal: false,
        menu2: false,
        selected: [],
        show: false,
        showBM_DB: false,
        showDatePicker: false,
        dialog: false,
        expand: true,
        BMheaders: [
          { text: '상태', sortable: false, align: 'center', width: '7%' },
          { text: 'r_id', sortable: false, align: 'center', width: '1%' },
          { text: '벤치마킹 이름', sortable: false, align: 'center', width: '15%' },
          { text: '생성시간', value: 'create', align: 'center', width: '10%' },
          { text: '시작시간', value: 'start', align: 'center', width: '10%' },
          { text: '종료시간', value: 'end', align: 'center', width: '10%' },
          { text: '총 소요시간', value: 'total', align: 'center', width: '15%' },
          { text: '결과', sortable: false, align: 'center', width: '5%' },
          { text: '추가 기능', sortable: false, align: 'center', width: '5%' },
          { text: '더보기', sortable: false, align: 'center', width: '5%' }
        ],
        BM: [],
        BM_DBheaders: [
          { text: '워크로드 명', sortable: false, value: 'WLname', align: 'center', width: '20%' },
          { text: 'Operation Count', value: 'Read', sortable: false, align: 'center', width: '15%' },
          { text: 'Read(%)', value: 'Read', sortable: false, align: 'center', width: '10%' },
          { text: 'Update(%)', value: 'Update', sortable: false, align: 'center', width: '10%' },
          { text: 'Insert(%)', value: 'Insert', sortable: false, align: 'center', width: '10%' },
          { text: 'Scan(%)', value: 'Scan', sortable: false, align: 'center', width: '10%' },
          { text: 'ReadModifyWrite(%)', value: 'Rmw', sortable: false, align: 'center', width: '10%' }
        ],
        BM_DB: []
      } //return End
    },

    created() {
      //최초로 결과 데이터 가져옴
      this.$store.dispatch('getBMresults')

      this.$store.commit('setActiveTab', 0)
      this.range = [this.dateRangeOptions.startDate, this.dateRangeOptions.endDate]
      this.chipRange = [null, null]
      this.pagination.descending = true
    },

    computed: {
      //벤치마킹 결과 가져오기
      getBMresults() {
        // console.log(this.$store.state.BMresults);
        return this.$store.state.BMresults

      },

      //벤치마킹 DB-WL 정보 가져오기
      getBM_DB_WLresults() {
        return this.$store.state.BM_DB_WL
      }
    },

    methods: {
      findAllTime(items) {
        let oldest = new Date()
        let latest = subDays(new Date(), 9999)
        items.forEach(item => {
          let tempC = new Date(item.r_c_timestamp)
          if (oldest > tempC) oldest = tempC
          if (latest < tempC) latest = tempC
        })
        // console.log(latest)
        this.chipRange = [format(oldest, 'YYYY-MM-DD'), format(latest, 'YYYY-MM-DD')]
        // return format(oldest , 'YYYY-MM-DD')
      },

      clickSearchAll() {
        // this.$store.commit('filterBMFlag', 5)//select all
        // console.log(this.$refs.btnAll)

        this.toggle = 0
        // this.btnToggle(5)
        this.$store.commit('filterBMDate', [null, null])
        let items = this.$store.state.BMresults
        // console.log(items)
        this.findAllTime(items)
        // this.chipRange= [this.findOldestTime(items)]
      },

      clickSearchBtn() {
        //search
        if (this.showDatePicker) {
          // console.log(this.range)
          this.toggle = 0
          this.chipRange = Object.assign([], this.range)
          this.$store.commit('filterBMDate', this.range)
        }
        this.showDatePicker = !this.showDatePicker
      },

      btnToggle(idx) {
        // let temp = this.toggle
        // if(temp == 0)
        //   temp = 5
        // else
        //   temp -= 1
        this.$store.commit('filterBMFlag', idx)
        // console.log(evt)
      },

      onDateRangeChange(range) {
        this.range = range
      },

      customSort(items, index, isDescending) {
        items.sort((a, b) => {
          if (index === 'create') {
            if (isDescending) {
              return new Date(b.r_c_timestamp) - new Date(a.r_c_timestamp)
            } else {
              return new Date(a.r_c_timestamp) - new Date(b.r_c_timestamp)
            }
          } else if (index === 'start') {
            if (isDescending) {
              return new Date(b.r_s_timestamp) - new Date(a.r_s_timestamp)
            } else {
              return new Date(a.r_s_timestamp) - new Date(b.r_s_timestamp)
            }
          } else if (index === 'end') {
            if (isDescending) {
              return new Date(b.r_e_timestamp) - new Date(a.r_e_timestamp)
            } else {
              return new Date(a.r_e_timestamp) - new Date(b.r_e_timestamp)
            }
          } else {
            if (isDescending) {
              if (b.totalTimestamp > a.totalTimestamp) return -1
              else return 1
            } else {
              if (a.totalTimestamp > b.totalTimestamp) return -1
              else return 1
            }
          }
        })
        return items
      },

      removeChip(idx) {
        this.toggle = 0
        this.chipRange[idx] = null
        this.$store.commit('filterBMDate', this.chipRange)
      },

      openNewTab: function(flag, _rname, _id) {
        // console.log(_id);
        let _comp = null
        let _name = null
        let _type = null
        if (flag != 0) {
          if (flag === 'equalizer') flag = 1
          else flag = 2
        }
        // console.log("click" + flag)
        switch (flag) {
          case 0: //
            _comp = 'BM_detail'
            _name = _rname + '의 정보'
            _type = 'detail'
            break
          case 1:
            _comp = 'BM_graph'
            _name =  _rname + '의 결과'
            _type = 'graph'
            break
          case 2:
            _comp = 'BM_error'
            _name = _rname + '의 에러 정보'
            _type = 'error'
            break
        }
        let newTab = {
          title: _name,
          id: this.$store.state.tabs.length,
          type: _type,
          r_id: _id,
          isActive: true,
          canClose: true,
          comp: _comp
        }
        // this.$store.dispatch('getResultIO', newTab.r_id)
        this.$store.dispatch('getTabContents', newTab)
        // this.$store.dispatch('getResultIO', this.newTab.r_id)
        // console.log(newTab.r_id);


      },

      reload() {
        this.$store.dispatch('getBMresults')
        console.log('새로 고침됨');
        // console.log(this.$store.state.BMresults);
      }

    }
  }

</script>

<style lang="css" scoped>

  table.v-table tbody tr td {
    font-size: 14px;
  }
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



  .statusflag {
    color: rgb(230, 230, 230);
  }


</style>
