<template>
  <div class="progress" :class="{ progress__playing: isPlaying }">
    <h2 class="progress_title">{{ name | formatName }}</h2>
    <p class="progress_text">
      {{ position | formatTime }} / {{ duration | formatTime }}
    </p>
    <!-- 这里是进度条，width根据值变化 -->
    <div class="progress_line">
      <span :style="{ width: progress }" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { player } from '../player'
export default {
  data () {
    return {
      name: '',
      position: 0,
      duration: 0.001,
      progress: ''
    }
  },
  computed: {
    ...mapState(['isPlaying'])
  },
  filters: {
    formatTime (val) {
      const min = Math.floor(val / 60)
      const sec = Math.floor(val % 60)
      return `${min}:${sec < 10 ? '0' : ''}${sec}`
    },
    formatName (val) {
      return val.replace(/\.mp3$/, '')
    }
  },
  mounted () {
    const draw = () => {
      requestAnimationFrame(draw)
      const progress = player.position / player.duration
      this.progress = `${(progress * 100).toFixed(2)}%`
      // 检测进度条的变化咯
      this.position = player.position
      this.duration = player.duration
      this.name = player.current.file ? player.current.file.name : ''
    }

    draw()
  }
}
</script>
//  总体来说是歌曲名字进度条与歌曲时间的背景板与播放中的样式
// 这是歌曲播放的时候上面的进度条板
<style lang="scss">
.progress {
  padding-left: 123px;
  padding-right: 12px;
  height: 100%;
  border-radius: 6px 6px 0 0;
  // 这里是直接透明取背景色了
  background-color: rgba(255, 255, 255, 0.5);
  transition: all 0.6s ease;
}
// 播放时的变化，就是他其实是隐藏在主板下面然后升上来的
.progress__playing {
  transform: translateY(-100%);
}
.progress_title {
  padding-top: 6px;
  font-size: 12px;
  font-weight: bold;
  overflow: hidden;
  // 文本溢出时用省略号
  text-overflow: ellipsis;
}
.progress_text {
  padding-top: 2px;
  padding-left: 2px;
  font-size: 12px;
  font-weight: bold;
  color: #ccc;
  transform: scale(0.6);
  //  设置旋转元素的围绕点
  transform-origin: left top;
}
.progress_line {
  height: 3px;
  border-radius: 3px;
  overflow: hidden;
  // background-color: #ddd;
  background-color: red;
}
// 进度条
// 进度条怎么没看到，我人没了
.progress_line span {
  display: block;
  height: 100%;
  background-color: #ec51a5;
}
</style>
