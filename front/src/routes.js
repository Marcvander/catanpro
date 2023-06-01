import Vue from 'vue';
import VueResource from 'vue-resource';
import Router from 'vue-router';

import Dashboard from './pages/Dashboard/Dashboard';

Vue.use(Router);
Vue.use(VueResource);

const router = new Router({
  //mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
    },
  ],
});

export default router;