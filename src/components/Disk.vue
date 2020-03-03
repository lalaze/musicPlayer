<template>
  <div class="disk" :class="{ disk__playing: isPlaying }">
    <!-- for绑定下面的file输入框 -->
    <!-- 这个ref属性是vue自己的，用来操作dom的，在元素是就是dom，
    在组件上就是组件然后可以用$refs引用，跟for一起用时，得到的是一个包含for循环的
    数组 -->
    <label
      class="disk_cover"
      ref="cover"
      for="file"
      :style="{
        transform: stopMatrix,
        backgroundImage: coverUrl ? `url(${coverUrl})` : ''
      }"
    />
    <!-- 然后上面那个style是用来控制旋转的 -->
    <input
      id="file"
      ref="file"
      type="file"
      accept=".mp3"
      multiple
      @change="handleChange"
    />
    <!-- multiple是设置文件类型的 -->
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
// 这两个是vuex的赋值函数
// mapStates一次把想获取的状态以对象返回
//  mapmuatations 提交改变
//  ...mapMutations({
//         'ADD': 'ADD'
//       })
import { player } from '../player'
export default {
  data () {
    return {
      stopMatrix: ''
    }
  },
  computed: {
    ...mapState(['isPlaying', 'coverUrl'])
  },
  watch: {
    // 观测isPlaying的值
    isPlaying (val) {
      if (!val) {
        // 停止咯，就获取组件的transform
        this.stopMatrix = window.getComputedStyle(this.$refs.cover).transform
        // 这里是返回了一个matrix函数，保存了碟片的2d变化

        // 停止的时候保持角度，但是其实一开始还是从0开始定角度转的
      } else {
        // 播放咯
        const matrix = this.stopMatrix
        this.stopMatrix = ''

        const match = matrix.match(/^matrix\(([^,]+),([^,]+)/)
        const [, sin, cos] = match || [0, 0, 0]
        const deg = ((Math.atan2(cos, sin) / 2 / Math.PI) * 360) % 360
        // 一顿操作猛如虎
        // console.log(deg)
        // 这里deg是求出了他停顿的角度
        const styles = [...document.styleSheets]
        // 牛皮呀获取了页面的所有样式，返回一个stylesheet的列表
        styles.forEach(style => {
          const rules = [...style.cssRules]
          console.log(rules)
          // cssRules返回了样式中所有的规则
          // 然后循环做啥呢
          rules.forEach(rule => {
            if (rule.type === rule.KEYFRAMES_RULE && rule.name === 'rotate') {
              // 拿rule定义角度
              // 这个KEYFRAMES_RULE是描述了一整套动画关键帧的对象
              rule.cssRules[0].style.transform = `rotate(${deg}deg)`
              rule.cssRules[1].style.transform = `rotate(${deg + 360}deg)`
              // 从停止角度重新定义动画渲染一周循环
            }
          })
        })
      }
    }
  },
  methods: {
    ...mapMutations(['togglePlay', 'changeCover']),
    // 传文件咯 上面是调用了vuex中的方法改变值了
    async handleChange () {
      const target = this.$refs.file
      const files = target.files ? target.files : []

      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          await player.append(files[i])
        }
      }
      target.value = ''
    }
  },
  mounted () {
    // 这里给了 改变方法函数
    player.onReady.listen(() => {
      this.changeCover()
    })
    player.onChange.listen(() => {
      this.changeCover()
    })
    player.onPlay.listen(() => {
      this.togglePlay(true)
    })
    player.onPause.listen(() => {
      this.togglePlay(false)
    })
  }
}
</script>

<style lang="scss">
// 懂了懂了 舒服了
.disk {
  position: relative;
  // 离谱，又用边框画画
  padding-top: 100%;
  border-radius: 100%;
  overflow: hidden;
  // 处理了位移往上且缩小了
  transform: translateY(-50%) scale(0.88);
  transform-origin: center bottom;
  transition: all 0.6s ease;
}
.disk input {
  display: none;
}
.disk_cover {
  // 问题是怎么定位到这里的
  // 打开f12看，第一层disk是没高度的，label才有高度，disk纯拿边框
  position: absolute;
  // 这个是定位圆心的？破案
  // 这里画圆圈黑，下面after画小粉圆
  // 这个我现在理解为拉长操作，各边框都要负，那就是布满整个画布了
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  // 取背景圆碟片的
  background-image: radial-gradient(circle, #444 0%, #333 100%);
  // 背景覆盖
  background-size: cover;
  background-position: center;
}
.disk_cover::after {
  // 熟悉的写法，舒服了
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -8px;
  margin-top: -8px;
  width: 16px;
  height: 16px;
  border-radius: 100%;
  // 这里是画了一个空心圆了
  background-image: linear-gradient(45deg, white, #dabad1);
  box-shadow: 0 1px 1px 1px rgba(0, 0, 0, 0.2);
}

// playing的时候的动画
.disk__playing {
  transform: translateY(-50%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1),
    0 20px 20px -10px rgba(108, 29, 171, 0.3);
}
.disk__playing .disk_cover {
  animation: rotate infinite 6s linear;
}
@keyframes rotate {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
