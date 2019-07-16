<template lang="html">
    <v-container fluid align-start ma-2 pa-5>
      <v-layout row wrap justify-space-around fill-height>
        <!--NoSQL 목록-->
        <v-flex xs12 sm5 md5 xl5>
          <!--v-card 배치-->
          <v-container fluid grid-list-xl>
          <v-layout justify-center row wrap>
            <!--NoSQL DB v-card(NoSQL종류별로 반복)-->
            <v-flex xs10>
              <v-card v-for="name in getDBfiles" :key="name.n_id" color="white">
                <v-card-title>
                  <div>
                    <div class="headline">{{ name.n_name.toUpperCase() }}</div>
                    <span>Version {{ name.n_version }}</span>
                  </div>
                  <v-spacer></v-spacer>
                  <!-- 새로운 DB config파일 추가 버튼-->
                  <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn left small color="#34495E" fab round dark class="mb-2" slot="activator" v-on="on"><v-icon>add</v-icon>
                  </v-btn>
                  </template>
                  <span>현재 지원하지 않는 기능입니다.</span>
                  </v-tooltip>
                  <!-- /새로운 DB config파일 추가 버튼-->
                  <v-flex xs1></v-flex>
                </v-card-title>

                <v-layout justify-center row wrap>
                  <v-btn icon @click="show2 = !show2">
                    <v-icon>{{ show2 ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
                  </v-btn>
                </v-layout>
                <!-- DBconfig파일 보여지는 부분 -->
                <v-slide-y-transition>
                  <div class="v-card__text" v-show="show2">
                    <v-spacer></v-spacer>
                    <v-form>
                      <v-container
                                    id="scroll-target"
                                    style="max-height: 300px"
                                    class="scroll-y"
                                    >
                        <v-layout v-scroll:#scroll-target="onScroll"
                                  column
                                  style="height: 100%"
                                  >
                          <v-flex xs12 sm12 md12 xl12  v-for=" dbconfigs in name.dbconfigs" :key="name.nc_id">
                            <!-- <template v-slot:items="props"> -->
                            <v-list v-show = "name.n_id = dbconfigs.n_id">
                              <v-list-tile v-if="dbconfigs.nc_id" @click="onSelect()">
                                <!-- <template v-slot:items="props">
                                    <tr :active="props.item.isActive">
                                      <td @click="onSelect(props.item)" :key="props.item.n_id" class="text-xs-center"></td>
                                      </td>
                                    </tr>
                                  </template> -->
                                <v-list-tile-avatar  @click="onSelect(dbconfigs.nc_id)" class="hover">
                                  <v-avatar size="35" color="orange lighten-2">
                                    <span class="white--text headline" >C</span>
                                  </v-avatar>
                                </v-list-tile-avatar>
                                <v-list-tile-content  @click="onSelect(dbconfigs.nc_id)" class="hover" >
                                  <v-list-tile-title>{{dbconfigs.nc_name}}</v-list-tile-title>
                                </v-list-tile-content>
                                <v-list-tile-action>
                                  <v-layout col wrap>
                                  <v-tooltip bottom>

                                    <v-btn icon ripple slot="activator" >
                                      <v-icon color="grey lighten-1">file_copy</v-icon>
                                    </v-btn>

                                    <span>현재 지원하지 않는 기능입니다.</span>
                                    </v-tooltip>
                                    <v-spacer></v-spacer>

                                    <v-tooltip bottom>

                                    <v-btn icon ripple slot="activator">
                                      <v-icon color="grey lighten-1">delete</v-icon>
                                    </v-btn>

                                  <span>현재 지원하지 않는 기능입니다.</span>
                                  </v-tooltip>
                                  </v-layout>
                                </v-list-tile-action>
                              </v-list-tile>
                              <!-- <v-divider v-if="configs.divider"></v-divider> -->
                            </v-list>
                          <!-- </template> -->
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </div>
                </v-slide-y-transition>
                <!-- /DBconfig파일 보여지는 부분 -->
                <v-divider class='mb-5' ></v-divider>
              </v-card>
            </v-flex>
            <!--/NoSQL DB v-card-->
          </v-layout>
        </v-container>
        <!--/v-card 배치-->
      </v-flex>
      <!--/NoSQL 목록-->

      <!--DB 설정-->
        <DBsettingBox ref="tab_right" :ncidTemp="ncidTemp" :settingBoxSeen="settingBoxSeen" :isDialog="false"></DBsettingBox>
        <!--DBsettingBox.vue -->
      <!--/DB 설정-->


          </v-layout>
        </v-container>
    </template>

    <script>
    import DBsettingBox from './DBsettingBox.vue'
     export default {
       components: {
         DBsettingBox
       },
      data: () => ({
        settingBoxSeen: false,
        selected: [],
        DBnames : [],
        test: true,
        show2 : true,
        ncidTemp: null
      }),
      props: ['contents'],
      created() {



        this.$store.dispatch('getDBs')
        this.names = this.$store.state.DBfiles
        // this.$store.state.DBfiles.forEach(DB => {
        //   DB.dbconfigs.forEach(x => {
        //     this.dbTemp.push(x)
        //   })
        // })
        //
        //
        //   this.$store.state.Dbconfigs.forEach(db => {
        //     this.dbInfo.push(this.dbTemp.find(x => x.nc_id == db.nc_id))
        //
        //   })
        // this.$store.state.DBfiles.forEach(DB =>{
        //   DB.dbconfigs.forEach(x =>{
        //     this.dbTemp.push(x)
        //   })
        // })
        //
        // this.names.forEach(x => {
        //   x.name.forEach(db =>{
        //     db.name.push(this.dbTemp.find(x=>x.n_id == db.n_id))
        //   })
        // })
      },
      computed : {
        getDBfiles() {
          return this.$store.state.DBfiles
        },
        // dbconfigData() {
        //   return this.$store.state.db_configsTest
        // }
      },
      methods:{
        // clearSelect(){
        //   let self = this
        //   this.settingBoxSeen = false
        //   this.$store.commit('setIsActiveDB', -1)
        // },
        showLoading(){
            this.$store.commit('setIsLoading', true)
        },
        onSelect(ncId) {
          if(this.$store.state.selectedDB.nc_id == ncId){
            // this.$refs.tab_right.onSelect()
            return
          }
          this.showLoading()
          if (this.settingBoxSeen)
            this.settingBoxSeen = false
          //색깔 바꾸는거
          this.$store.commit('setIsActiveDB', ncId)
          // this.$store.dispatch('setDBfiles', nId)
          this.$store.dispatch('getSelectedDB', ncId).then((res)=>{
            if(res.status == 200){
              this.settingBoxSeen = true
              // this.$refs.tab_right.onSelect()
            }
          })

          this.ncidTemp = ncId
        },

        // selectfind(x){
        //   this.names.find(x => {
        //     if ( x.nc_id === this.ncId ) {
        //     this.selected = x
        //   }
        //     console.log(this.selected)
        // })
         // this.names.dbconfigs.push(this.dbTemp.find(x => x.nc_id == db.nc_id))
     // },

      }
    }
    </script>

    <style lang="css" scoped>
    .hover {
      cursor  : pointer;
    }
    </style>
