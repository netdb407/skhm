import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import router from './router.js';
import './plugins/vuetify'
import axios from 'axios'
import { store } from './store'
import VuetifyDaterangePicker from "vuetify-daterange-picker";
import "vuetify-daterange-picker/dist/vuetify-daterange-picker.css";
import VueGoogleCharts from 'vue-google-charts'
import './plugins/socketPlugin.js'

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(VuetifyDaterangePicker);
Vue.use(VueGoogleCharts)


Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
