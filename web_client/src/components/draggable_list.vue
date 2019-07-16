<template lang="html">

  <!-- draggable한 NoSQL과 WL파일 리스트가 v-for로 반복되어 왼쪽에 나타나는 부분 -->
  <v-card>
    <v-flex>
      <v-list two-line>
        <v-toolbar flat color="grey lighten-2">
          <v-toolbar-title>
            <h3>{{ conf.title }}</h3>
          </v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-container id="scroll-target"
                     style="max-height: 550px"
                     class="scroll-y">
          <v-layout v-scroll:#scroll-target="onScroll" column
                    style="height: 100%">
            <draggable :list="conf.lists"
                       :group="{name: conf.gr, pull: 'clone',  put: false}"
                       :sort="false"
                       :move="onMove"
                       style="min-height: 10px"
                       class="hover">
              <template v-for="list in conf.lists">
                <v-list-tile :key="list.id" avatar >
                  <v-list-tile-avatar>
                    <v-icon>folder_shared</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title v-html="list.drg_name"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="list.totalOperation"></v-list-tile-sub-title>
                    <v-list-tile-sub-title v-html="list.n_version"></v-list-tile-sub-title>
                    <!-- 연산비율과 node버전은 값이 없으면 그냥 안보임 -->
                  </v-list-tile-content>
                  <!-- 추후에 개발완료해서 다시 살릴 것 -->
                  <!--info-->
                  <!-- <v-list-tile-action>
                    <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="200" offset-x>
                         <template v-slot:activator="{ on }">
                           <v-btn icon ripple v-on="on"><v-icon color="grey lighten-1">info</v-icon></v-btn>
                         </template>
              <v-card>
                <v-list>
                  <v-list-tile>
                    <v-list-tile-content>
                      <v-list-tile-title v-html="list.config_name"></v-list-tile-title>
                      <v-list-tile-sub-title>
                        Read:10/Update:15/Insert:20/Scan:20/ReadModifyWrite:30
                      </v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-card>
              </v-menu>
              </v-list-tile-action> -->
              <!--/info-->
              </v-list-tile>
              </template>
            </draggable>
          </v-layout>
        </v-container>

      </v-list>
    </v-flex>
  </v-card>

</template>

<script>

  import draggable from 'vuedraggable'

  export default {
    data: () => ({
      fav: true,
      menu: false,
      message: false,
      hints: true
    }),

    props: ['conf'],

    components: {
      draggable
    },

    methods: {
      onMove(evt) {
        if (evt.draggedContext.element.type === 'wl') {
          let canMove = true
          let source = evt.draggedContext.element.w_id
          evt.relatedContext.list.forEach(item => {
            // console.log(item);
            if (item.w_id == source) {
              canMove = false
              return false
            }
          })
          return canMove
        } else {
          this.$store.commit('checkDBList', evt.draggedContext.element)
          return false
        }
      }
    }
  }

</script>

<style lang="css" scoped>

  .v-list {
    list-style-type: none;
    padding: 0px 0 0px;
  }
  .hover {
    cursor: pointer;
  }

</style>
