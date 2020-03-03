<template>
<!-- 看这个样子是左中右3个标志 -->
  <div class="control" :class="{ control__playing: isPlaying }">
    <div class="control_btn control_btn__side" @click="handlePrev">
      <i class="fa fa-backward" />
    </div>
    <div class="control_btn" @click="handlePlay">
      <span class="play-btn" />
    </div>
    <div class="control_btn control_btn__side" @click="handleNext">
      <i class="fa fa-forward" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { player } from '../player'
// 大多数方法都写在了player.js里面
export default {
  computed: {
    ...mapState(['isPlaying'])
  },
  methods: {
    handlePlay () {
      if (!player.isEmpty) {
        if (!this.isPlaying) {
          player.play()
        } else {
          player.pause()
        }
      }
    },
    handlePrev () {
      if (this.isPlaying) {
        player.prev()
      }
    },
    handleNext () {
      if (this.isPlaying) {
        player.next()
      }
    }
  }
}
</script>

<style lang="scss">
//  这里打了一个底与写了播放键，其他的可能复用了在总的那里了
.control {
  display: flex;
  height: 100%;
}
.control_btn {
  // 基础打底
  display: flex;
  margin: 2px;
  align-items: center;
  justify-content: center;
  flex: 1;
  border-radius: 4px;
  color: #ccc;
  font-size: 16px;
  transition: background-color 0.6s ease;
}
// 悬浮变背景色
.control_btn:hover {
  background-color: #ddd;
  color: white;
}
.control_btn__side {
  font-size: 14px;
}
// 播放键
.play-btn {
  position: relative;
  width: 20px;
  height: 20px;
}
// 画出播放键之我的猜想
//  首先一个内容为0的元素，然后给他一定宽度的边框 border-left-color再定颜色就是三角形了
.play-btn::before {
  // 画出播放键  我吐了
  content: '';
  position: absolute;
  left: 11px;
  top: 50%;
  margin-left: -4px;
  margin-top: -10px;
  width: 0;
  height: 0;
  border: 12px solid transparent;
  // 设置了左边框的颜色
  border-left-color: #ccc;
  // 上下边框宽度
  border-top-width: 10px;
  border-bottom-width: 10px;
  transition: all 0.2s ease;
}
// 这里应该有一个变化的
//  但是找不到，应该跟播放的时候有关，晚上试试
//  这是一竖，平时是隐藏的，然后播放的时候再将三角形变成一竖，就ok了
.play-btn::after {
  content: '';
  position: absolute;
  right: 5px;
  top: 50%;
  margin-right: -4px;
  margin-top: -10px;
  width: 0;
  height: 20px;
  border: 0 solid transparent;
  border-width: 0 0 0 6px;
  border-left-color: #ccc;
  opacity: 0;
  transform: scale(0); // 啊这是缩放函数，scale是2d缩放
  transition: all 0.2s ease;
}
// 这是playing的时候！！！  切换变化为两竖线
// 变化，高度不再试0 是登高的20,三角形变线了，然后宽度为6px，再重新定位
.control__playing .play-btn::before {
  border-width: 0 0 0 6px;
  height: 20px;
  left: 5px;
}
.control__playing .play-btn::after {
  opacity: 1;
  transform: scale(1);// 这里就是缩放一倍了
}
//  悬浮变色
.control_btn:hover .play-btn::before {
  border-left-color: white;
}
.control_btn:hover .play-btn::after {
  border-color: white;
}
</style>
