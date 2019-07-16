<template lang="html">

  <v-container>
    <v-layout row wrap justify-center>
      <v-flex xs12>
        <v-card-title primary-title>
          <h3 class="headline mb-0"><b>Error 정보</b>&nbsp; &nbsp;{{this.contents.r_name}}</h3>
        </v-card-title>
        <hr />&nbsp;
        <v-card flat>

          <v-layout row wrap justify-center>
            <v-flex xs11 ma-3>
              <v-card flat color="grey lighten-3">
                <v-card-title primary-title>
                  <div>

                    <v-data-table :headers="errorInfoHeaders"
                                  :items="error"
                                  class="elevation-1"
                                  hide-actions>
                      <template v-slot:items="props">
                            <tr :active="props.item.isActive" :key="props.item.id">
                              <td class="text-xs-center">{{ props.item.nc_id }}</td>
                              <td class="text-xs-center">{{ props.item.w_id }}</td>
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
      errorInfoHeaders: [
        { text: 'DBconfig(nc_id)', align: 'center', sortable: false, width: '10%' },
        { text: '워크로드(w_id)', align: 'center', sortable: false, width: '10%' },
        { text: 'Error', align: 'center', sortable: false, width: '80%' }
      ]
    }), //data End
    props: ['contents'],

    created() {
      this.error = this.contents.Error
      // console.log(this.error)
    }
  } //export default End

</script>

<style lang="css" scoped>
hr {
  border-width: 0.5px;
  border-color: rgb(210, 210, 210);
}
</style>
