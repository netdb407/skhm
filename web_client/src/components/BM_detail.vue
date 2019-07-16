<template lang="html">

  <v-container>
    <v-layout row wrap justify-center>
      <!-- 전체 페이지 -->
      <v-flex xs12>
        <v-card-title primary-title>
          <h3 class="headline mb-0"><b>벤치마킹 정보</b>&nbsp; &nbsp;{{this.contents.r_name}}</h3>
        </v-card-title>
        <hr /> &nbsp;
        <v-card flat>

          <v-layout row wrap justify-center>
            <v-flex xs11 ma-3>
              <v-card flat>

                <v-layout row wrap justify-center>
                  <v-flex xs12 mt-4 mb-4>
                    <v-toolbar flat dense color="rgb(232, 232, 233)">
                      <h2 class="title">벤치마킹 정보</h2>
                    </v-toolbar>

                    <v-data-table :headers="BMheaders"
                                  :items="BMinfo"
                                  item-key="r_id"
                                  hide-actions
                                  class="elevation-1">
                      <template v-slot:items="props">
                                    <tr>
                                      <td class="text-xs-center">{{ props.item.r_status_flag }}</td>
                                      <td class="text-xs-center">{{ props.item.r_name }}</td>
                                      <td class="text-xs-center">{{ props.item.r_c_timestamp }}</td>
                                      <td class="text-xs-center">{{ props.item.r_s_timestamp }}</td>
                                      <td class="text-xs-center">{{ props.item.r_e_timestamp }}</td>
                                      <td class="text-xs-center">{{ props.item.totalTimestamp }}</td>
                                  </tr>
                                </template>
                    </v-data-table>

                  </v-flex>

                  <v-flex xs12 mb-4>
                    <v-toolbar flat dense color="rgb(232, 232, 233)">
                      <h2 class="title">DB config 파일</h2>
                    </v-toolbar>

                    <v-data-table :headers="DBconfigheaders"
                                  :items="DBinfo"
                                  item-key="nc_name"
                                  hide-actions
                                  class="elevation-1">
                      <template v-slot:items="props">
                                  <tr>
                                    <td class="text-xs-center">{{ props.item.nc_name }}</td>
                                    <td class="text-xs-center">{{ props.item.n_version }}</td>
                                    <td class="text-xs-center">{{ props.item.n_node_count }}</td>
                                    <td class="text-xs-center">{{ props.item.n_d_flagStr }}</td>
                                </tr>
                              </template>
                    </v-data-table>

                  </v-flex>

                </v-layout>

              </v-card>

            </v-flex>

            <!-- DB탭 -->
            <v-flex xs11 ma-3>
              <h4 class="headline mb-3">DB config 파일 별 정보</h4>
              <v-card flat color="rgba(231, 231, 231, 0.34)">
                <v-tabs show-arrows
                        :value="active_tab"
                        height="37"
                        slider-color="none"
                        color="white">
                  <v-tab v-for="(rel, idx) in DBinfo" :key="idx">
                    {{rel.nc_name}} (Ver. {{rel.n_version}} )
                  </v-tab>
                  <v-tab-item v-for="(rel, idx) in this.contents.relation"
                              :key="idx"
                              transition="slide-x-transition"
                              class="tabItemCard">
                    <v-flex xs12>
                      <v-card flat color="rgba(231, 231, 231, 0)">
                        <v-layout justify-center>
                          <!-- DB탭 -->
                          <v-flex xs11 ma-4>
                            <!-- spec 정보-->
                            <v-flex xs12 mb-4 v-for="Db in rel.Dbconfigs" :key="Db.nr_id">
                              <v-toolbar flat dense color="rgb(232, 232, 233)">
                                <h2 class="title">Node spec</h2>
                              </v-toolbar>
                              <v-card flat>

                                <v-data-table :headers="NodeSpecheaders"
                                              :items="Db.specs"
                                              item-key="nr_id"
                                              hide-actions
                                              class="elevation-1">
                                  <template v-slot:items="props">
                                          <tr>
                                            <!-- <td class="text-xs-center">{{ props.item.nr_id }}</td> -->
                                            <td class="text-xs-center">{{ props.item.ip }}</td>
                                            <td class="text-xs-center">{{  props.item.cpu }}</td>
                                            <td class="text-xs-center">{{  props.item.mem }}</td>
                                            <td class="text-xs-center">{{  props.item.s_storage }}</td>
                                            <td class="text-xs-center">{{  props.item.n_roleStr }}</td>
                                        </tr>
                                     </template>
                                </v-data-table>
                              </v-card>
                            </v-flex>
                            <!-- /spec 정보-->

                            <v-flex xs12>
                              <v-toolbar flat dense color="rgb(232, 232, 233)">
                                <h2 class="title">Workload</h2>
                              </v-toolbar>
                              <v-divider></v-divider>
                              <v-card flat color="rgba(232, 232, 233, 0.61)">
                                <v-container fluid grid-list-md>
                                  <v-data-iterator :items="rel.wlconfigs"
                                                   item-key="w_id"
                                                   :rows-per-page-items="rowsPerPageItems"
                                                   :pagination.sync="pagination"
                                                   content-tag="v-layout"
                                                   :expand="expand"
                                                   row
                                                   wrap>
                                    <template v-slot:item="props">
                                                   <v-flex xs12 sm6 md4 lg3>
                                                     <v-card>
                                                       <v-card-title>
                                                         파일명 :&nbsp;<h3>{{ props.item.w_name }}</h3>
                                                       </v-card-title>
                                                       <v-divider></v-divider>
                                                       <v-list dense>
                                                         <v-list-tile>
                                                           <v-list-tile-content>연산비율:</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content class="align-end">{{ props.item.totalOperation }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>생성시간:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.w_c_timestamp }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>삭제시간:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.w_d_timestamp }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>사용빈도:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.w_freq_count }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>에러빈도:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.w_error_count }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>삭제여부:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.w_d_flagStr }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>레코드수:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.recordcount }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>연산수:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.operationcount }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>requestdistribution:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.requestdistribution }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>스레드수:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.threadcount }}</v-list-tile-content>
                                                         </v-list-tile>
                                                       </v-list>
                                                       <v-divider></v-divider>
                                                       <v-switch
                                                         v-model="props.expanded"
                                                         :label="(props.expanded) ? '세부속성' : '상세정보 더보기'"
                                                         class="pl-3 mt-0"
                                                       ></v-switch>
                                                       <v-list v-if="props.expanded" dense >
                                                         <v-list-tile>
                                                           <v-list-tile-content>readallfields:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.readallfields }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>필드수:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.fieldcount }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>minfieldlength:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.minfieldlength }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>writeallfields:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.writeallfields }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>minscanlength:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.minscanlength }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>maxscanlength:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.maxscanlength }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>scanlengthdistribution:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.scanlengthdistribution }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>insertstart:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.insertstart }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>insertcount:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.insertcount }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>zeropadding:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.zeropadding }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>insertorder:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.insertorder }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>fieldnameprefix:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.fieldnameprefix }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>hdrhistogram_percentiles:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.hdrhistogram_percentiles }}</v-list-tile-content>
                                                         </v-list-tile>
                                                         <v-list-tile>
                                                           <v-list-tile-content>datasize:</v-list-tile-content>
                                                           <v-list-tile-content class="align-end">{{ props.item.prop.datasize }}</v-list-tile-content>
                                                         </v-list-tile>
                                                       </v-list>
                                                     </v-card>
                                                   </v-flex>
                                                 </template>
                                  </v-data-iterator>
                                </v-container>

                              </v-card>
                            </v-flex>
                            <!-- /워크로드 정보 -->
                          </v-flex>
                          <!-- /DB탭 -->
                        </v-layout>
                      </v-card>
                    </v-flex>
                  </v-tab-item>

                </v-tabs>
              </v-card>
            </v-flex>
            <!--/ DB탭 -->

          </v-layout>

        </v-card>
      </v-flex>
      <!-- /전체 페이지 -->
    </v-layout>
  </v-container>

