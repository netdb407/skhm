<template lang="html">

  <v-container>
    <v-layout row wrap justify-center>
      <v-flex xs12>
        <v-card-title primary-title>
          <h3 class="headline mb-0">{{this.contents.DBWL.r_name}}&nbsp;<b>의 Error 정보</b></h3>
        </v-card-title>
        <hr />&nbsp;
        <v-card flat>

          <v-layout row wrap justify-center>
            <v-flex xs11 ma-3>
              <v-card flat color="grey lighten-3">
                <v-card-title primary-title>
                  <div>
                    <v-card-title>{{msg}}</v-card-title>
                    <v-data-table :headers="errorInfoHeaders"
                                  :items="error"
                                  class="elevation-1"
                                  hide-actions>
                      <template v-slot:items="props">
                            <tr :active="props.item.isActive" :key="props.item.id">
                              <td class="text-xs-center">{{ props.item.nc_name }}</td>
                              <td class="text-xs-center">{{ props.item.w_name }}</td>
                              <td class="text-xs-left">{{ props.item.error }}</td>
                            </tr>
                            </template>
                    </v-data-table>
                  </div>
                </v-card-title>
              </v-card>

            </v-flex>

          </v-layout>

        </v-card>
      </v-flex>

    </v-layout>
  </v-container>

</template>

<script>

  export default {
    data: () => ({
      error: [],
      msg: null,
      dbTemp: [],
      DBinfo: [],
      WLinfo: [],
      errorInfoHeaders: [
        { text: 'DBconfig 이름', align: 'center', sortable: false, width: '10%' },
        { text: '워크로드 이름', align: 'center', sortable: false, width: '10%' },
        { text: 'Error', align: 'center', sortable: false, width: '80%' }
      ]
    }), //data End
    props: ['contents'],

    created() {
      this.error = this.contents.Error
      if (this.error.length == 0){
        this.msg = "IO Tracer에서 에러가 발생하여 에러정보가 저장되지 않았습니다."
      }
      this.$store.state.DBfiles.forEach(DB => {
        DB.dbconfigs.forEach(x => {
          this.dbTemp.push(x)
        })
      })
      this.contents.DBWL.relation.forEach(x => {
        x.Dbconfigs.forEach(db => {
          this.DBinfo.push(this.dbTemp.find(x => x.nc_id == db.nc_id))
        })
        x.wlconfigs.forEach(wl=> {
          this.WLinfo.push(wl)
        })
      })

      this.error.forEach(er=>{
        let temp = this.DBinfo.find(x=> x.nc_id == er.nc_id)
        er.nc_name = temp.nc_name
        let temp2 = this.WLinfo.find(x=> x.w_id == er.w_id)
        er.w_name = temp2.w_name
      })

    }
  } //export default End

</script>

<style lang="css" scoped>
hr {
  border-width: 0.5px;
  border-color: rgb(210, 210, 210);
}
</style>
