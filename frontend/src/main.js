import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import io from 'socket.io-client'
import './assets/global.css';

Vue.config.productionTip = false

const socket = io('http://localhost:3000')

Vue.prototype.$socket = socket

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
