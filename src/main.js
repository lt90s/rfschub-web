import Vue from 'vue'
// import VueHighlightJS from 'vue-highlightjs'

import App from './App.vue'
import router from './router'
import './plugins/element.js'
import store from './store'

import './icons'
import './router/interceptor'

import '@/style/common.css'

Vue.config.productionTip = false

// Vue.use(VueHighlightJS)

new Vue({
  data() {
    return {
      eventBus: new Vue()
    }
  },
  render: h => h(App),
  router,
  store
}).$mount('#app')
