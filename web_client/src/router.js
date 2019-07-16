import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import WLsetting from './components/WLsetting.vue'
import DBsetting from './components/DBsetting.vue'
import HomePage from './components/HomePage.vue'
import Execute from './components/Execute.vue'
import Result from './components/Result.vue'
import Notification from './components/Notification.vue'
import BM_detail from './components/BM_detail.vue'
import Error from './components/Error.vue'
import Graph from './components/Graph.vue'

Vue.use(Router)


const baseRoutes = [
  {
    path: '/home',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/wlsetting',
    name: 'wlsetting',
    view: '워크로드 설정',
    component: WLsetting,
  },
  {
    path: '/dbsetting',
    name: 'dbsetting',
    view: 'DB 설정',
    component: DBsetting,
  },
  {
    path: '/execute',
    name: 'execute',
    view: '벤치마크 실행',
    component: Execute,
  },
  {
    path: '/result',
    name: 'result',
    view: '벤치마킹 결과',
    component: Result,
  },
  {
    path: '/notification',
    name: 'notification',
    component: Notification,
  },
  {
  path: '/graph',
  name: 'graph',
  component: Graph,
},
{
  path: '/BM_detail',
  name: 'BM_detail',
  component: BM_detail,
},
{
  path: '/error',
  name: 'Error',
  component: Error,
},
  {
    path: '*',
    redirect: {
      name: 'home',
    },
  },
];

// const routes = baseRoutes.concat(messagesRoutes, peopleRoutes);
const routes = baseRoutes;
export default new Router({
  routes,
});
