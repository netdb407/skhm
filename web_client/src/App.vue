<template>

  <v-app>
    <!--상단의 툴바-->
    <v-toolbar flat color="#f8f9f9" extension-height="5"><!-- #f8f9f9-->

      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>eSSD 성능평가</v-toolbar-title>
      <v-flex xs3 sm3 md3 xl3 ma-5 class="v-toolbar-title">
        <v-toolbar-title
          class="tertiary--text font-weight-light"
        >
          {{ title }}
        </v-toolbar-title>
      </v-flex>
      <v-spacer></v-spacer>


<!-- 
      <v-menu bottom left
              content-class="dropdown-menu"
              offset-y
              transition="slide-y-transition">
        <router-link v-ripple
                     slot="activator"
                     class="toolbar-items"
                     to="">
          <v-badge color="error" overlap>
            <template slot="badge">
          {{ notifications.length }}
        </template>
            <v-icon large color="black">notifications</v-icon>
          </v-badge>
        </router-link>
        <v-card>
          <v-list dense>
            <v-list-tile v-for="notification in notifications"
                         :key="notification"
                         >
              <v-list-tile-title v-text="notification" />
            </v-list-tile>
          </v-list>
        </v-card>
      </v-menu> -->
      <v-progress-linear color="orange" :indeterminate="true" slot="extension" class="pa-0" height="5" value="30" v-show="isLoading"></v-progress-linear>
    </v-toolbar>
    <!--/상단의 툴바-->

    <!--사이드 바 메뉴-->
    <v-navigation-drawer v-model="drawer"
                         :clipped="$vuetify.breakpoint.lgAndUp"
                         app
                         width="250"
                         disable-resize-watcher
                         >
      <v-list>
        <router-link to="/">
          <v-list-tile avatar>
            <v-img :src="require('./assets/eSSD-logo.png')" height="55" contain fixed></v-img>
          </v-list-tile>

        </router-link>

        <v-list-group prepend-icon="settings">
          <template v-slot:activator>
        <v-list-tile>
          <v-list-tile-title>설정</v-list-tile-title>
        </v-list-tile>
      </template>
          <!--워크로드 설정, DB 설정-->
          <v-list-tile v-for="(setting, i) in settings" active-class="primary--text menu" :to="setting.href" :key="i">
            <v-list-tile-title v-text="setting.title" class="ml-5 pl-2"></v-list-tile-title>
          </v-list-tile>
        </v-list-group>
        <!--벤치마크 실행, 벤치마킹 결과-->
        <v-list-tile v-for="(menu, i) in menus" :to="menu.href" active-class="primary--text menu" :key="i">
          <v-list-tile-action>
            <v-icon v-text="menu.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-title v-text="menu.title"></v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <!--/사이드 바 메뉴-->
    <v-content>
    <router-view />
    </v-content>
    <!--페이지 별로 화면이 바뀌는 부분-->
    <v-snackbar
        v-model="getSnack.isShow"
        :timeout="getSnack.timeout"
        bottom
      >
        {{ getSnack.msg }}
        <v-btn
          color="red"
          flat
          @click="closeSnack()"
        >
          Close
        </v-btn>
      </v-snackbar>
  </v-app>

</template>

<script>

  export default {
    data: () => ({
      drawer: true,
      title: null,
      settings: [
        {
          href: 'wlsetting',
          title: '워크로드 설정'
        },
        {
          href: 'dbsetting',
          title: 'DB 설정'
        }
      ],
      menus: [
        {
          href: 'execute',
          title: '벤치마크 실행',
          icon: 'launch'
        },
        {
          href: 'result',
          title: '벤치마킹 결과',
          icon: 'assessment'
        }
      ],
      notifications: ['벤치마킹이 완료되었습니다.']
    }),

    watch: {
      '$router' (val) {
        this.title = val.view
      }
    },
    computed :{
      isLoading (){
        return this.$store.state.isLoading
      },
      getSnack(){
        return this.$store.state.snack
      }
    },
    methods: {
      closeSnack() {
        console.log("close");
        this.$store.commit('closeSnack')
      }
    }
  }

</script>

<style>
  a.primary--text {
    background-color: #f8f9f9;
    color: black !important;
    /*F4F6F6*/
  }

  .menu {
    border-right-color: #f58025;
    border-right-width: 8px;
    border-right-style: solid;
    background-color: #f8f9f9;
    color: black !important;
    /*F4F6F6*/
  }
  div.v-list__group__header__prepend-icon.primary--text {
    color: black !important;
  }

</style>
