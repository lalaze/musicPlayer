// 调度，应该就是听歌那个队列了
class Dispatcher {
    constructor () {
      this.handlers = []
    }
  
    listen (handler) {
      this.handlers.push(handler)
    }
    // 队列播放方法
    emit (...args) {
      // 打印大法
      // console.log(...args)
      // args是参数，这里是直接传player了
      // handlers哪里来呢 打印大法
      // console.log(this.handlers)
      this.handlers.forEach(handler => {
        // 就差这里了，打印大法启动
        // console.log(handler)
        // wdnmd  原来是传了个函数handler
        handler(...args)
      })
    }
  }
  
  class Player {
    constructor () {
      this.audioContext = new AudioContext()
      // 这个AudioContext是一个处理音频的接口
      // https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
      this.playList = []
      this.playIndex = 0
      this.isPlaying = false
  
      this.emptyNode = {
        file: null,
        offset: 0,
        start: null,
        source: null,
        buffer: null
      }
      // 这个source看着像源的样子，就是播放的时候是播放他的
      // 上面那个类？有播放暂停队列方法
      this.onPlay = new Dispatcher()
      this.onPause = new Dispatcher()
      this.onChange = new Dispatcher()
      this.onReady = new Dispatcher()
    }
    // async异步函数
    async readAudioBuffer (file) {
      // 异步读取文件方法  这个是
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async evt => { // load事件
          this.audioContext
            .decodeAudioData(evt.target.result)
            .then(resolve, reject)
            // 异步解码音频文件
            // AudioContext接口的decodeAudioData()方法可用于异步解码音频文件中的 ArrayBuffer. 返回的是一个有AudioBuffer接口的不知道什么东西，可以拿时间
        }
        reader.onerror = reject
        // 这个是onerror事件，加载错误时执行
        reader.readAsArrayBuffer(file)
        // 没有错位就读取文件，按字节读取转换为ArrayBuffer对象 读取完就解码 然后buffer里面就放了解码后的数据
      })
    }
    // 加文件在队列中
    async append (file) {
      const isEmpty = this.isEmpty
      this.playList.push({
        file,
        offset: 0, // 保存播放时间
        start: null, // 保存播放开始时间
        source: null,
        buffer: await this.readAudioBuffer(file)
      })
      // push一个空的 然后往里面写内容
      // 非空才播放
      if (isEmpty) {
        // 变封面
        this.onReady.emit(this)
      }
    }
  
    play () {
      // 播放长度为0并没有播放源了 就 返回了
      if (!this.playList.length || this.current.source) {
        return
      }
      const source = this.audioContext.createBufferSource()
      // 解码音轨咯 上面那个方法创造了一个播放音乐的对象
      source.buffer = this.current.buffer
      // 将放在current的buffer给了他 定义他要播放的音频
      source.onended = this.next.bind(this) // 绑定结束事件播放下一首
      source.connect(this.audioContext.destination)
      // 将AudioBufferSourceNode连接到destination以便我们可以听到声音
      // destination为播放设备，这里理解为连接设备，然后开始播放
      source.start(0, this.current.offset) // 开始播放
      // this.current为目前在运行的非空文件
      this.current.source = source
      // 这里装了source！！！！！
      // 这个source不是很懂 打印大法
      this.current.start = this.audioContext.currentTime
      // currentTime返回硬件调用的秒数  给了start
      this.onPlay.emit(this)
      // onplay改变是否播放
  
      // 最后的问题，给了source
      this.playVersion(source)

    } 

    playVersion(source) {
      this.isPlaying = true

      let analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256

      source.connect(analyser);
      analyser.connect(this.audioContext.destination);

      let bufferLength = analyser.frequencyBinCount;
      let dataArray = new Uint8Array(bufferLength);

      let canvas = document.getElementById('canvas');
    
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let ctx = canvas.getContext("2d");
      let WIDTH = canvas.width;
      let HEIGHT = canvas.height;

      let barWidth = WIDTH / bufferLength * 1.5;
      let barHeight;
      
      let that = this;
      let draw = function () {
        if (!that.isPlaying) {
          that.clearPlayVersion(WIDTH,HEIGHT,barWidth,barHeight)
          return;
        }
        analyser.getByteFrequencyData(dataArray); 
        requestAnimationFrame(draw);
        
        ctx.clearRect(0, 0, barWidth, barHeight);
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        for (var i = 0, x = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            var r = barHeight + 25 * (i / bufferLength);
            var g = 250 * (i / bufferLength);
            var b = 50;

            ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 2;
        }
      }
      draw()
    }

    clearPlayVersion(a,b,c,d) {
      let canvas = document.getElementById('canvas')
      let ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, a, b);
      ctx.clearRect(0, 0, c, d);
    }
  
    pause () {
      if (!this.playList.length || !this.current.source) {
        return
      }

      this.isPlaying = false

      this.current.source.stop(0)
      this.current.source.disconnect(0)
      this.current.source.onended = null
      this.current.source = null
      // 修改当前文件的source状态
      this.current.offset = this.position
      this.current.start = null
  
      this.onPause.emit(this)
    }
  
    stop () {
      this.isPlaying = false

      this.pause()
      // 重新播放咯
      this.current.offset = 0
      this.current.start = null
      
    }
  
    next () {
      this.stop()
      this.playIndex++
      if (this.playIndex >= this.playList.length) {
        this.playIndex = 0
      }
      this.play()
      this.onChange.emit(this)
    }
  
    prev () {
      this.stop()
      this.playIndex--
      if (this.playIndex < 0) {
        this.playIndex = Math.max(this.playList.length - 1, 0)
      }
      this.play()
      this.onChange.emit(this)
    }
  
    get isEmpty () {
      // 相等就是空的没播放，返回true
      return this.current === this.emptyNode
    }
  
    get current () {
      // 正在播放的跟空节点或了，就是他们两个
      // 【a || b】：a存在返回a，a不存在返回b
      // 【a && b】：a存在返回b，a不存在返回a
      return this.playList[this.playIndex] || this.emptyNode
    }
    // 这个看着像保存圈圈的位置信息的
    get position () {
      // 一般的播放保存位置执行了这个，下面那个可能是特殊情况下有用吧
      // 特你mb这个是get
      // 看起来像保存播放时间呢
      if (!this.playList.length) {
        return 0
      }
      return (
        this.current.offset +
        (this.current.start !== null
          ? this.audioContext.currentTime - this.current.start
          : 0)
      )
    }
    // 这东西没执行呀
    set position (val) {
      // 这tm像是一个保存位置的方法
      if (!this.playList.length) {
        return
      }
      this.stop()
      this.current.offset = val
      this.current.start = null
      this.play()
    }
  
    get duration () {
      return this.current.buffer ? this.current.buffer.duration : 0.001
      // AudioBuffer接口的duration属性返回一个双精度数，表示缓冲区中存储的PCM数据的持续时间
    }
  }
  // 暴露了player并在导入的时候就初始化了
  export const player = new Player()
  