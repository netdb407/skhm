<template lang="html">
    <v-container fluid align-start ma-2 pa-5>
      <v-layout row wrap justify-space-around fill-height>
        <!--워크로드 목록-->
        <v-flex xs12 sm7 md7 xl7>
          <v-toolbar flat color="grey lighten-2">
            <v-toolbar-title>
              <h3>Workloads List</h3>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <!--워크로드 생성 dialog-->
            <v-tooltip top>
              <v-btn color="#34495E" dark round class="mb-2" fab small @click="onDialog" slot="activator">
                <v-icon>add</v-icon>
                </v-btn>
              <span>워크로드 생성</span>
            </v-tooltip>

            <v-dialog v-model="dialog" max-width="500px" persistent>
              <WLsettingBox ref="tab_dlg" :settingBoxSeen="true" :isDialog="true" v-on:emitCancel="onCancel" v-on:emitSave="onSave"></WLsettingBox>
            </v-dialog>
            <!--/워크로드 생성 dialog-->
          </v-toolbar>

          <!--워크로드 목록 데이터 테이블-->
          <v-data-table v-model="selected"
                        :headers="headers"
                        :items="getWLfilesFilter"
                        :custom-sort="customSort"
                        :must-sort="true"
                        class="elevation-1"
                        :pagination.sync="pagination"
                      >  <!--items와 computed에서 정의한 함수를 바인딩하여 WLfiles[]를 표현-->
            <template v-slot:items="props">
                <tr :active="props.item.isActive" :key="props.item.w_id">
                  <td @click="onSelect(props.item.w_id)" class="text-xs-center hover">{{ props.item.w_name }}</td>
                  <td @click="onSelect(props.item.w_id)" class="text-xs-center hover">{{ props.item.w_read+"/"+props.item.w_update+"/"+props.item.w_insert+"/"+props.item.w_scan +"/"+props.item.w_readmodifywrite }}</td>
                  <td @click="onSelect(props.item.w_id)" class="text-xs-center hover">{{ props.item.w_c_timestamp}}</td>
                  <td @click="onSelect(props.item.w_id)" class="text-xs-center hover">{{ props.item.w_freq_count}}</td>
                  <td class="text-xs-center">
                    <v-layout align-center justify-center row wrap>
                      <v-flex xs4>
                        <v-tooltip top>
                          <v-icon slot="activator" @click="copy(props.item.w_id)" color="#848484">file_copy</v-icon>
                          <span>Copy</span>
                        </v-tooltip>
                      </v-flex>
                      <v-flex xs4>
                        <v-tooltip top>
                          <v-icon slot="activator" @click="deleteWorkload(props.item.w_id)" color="#848484">delete</v-icon>
                          <span>Delete</span>
                        </v-tooltip>
                      </v-flex>
                      <v-spacer></v-spacer>
                    </v-layout>
                  </td>
                </tr>
              </template>
          </v-data-table>
          <!--/데이터 테이블-->
        </v-flex>

        <!--워크로드 설정-->
        <v-flex xs12 sm4 md4 xl4>
          <WLsettingBox ref="tab_right" :settingBoxSeen="settingBoxSeen" :isDialog="false" v-on:emitCancel="onCancel" v-on:emitSave="onSave"></WLsettingBox>
          <!--WLsettingBox.vue -->
        </v-flex>
        <!--/워크로드 설정-->

      </v-layout>
    </v-container>
</template>


