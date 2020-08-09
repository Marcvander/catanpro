// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueResource from 'vue-resource';
import BootstrapVue from 'bootstrap-vue';

import App from './App';
import router from './routes';

Vue.use(VueResource);
Vue.use(BootstrapVue);

//needed to load the .env file
require('dotenv').config();

import $ from 'jquery';
window.$ = $

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
});