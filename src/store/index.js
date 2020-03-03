import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const COVER_URL = [
  require('../assets/cover.jpg'),
  require('../assets/cover2.jpg'),
  require('../assets/cover3.jpg')
]
// 其实就只有两个值，是否播放与封面
export default new Vuex.Store({
  state: {
    isPlaying: false,
    coverUrl: ''
  },
  getters: {},
  mutations: {
    // 必须是同步函数，是一些改变status状态的方法
    togglePlay (state, toggle) {
      state.isPlaying = toggle !== undefined ? toggle : !state.isPlaying
    },
    // 改变封面
    changeCover (state) {
      let value = 1;
      while (value) {
        const index = Math.floor(Math.random() * 3)
        const coverUrl = COVER_URL[index]
        if (coverUrl !== state.coverUrl) {
          state.coverUrl = coverUrl
          break
        }
      }
    }
  },
  actions: {}
})
