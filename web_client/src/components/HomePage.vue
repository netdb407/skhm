<template>
    <v-container fluid fill-height>
      <v-layout >
        <v-img
          :src="require('../assets/PR-img.png')"
          contain
          height="700"
        ></v-img>
      </v-layout>
    </v-container>
</template>

<script>

export default {
  data: () => ({

  }), //data End

  created() {
    // console.log(this.$socket)
    // this.$socket.emit('msg', "test")
    let ts = this
    this.$socket.on('msg', (data)=>{
      ts.$store.commit('showSnack', '벤치마킹 '+data+'이(가) 완료되었습니다.')
    })
    // console.log(this.error)
  }
} //export default End



</script>

<style>
  p{
    float:right;
  }
</style>