<script>

  import WLsettingBox from './WLsettingBox.vue'

  export default {
    components: {
      WLsettingBox
    },
    data: () => ({
      settingBoxSeen: false,
      selected: [],
      show: false,
      dialog: false,
      headers: [
        { text: '파일명', align: 'center', sortable: false, value: 'name', width: '20%' },
        { text: '연산비율(R/U/I/S/RMW)', align: 'center', sortable: false, value: 'operationRatio', width: '10%' },
        { text: '생성일', align: 'center', value: 'date', width: '20%' },
        { text: '사용빈도', align: 'center', value: 'frequency', width: '5%' },
        { text: '', align: 'center', sortable: false, value: 'name', width: '20%' }
      ],
      editedIndex: -1,
      pagination : {
        sortBy : 'date',
      },
    }),


      created() {
      this.$store.dispatch('getWLfiles') //(1). store에 정의된 함수가 실행되면서 서버에서 워크로드 데이터 가져옴.
      this.pagination.descending = true
    },


    computed: {
      getWLfilesFilter() {
        //(2). WLfiles[]의 state을 가져와서 워크로드 테이블과 연결하는 함수
        // console.log(this.$store.state.WLfiles);
        return this.$store.state.WLfilesFilter

      }
    },
    methods: {
      showLoading(){
          this.$store.commit('setIsLoading', true)
      },
      clearSelect(){
        let self = this
        this.settingBoxSeen = false
        this.$store.commit('setIsActive', -1)

        setTimeout(function() {
          self.$store.commit('setSelectedWorkload', {})
        },200)

      },
      customSort(items, index, isDescending) {
        items.sort((a, b) => {
          if (index === 'w_freq_count') {
            if (isDescending) {
              return b.w_freq_count - a.w_freq_count
            } else {
              return a.w_freq_count - b.w_freq_count
            }
          } else {
            if (isDescending) {
              return new Date(b.w_c_timestamp) - new Date(a.w_c_timestamp)
            } else {
              return new Date(a.w_c_timestamp) - new Date(b.w_c_timestamp)
            }
          }
        })
        return items
      },
      deleteWorkload(wId) {

        if(confirm('정말로 삭제하시겠습니까?(삭제된 파일은 복원할 수 없습니다.)')){
            // console.log(wId)
            if(this.$store.state.selectedWorkload.w_id == wId){
              this.settingBoxSeen = false
            }
            this.showLoading()
            this.$store.dispatch('deleteWorkload', wId)

        }
      },

      copy(wId) {
        //flag 2 = copy
        this.showLoading()
        this.$store.dispatch('modifyWorkload', { w_id: wId, modifyFlag : 2})
      },

      onSelect(wId) {
        //테이블 row 클릭 시 배경색깔 변하는 함수
        //보이게 하는거

        if(this.$store.state.selectedWorkload.w_id == wId){
          this.$refs.tab_right.onSelect()
          return
        }
        this.showLoading()
        if (this.settingBoxSeen)
          this.settingBoxSeen = false

        //색깔 바꾸는거
        this.$store.commit('setIsActive', wId)
        //[1]. selected_WLfil을 서버에서 가져오는 함수 정의
        this.$store.dispatch('getSelectedWorkload', wId).then((res)=>{
          if(res.status == 200){
            this.settingBoxSeen = true
            this.$refs.tab_right.onSelect()
          }
          // console.log(this.$store.state.selectedWorkload);
        })
      },

      //워크로드 생성 dialog 켜짐
      onDialog() {
        // console.log("copy");
        this.$store.commit('setInsertWorkload')
        if(this.settingBoxSeen)
          this.clearSelect()
        this.dialog = true
        this.$refs.tab_dlg.onSelect()

      },

      //워크로드 생성 dialog cancel버튼
      onCancel(isDialog) {
        if (isDialog) this.dialog = false
        else          this.clearSelect()
      },

      onSave(isDialog){
          //insert
          if(isDialog){
            this.showLoading()
            //0 : insert
            this.$store.dispatch('modifyWorkload', {modifyFlag : 0}).then((res)=>{
              if(res.status == 200){
                this.dialog = false
              }
            })
          }else{  //1: update
            this.$store.dispatch('modifyWorkload', {modifyFlag : 1})
            // this.$store.commit('setWLdatasize', datasize)
          }

      }
    } //method 닫히는 곳
  } //export default 닫히는 곳

</script>

<style lang="css" scoped>

  table.v-table tbody tr td {
    font-size: 16px;
  }
  table.v-table th {

    font-size: 16px;
  }
  .hover {
    cursor  : pointer;
  }

</style>
