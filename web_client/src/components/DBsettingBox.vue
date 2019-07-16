<template lang="html" >
<!--NoSQL 시스템 상세 설정-->
<v-flex xs12 sm5 md5 xl5>
        <v-container fluid grid-list-xl>
          <v-layout justify-center row wrap>
            <v-flex xs12 sm12 md12 xl12 v-show="settingBoxSeen" :value= "dbconfigData">
              <v-toolbar flat color="grey lighten-2">
                <v-toolbar-title>
                  <h3>DB 상세 설정</h3>
                </v-toolbar-title>
              </v-toolbar>
            <v-card class="pa-3" :value="selectedDBconf">
              <v-form ref="form" >
                <div class="v-card__text"  >
                          <v-flex xs12>
                            <v-text-field  v-model ="selectedDBconf.nc_name" disabled label="DB config 파일명" ></v-text-field>
                          </v-flex>
                          <v-flex xs12>
                            <v-text-field v-model ="selectedDBconf.n_node_count" :min="0" type="number" disabled label="Node수"></v-text-field>
                          </v-flex>

                 </div>
                <v-tabs slider-color="#34495E" next-icon="mdi-arrow-right-bold-box-outline" prev-icon="mdi-arrow-left-bold-box-outline" show-arrows>
                  <v-tab v-for="(sp, idx) in selectedDBconf.specs"  :key="idx" ripple>NODE {{idx+1}}</v-tab>
                  <v-tab-item v-for="(sp, idx) in selectedDBconf.specs"  :key="idx" transition="slide-x-transition">
                  <div class="v-card__text">
                    <v-form>
                      <v-container py-0>
                        <v-layout wrap>
                        <v-spacer></v-spacer>

                        <!-- 노드 상세정보 dialog -->
                          <!-- <v-tooltip top>
                            <v-btn right class="Dialog2" icon slot="activator" @click.stop = "Dialog2 = true">
                              <v-icon>settings</v-icon>
                            </v-btn>
                            <span>NODE 상세정보</span>
                          </v-tooltip>
                          <v-dialog persistent v-model="Dialog2" max-width="400px">
                            <v-card>
                              <v-card-title>
                                <span class="headline">NODE {{n}} 상세정보</span>
                              </v-card-title>
                              <v-card-text>
                                <v-container grid-list-md>
                                  <v-layout wrap>
                                    <v-flex xs12>
                                      <v-text-field disabled label="OS" ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12>
                                      <v-text-field disabled label="CPU"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12>
                                      <v-text-field disabled label="RAM"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12>
                                      <v-text-field disabled label="MAC adress"></v-text-field>
                                    </v-flex>
                                  </v-layout>
                                </v-container>
                              </v-card-text>
                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="red" flat @click="Dialog2 = false">close</v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog> -->
                          <!-- /노드 상세정보 dialog -->

                          <!-- 노드별 정보 -->

                          <v-flex xs12>
                            <v-text-field v-model ="sp.ip" disabled label="IP address" ></v-text-field>
                          </v-flex>
                          <v-flex xs12>
                            <v-text-field v-model ="sp.cpu" disabled label="CPU" ></v-text-field>
                          </v-flex>
                          <v-flex xs12>
                            <v-text-field v-model ="sp.mem" disabled label="Memory" ></v-text-field>
                          </v-flex>
                          <v-flex xs12>
                            <v-text-field v-model ="sp.s_storage" disabled label="Storage" ></v-text-field>
                          </v-flex>
                          <v-flex xs12>
                            <v-text-field v-model ="sp.n_roleStr" disabled label="역할" ></v-text-field>
                          </v-flex>
                          <!-- <v-flex xs12>
                            <v-select disabled v-model="sp.n_role" :items="items" label="역할"></v-select>
                          </v-flex> -->
                          <!-- /노드별 정보 -->
                                </v-layout>
                              </v-container>
                            </v-form>
                          </div>
                </v-tab-item>
                      </v-tabs>

                      <v-flex xs12>
                        <v-card-actions>
                          <v-btn flat class="mx-3 font-weight">Cancel</v-btn>
                          <v-spacer></v-spacer>
                          <v-btn flat color="primary" type="DBsubmit" disabled>Save</v-btn>
                        </v-card-actions>
                      </v-flex>

                    </v-form>
                  </v-card>
                </v-flex>
                </v-layout>
              </v-container>
            </v-flex>
      <!--/NoSQL 시스템 상세 설정-->
      </template>

      <script>
      export default {
        props : ['settingBoxSeen','ncidTemp'],
          data: () => ({
            Dialog2: false,
             select: null,
             items: ['Master','Slave'],
             DBconfAll : [],
             selectedDBconf : [],
             nodecount : []
         }),

         created() {

           this.$store.dispatch('getDBs')
           // this.DBconfAll = this.$store.state.DBfiles
           // this.selectedDbconf = this.DBconfAll.find(y =>y.nc_id === this.ncidTemp)
           // console.log(this.selectedDbconf);
         },

         computed : {
           dbconfigData() {
                console.log(this.ncidTemp)
             this.DBconfAll = this.$store.state.DBfiles

             this.DBconfAll.forEach(nid=>{
               nid.dbconfigs.forEach(x=>{
                 if(x.nc_id == this.ncidTemp){
                   this.selectedDBconf = x


                   console.log(this.selectedDBconf.specs)

                   this.selectedDBconf.specs.forEach(y =>{
                     if(y.n_role ==0){
                       y.n_roleStr = 'Master'
                     }
                     else {
                       y.n_roleStr = 'Slave'
                     }
                   }
                   )
                 }
               })
             })

             // this.selectedDBconf.forEach(spec=>{
             //     this.nodecount = spec
             //     console.log(spec)
             //   })
             //
             // this.selectedDbconf = nid.dbconfigs.find(y =>y.nc_id === this.ncidTemp)

             // console.log('in settingbox')
                 return this.$store.state.DBfiles
           }
         },
         }//export default End
  </script>

    <style lang="css" scoped>
    </style>
