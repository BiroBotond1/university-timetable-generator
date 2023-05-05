import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    generating: false,
    notification: false
  },
  getters: {
    getGeneration: state => state.generating,
    getNotification: state => state.notification
  },
  mutations: {
    IsGenerating(state) {
      state.generating = true;
    },
    GenerationDone(state) {
      state.generating = false;
    }
  },
  actions: {
  },
  modules: {
  }
})