</template>

<script>

  export default {
    data() {
      return {
        active_tab: null,
        BMheaders: [
          { text: '상태', sortable: false, align: 'center', width: '8%' },
          { text: '벤치마킹 이름', sortable: false, align: 'center', width: '8%' },
          { text: '생성시간', sortable: false, align: 'center', width: '12%' },
          { text: '시작시간', sortable: false, align: 'center', width: '12%' },
          { text: '종료시간', sortable: false, align: 'center', width: '12%' },
          { text: '총 소요시간', value: 'total', sortable: false, align: 'center', width: '12%' }
        ],
        DBconfigheaders: [
          { text: 'DB config 파일명', sortable: false, align: 'center', width: '8%' },
          { text: 'Version', sortable: false, align: 'center', width: '12%' },
          { text: '노드 수', sortable: false, align: 'center', width: '8%' },
          { text: '삭제여부', sortable: false, align: 'center', width: '12%' }
        ],
        NodeClusterheaders: [
          { text: '노드', sortable: false, align: 'center', width: '8%' },
          { text: '버전', sortable: false, align: 'center', width: '8%' },
          { text: '노드 수', sortable: false, align: 'center', width: '8%' },
          { text: '저장소 경로', sortable: false, align: 'center', width: '12%' }
        ],
        NodeSpecheaders: [
          // { text: 'nr_id', sortable: false, align: 'center', width: '10%' },
          { text: 'IP address', sortable: false, align: 'center', width: '15%' },
          { text: 'CPU', sortable: false, align: 'center', width: '20%' },
          { text: 'RAM(GB)', sortable: false, align: 'center', width: '10%' },
          { text: 'Storage', sortable: false, align: 'center', width: '15%' },
          { text: '역할', sortable: false, align: 'center', width: '15%' }
        ],
        expand: true,
        rowsPerPageItems: [4, 8, 12],
        pagination: {
          rowsPerPage: 4
        },
        BMinfo: [],
        dbTemp: [], //nc_id별 데이터들
        DBinfo: []
      }
    }, //data End
    props: ['contents'],
    created() {
      console.log(this.contents)
      //v-datatable은 items에 object 형태가 올 수 없기 때문에 배열로 다시 만들어 바인딩
      this.BMinfo.push({
        r_name: this.contents.r_name,
        r_status_flag: this.contents.flagStr,
        r_c_timestamp: this.contents.r_c_timestamp,
        r_s_timestamp: this.contents.r_s_timestamp,
        r_e_timestamp: this.contents.r_e_timestamp,
        totalTimestamp: this.contents.totalTimestamp
      }),
        //v-datatable은 items에 array속 array 도 읽지 못하기 때문에 dbTemp, specTemp라는 배열을 만들고 바인딩
        //tab에서 v-for돌때 DBinfo사용함....두번 array들어간것 못찾아서?
        this.$store.state.DBfiles.forEach(DB => {
          DB.dbconfigs.forEach(x => {
            this.dbTemp.push(x)
          })
        })
      //나중에 list??로 보여져셔 this.conetents로 데이터 읽기! 데이터 테이블 말고..r_id정보 등

      // let wIds = []
      this.contents.relation.forEach(x => {
        x.Dbconfigs.forEach(db => {
          this.DBinfo.push(this.dbTemp.find(x => x.nc_id == db.nc_id))
          console.log(this.DBinfo)
        })
        // x.w_ids.forEach(w => {
        //   wIds.push(w)
        // })
      })
      // console.log(wIds);
      // this.$store.dispatch('getWLpropMany', wIds)
    }, //created() End
    computed: {},
    methods: {
      // getWLpropMany(wIds){
      //   this.$store.dispatch('getWLpropMany', wIds)
      // }
    } //methods End
  } //export default End

</script>

<style lang="css" scoped>

  .tabItemCard {
    border-width: 1px;
    border-style: solid;
    border-color: rgba(210, 210, 210, 0.65);
    /* border-bottom-right-radius: 15px;
                                      border-bottom-left-radius: 15px; */
    /* border-top-right-radius: 15px; */
    /* z-index: 100; */
  }
  hr {
    border-width: 0.5px;
    border-color: rgb(210, 210, 210);
  }

</style>
