<template lang="html">

  <v-container fluid>
    <!-- 제일 바깥쪽 -->
    <v-layout justify-center>
      <v-flex xs12>
        <v-card-title primary-title>
          <h3 class="headline mb-0"><b>벤치마킹 결과</b>&nbsp; &nbsp;{{this.contents.DBWL.r_name}}</h3>
        </v-card-title>
        <hr /> &nbsp;
        <v-layout justify-center>
          <!-- 제일 바깥쪽 -->
          <v-flex xs11>
            <!-- 제일 바깥쪽 -->
            <v-card flat>
              <!-- 제일 바깥쪽 -->

              <v-card-title class="headline"><b>YCSB Chart</b></v-card-title>
              <v-tabs show-arrows
                      :value="active_tab"
                      height="37"
                      slider-color="none"
                      color="white">
                <v-tab v-for="(rel, idx) in tabinfo" :key="rel.nc_id" @click="makeY_tab_items(rel.nc_id)">
                  {{rel.nc_name}} (Ver.{{rel.n_version}})
                </v-tab>
                <v-tab-item v-for="(rel, idx) in tabinfo"
                            :key="idx"
                            transition="slide-y-transition"
                            name="tab-fade">

                  <v-flex xs12 class="tabItemCard">
                    <v-card flat color="grey lighten-3">
                      <v-layout justify-center>
                        <v-flex xs11 mt-3 mb-5>
                          <v-tabs class="WLtab"
                                  :value="active_tab"
                                  height="37"
                                  slider-color="none"
                                  color="grey lighten-3">
                            <v-tab v-for="(relwl, idx) in wlinfo" :key="relwl.w_id">
                              {{relwl.w_name}}
                            </v-tab>
                            <v-tab-item v-for="(relwl, idx) in wlinfo"
                                        :key="idx"
                                        transition="slide-y-transition"
                                        name="tab-fade">
                              <v-card flat color="white">
                                <v-layout row wrap justify-center>
                                  <!--YCSB Latency Graph-->

                                  <v-flex xs11 :v-bind="DBinfo">
                                    <v-card flat class="chart">
                                      <GChart type="LineChart"
                                              :data="relwl.YChartData"
                                              :options="YChartOptions"
                                              v-resize="onResize" />
                                      <v-layout justify-center row wrap>
                                        <v-tooltip top>
                                          <v-btn icon slot="activator" @click="YCSBshow = !YCSBshow">
                                            <v-icon>{{ YCSBshow ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
                                          </v-btn>
                                          <span>결과 상세보기</span>
                                        </v-tooltip>
                                      </v-layout>
                                      <!-- 더보기 -->
                                      <v-slide-y-transition>
                                        <div class="v-card__text" v-show="YCSBshow">
                                          <v-spacer></v-spacer>
                                          <v-form>
                                            <v-container py-0>
                                              <v-layout row wrap justify-center>
                                                <!--YCSB 성능 평가 결과-->
                                                <v-flex xs12 sm12 md12 xl12 mb-4>
                                                  <h5 class="headline mb-3">YCSB 성능평가 상세 결과</h5>

                                                  <!-- overall -->
                                                  <v-flex xs11 ma-4>
                                                    <v-toolbar flat dense color="rgb(232, 232, 233)">
                                                      <h2 class="title">총 latency</h2>
                                                    </v-toolbar>
                                                    <v-data-table :headers="YOverallTableHeaders"
                                                                  :items="relwl.YOverallTable"
                                                                  class="elevation-1"
                                                                  hide-actions>
                                                      <template v-slot:items="props">
                                                                                                        <tr >
                                                                                                          <td class="text-xs-left">{{ props.item.type }}</td>
                                                                                                          <td class="text-xs-center">{{ props.item.Runtime }}</td>
                                                                                                          <td class="text-xs-center">{{ props.item.Throughput }}</td>
                                                                                                        </tr>
                                                                                                        </template>
                                                    </v-data-table>
                                                  </v-flex>
                                                  <!-- /overall -->

                                                  <!-- 나머지 operation -->
                                                  <v-flex xs11 ma-4>
                                                    <v-toolbar flat dense color="rgb(232, 232, 233)">
                                                      <h2 class="title">연산별 latency</h2>
                                                    </v-toolbar>
                                                    <v-data-table :headers="YTypeTableHeaders"
                                                                  :items="relwl.YTypeTable"
                                                                  class="elevation-1"
                                                                  hide-actions>
                                                      <template v-slot:items="props">
                                                                                                        <tr :active="props.item.isActive" :key="props.item.id">
                                                                                                          <td class="text-xs-left">{{ props.item.type }}</td>
                                                                                                          <td class="text-xs-center">{{ props.item.Operations }}</td>
                                                                                                          <td class="text-xs-center">{{ props.item['AverageLatency(us)'] }}</td>
                                                                                                          <td class="text-xs-center">{{ props.item['MinLatency(us)'] }}</td>
                                                                                                          <td class="text-xs-center">{{ props.item['MaxLatency(us)'] }}</td>
                                                                                                          <td class="text-xs-center">{{ props.item['95thPercentileLatency(us)']}}</td>
                                                                                                          <td class="text-xs-center">{{ props.item['99thPercentileLatency(us)']}}</td>
                                                                                                        </tr>
                                                                                                      </template>
                                                    </v-data-table>
                                                  </v-flex>
                                                  <!-- /나머지 operation -->

                                                </v-flex>
                                                <!--/YCSB 성능 평가 결과-->
                                              </v-layout>
                                            </v-container>
                                          </v-form>
                                        </div>
                                      </v-slide-y-transition>
                                      <!-- /더보기 -->

                                    </v-card>
                                  </v-flex>
                                  <!--/YCSB Latency Graph-->

                                </v-layout>
                              </v-card>
                            </v-tab-item>
                            <!--workload tab item End-->

                          </v-tabs>
                          <!--workload tabs End-->
                        </v-flex>
                      </v-layout>
                    </v-card>
                  </v-flex>

                </v-tab-item>
              </v-tabs>
              <!-- DB tabs End -->

              &nbsp;
              <v-card-title class="headline mt-1 mb-1"><b>IO Chart</b></v-card-title>
              <v-tabs show-arrows
                      :value="active_tab"
                      height="37"
                      slider-color="none"
                      color="white">
                <v-tab v-for="(rel, idx) in makeIOResult" :key="idx">
                  Node {{idx+1}} ({{rel.ip}})
                </v-tab>
                <v-tab-item v-for="(rel, idx) in makeIOResult"
                            :key="idx"
                            transition="slide-x-transition"
                            name="tab-fade">

                  <v-flex xs12 class="tabItemCard">
                    <v-card flat color="grey lighten-3">
                      <v-layout justify-center>
                        <v-flex xs11 sm11 md11 xl11 mt-5 mb-5>
                          <v-card flat color="white">

                            <v-layout row wrap justify-center>
                              <v-flex xs11 ma-5>
                                <v-card flat color="white">
                                  <v-flex mb-5>
                                    <v-card flat color="white" class="chart">
                                      <GChart type="ComboChart"
                                              :data="rel.trace.IChartD"
                                              :resizeDebounce="500"
                                              :options="IChartOptions" />

                                      <GChart type="AreaChart"
                                              :data="rel.trace.ILevelChartD"
                                              :options="ILevelChartOptions" />

                                      <GChart type="LineChart"
                                              :data="rel.dmdu.IdmduChartD"
                                              :options="IdmduChartOptions" />
                                    </v-card>
                                  </v-flex>

                                  <v-layout justify-center>
                                    <v-tooltip top>
                                      <v-btn color="grey" slot="activator" dark round @click="download(rid, rel.ip)">
                                        <v-icon>get_app</v-icon>download
                                      </v-btn>
                                      <span>Raw.json파일 다운</span>
                                    </v-tooltip>
                                  </v-layout>

                                </v-card>
                              </v-flex>
                            </v-layout>

                          </v-card>

                        </v-flex>
                      </v-layout>
                    </v-card>
                  </v-flex>

                </v-tab-item>
              </v-tabs>

            </v-card>
            <!-- 제일 바깥쪽 -->
          </v-flex>
          <!-- 제일 바깥쪽 -->
        </v-layout>
      </v-flex>

    </v-layout>
    <!-- 제일 바깥쪽 -->
  </v-container>
  <!-- 제일 바깥쪽 -->

</template>

<script>

  import { GChart } from 'vue-google-charts'

  export default {
    components: {
      GChart
    },
    data: () => ({
      windowSize: {
        x: 0,
        y: 0
      },
      // url:'https://78.media.tumblr.com/tumblr_m39nv7PcCU1r326q7o1_500.png',
      makeIOResult: [],
      makeYCSBResult: [],
      active_tab: null,
      YCSBshow: false,
      IOshow: false,
      dbTemp: [], //탭
      DBinfo: [], //탭
      WLinfo: [], //탭
      // IOResult : [],

      YChartData: [], //밑에서 type들 넣어줌
      YChartOptions: {
        responsive: true,
        title: 'YCSB Latency',
        chartArea: { left: 100, top: 100, bottom: 100, right: 200, width: '100%', height: '100%' },
        height: 500,
        hAxis: { title: 'timewindow', minValue: 0 }, //x축
        vAxis: { title: 'latency', minValue: 0, maxValue: 1000 } //y축
      },

      YOverallTable: [], //상세보기 - 총 latency 테이블에 바인딩
      YOverallTableHeaders: [
        { text: 'Type', align: 'left', sortable: false, value: 'name', width: '15%' },
        { text: 'RunTime(ms)', align: 'center', sortable: false, value: 'RunTime', width: '15%' },
        { text: 'Throughput(ops/sec)', align: 'center', sortable: false, value: 'Throughput', width: '20%' }
      ],

      YTypeTable: [], //상세보기 - 연산별 latency 테이블에 바인딩
      YTypeTableHeaders: [
        { text: 'Type', align: 'left', sortable: false, value: 'name', width: '15%' },
        { text: 'Operations', align: 'center', sortable: false, value: 'Operations', width: '15%' },
        { text: 'Average Latency(us)', align: 'center', sortable: false, value: 'averageLatency', width: '20%' },
        { text: 'Min Latency(us)', align: 'center', sortable: false, value: 'minLatency', width: '12%' },
        { text: 'Max Latency(us)', align: 'center', sortable: false, value: 'maxLatency', width: '13%' },
        { text: '95%(us)', align: 'center', sortable: false, value: 'latency95', width: '10%' },
        { text: '99%(us)', align: 'center', sortable: false, value: 'latency99', width: '10%' }
      ],
      //--------------------------------------------------------------------------------------------------------------
      IChartD: [],
      IChartOptions: {
        responsive: true,
        title: 'IO Latency',
        chartArea: { left: 80, top: 30, bottom: 50, right: 200, width: '100%', height: '100%' },
        height: 400,
        hAxis: {}, //x축
        vAxis: {}, //y축
        seriesType: 'bars',
        // series: {1: {type: 'line'}}
        series: {
          0: { axis: 'IONumber' },
          1: { axis: 'IOSize', type: 'line' }
        },
        axes: {
          y: {
            IONumber: { label: 'IONumber' },
            IOSize: { label: 'IOSize' }
          }
        }
      },

      ILevelChartD: [],
      ILevelChartOptions: {
        responsive: true,
        title: 'IO Level Latency',
        chartArea: { left: 80, top: 30, bottom: 50, right: 200, width: '100%', height: '100%' },
        height: 400,
        hAxis: { title: 'time Window' }, //x축
        vAxis: { title: 'latency', minValue: 0 }, //y축
        series: {
          3: { axis: 'max', type: 'line' },
          4: { axis: 'min', type: 'line' },
          5: { axis: 'var', type: 'line' },
          6: { axis: 'std', type: 'line' }
        },
        isStacked: true,
        tooltip: { pattern: 'scientific' }
        // tooltip: { pattern: 'scientific', isHtml: true }
      },

      IdmduChartD: [],
      IdmduChartOptions: {
        responsive: true,
        title: 'IO dmdu',
        chartArea: { left: 80, top: 30, bottom: 50, right: 200, width: '100%', height: '100%' },
        height: 400,
        hAxis: { title: 'time Window' }, //x축
        vAxis: { title: 'latency', minValue: 0 }, //y축
        isStacked: true,
        tooltip: { pattern: 'scientific' }
        // tooltip: { pattern: 'scientific', isHtml: true }
      },
      ycsb: [],
      tabinfo: [],
      wlinfo: []
    }), //data
    props: ['contents'],

    created() {
      console.log(this.contents)

      this.makeY_tabs()
      this.tabinfo = this.contents.DBWL.relation
      this.tabinfo.forEach(x => {
        this.wlinfo = x.wlconfigs
      })

      this.DBinfo = this.contents.DBWL.relation[0]
      let default_nc_id = this.contents.DBWL.relation[0].nc_id
      this.makeY_tab_items(default_nc_id)

      this.$store.dispatch('getResultIO', this.contents.DBWL.r_id).then(res => {
        if (res.status == 200) {
          this.makeIOResult = res.data
          this.makeIOGraph()
        }
      })
    }, //created End

    computed: {}, //computed End

    mounted() {
      this.onResize()
    },

    methods: {
      onResize() {
        this.windowSize = { x: window.innerWidth, y: window.innerHeight }
      },

      makeY_tab_items(nc_id) {
        this.YOverallTable = []
        let ycsbTemp = []
        var startTime = new Date().getTime()
        this.DBinfo = this.contents.DBWL.relation.find(nc => nc.nc_id == nc_id)

        // console.log(this.DBinfo);

        // console.log(nc_id)
        // console.log(dbwl.nc_id)
        let dbwl = this.DBinfo
        dbwl.wlconfigs.forEach(wlconf => {
          wlconf.nc_id = nc_id
          this.contents.YCSB.forEach(ycsssb => {
            ycsbTemp.push(ycsssb)
          })

          wlconf.wlYCSB = ycsbTemp.find(what => what.nc_id == wlconf.nc_id && what.w_id == wlconf.w_id)

          this.YOverallTable.push({
            type: wlconf.wlYCSB.ycsb[0].metric,
            Runtime: wlconf.wlYCSB.ycsb[0].value,
            Throughput: wlconf.wlYCSB.ycsb[1].value
          })

          wlconf.YOverallTable = this.YOverallTable

          let YChartTemp = [
            { type: 'READ' },
            { type: 'UPDATE' },
            { type: 'CLEANUP' },
            { type: 'SCAN' },
            { type: 'INSERT' },
            { type: 'INSERT-FAILED' },
            { type: 'UPDATE-FAILED' },
            { type: 'READ-FAILED' }
          ]

          let YTypeTableTemp = [
            { type: 'READ' },
            { type: 'UPDATE' },
            { type: 'CLEANUP' },
            { type: 'SCAN' },
            { type: 'INSERT' },
            { type: 'INSERT-FAILED' },
            { type: 'UPDATE-FAILED' },
            { type: 'READ-FAILED' }
          ]

          //YCSB chart 표현 시 x축 timewindow를 window size 단위로 잘라서 만들어야 함

          let TWtemp = []
          let timewindow = []
          let temp1 = []
          let Types = []
          let TWmax = [] //content.measurement 중 max값
          // let value = []

          wlconf.wlYCSB.ycsb.forEach(content => {
            let idx = -1
            switch (content.metric) {
              case 'READ':
                idx = 0
                break
              case 'UPDATE':
                idx = 1
                break
              case 'CLEANUP':
                idx = 2
                break
              case 'SCAN':
                idx = 3
                break
              case 'INSERT':
                idx = 4
                break
              case 'INSERT-FAILED':
                idx = 5
                break
              case 'UPDATE-FAILED':
                idx = 6
                break
              case 'READ-FAILED':
                idx = 7
                break
            }

            //YChartData 만드는 부분 : isNaN 결과가 false면 content.measurement가 숫자
            //timewindow만들기1
            if (idx != -1) {
              if (isNaN(Number(content.measurement)) == false) {
                TWtemp.push(content.measurement)
                //max값 찾기
                TWmax = Math.max.apply(null, TWtemp)
                YChartTemp[idx][content['measurement']] = content.value
              } else {
                YTypeTableTemp[idx][content['measurement']] = content.value
              }
            }
          }) //ycsb.forEach End

          //YCSB Chart 필터링
          YChartTemp = YChartTemp.filter(x => Object.keys(x).length !== 1 && x.type !== 'CLEANUP')
          //TypeTable 필터링하여 완성
          this.YTypeTable = YTypeTableTemp.filter(x => typeof x.Operations !== 'undefined')
          wlconf.YTypeTable = this.YTypeTable

          let windowsize = this.contents.DBWL.r_window_size * 1000
          // console.log(windowsize);
          //timewindow만들기2
          for (var i = 0; i <= TWmax; i = i + windowsize) {
            //TWtemp는 배열임. 배열에 i저장
            TWtemp = i
            temp1[TWtemp] = 0
            // timewindow.push(TWtemp)
          }
          //type별로 timewindow만큼 키가 생기고 value가 없는 부분에 0으로 대치
          YChartTemp.forEach(type => {
            Types.push(Object.assign([], temp1, type))
          })
          // console.log(Types);

          // Types.forEach(x => {
          //   let result = Object.keys(x).map(function(key) {
          //     return [Number(key), x[key], x[key]]
          //   })
          //   this.YChartData = [['timewindow', x.type, x.type]] //'timewindow'는 화면에 나타나는 이름일 뿐임
          //
          //   wlconf.YChartData = this.YChartData.concat(result)
          // })

          // let idx = 0
          // let keyArray = []

          let result = Object.keys(Types[0]).map(function(key) {
            let a = [[Number(key)]]
            let b = a.shift()
            return b
          })
          let test = []

          this.YChartData = [['timewindow']] //'timewindow'는 화면에 나타나는 이름일 뿐임
          Types.forEach(x => {
            for (let i = 0; i < result.length; i++) {
              let a = x[i * windowsize]
              result[i].push(a)
            }

            this.YChartData[0].push(x.type)
          }) //Types forEach End
          wlconf.YChartData = this.YChartData.concat(result)
          // console.log(wlconf.YChartData);
        }) // wlconf End
        // var endTime = new Date().getTime();
        //
        // console.log(endTime - startTime);
      },

      makeY_tabs() {
        this.contents.DBWL.relation.forEach(dbwl => {
          dbwl.Dbconfigs.forEach(y => {
            dbwl.nc_name = y.nc_name
            dbwl.n_version = y.n_version
          })
        })
      }, //makeY_tabs End

      makeIOGraph() {
        let trace
        let dmdu

        this.makeIOResult.forEach(x => {
          trace = x.trace.records
          dmdu = x.dmdu.records

          // console.log(this.contents.DBWL.r_c_timestamp);

          let temp_trace = [...trace]
          let result = temp_trace.map(content => {
            // console.log(content)
            // const timetemp = new Date()
            // let wtmin = timetemp.getSeconds(content['Window Time'])
            // console.log(wtmin)

            // let WTtemp = content['Window Time']
            // let wtmin =

            return [content['Window Time'], content['Number of IO'], content['Size of IO']]
          })
          this.IChartD = [['time', 'Number of IO', 'Size of IO']]
          x.trace.IChartD = this.IChartD.concat(result)

          temp_trace = [...trace]
          let result2 = temp_trace.map(content => {
            return [
              content['Window Time'],
              content['Kernel Time'],
              content['Driver Time'],
              content['Device Time'],
              content['max'],
              content['min'],
              content['var'],
              content['std']
            ]
          })
          this.ILevelChartD = [['time', '  Kernel', 'Driver', 'Device', 'max', 'min', 'var', 'std']]
          x.trace.ILevelChartD = this.ILevelChartD.concat(result2)

          let result3 = dmdu.map(content => {
            return [
              Date(content['time']),
              content['delta_disk_usage'],
              content['waf'],
              content['gc'],
              content['nand_write']
            ]
          })
          this.IdmduChartD = [['time', 'delta_disk_usage', 'waf', 'gc', 'nand_write']]
          x.dmdu.IdmduChartD = this.IdmduChartD.concat(result3)

          // console.log(x)
        })
      },

      //   forceFileDownload(response){
      //     const url = window.URL.createObjectURL(new Blob([response.data]))
      //     const link = document.createElement('a')
      //     link.href = url
      //     link.setAttribute('download', 'file.png') //or any other extension //txt파일로 줄것
      //     document.body.appendChild(link)
      //     link.click()
      //   },
      //
      //   download() {
      //     axios({
      //     method: 'get',
      //     url: this.url,
      //     responseType: 'arraybuffer'
      //   })
      //   .then(response => {
      //     this.forceFileDownload(response)
      //   })
      //   .catch(() => console.log('error occured'))
      // },

      download: function(rid, ip) {
        let payload = {
          r_id: rid,
          ip: ip
        }
        this.$store.dispatch('getResultIOraw', payload)
      }
    } //methods End
  }

</script>



<style lang="css" scoped>

  .tabItemCard {
    border-width: 1px;
    border-style: solid;
    border-color: rgb(210, 210, 210);
    /* border-bottom-right-radius: 15px;
                                          border-bottom-left-radius: 15px; */
    /* border-top-right-radius: 15px; */
    /* z-index: 100; */
    background-color: rgb(237, 236, 236);
  }

  .tab-fade-enter-active {
    transition: 0.001s ease;
  }
  .tab-fade-leave-active {
    transition: 0.001s ease;
  }

  .tab-fade-enter,
  .tab-fade-leave-to {
    opacity: 0;
  }
  .chart {
    width: 100%;
    min-height: 450px;
  }
 hr {
   border-width: 0.5px;
   border-color: rgb(210, 210, 210);
 }

</style>
