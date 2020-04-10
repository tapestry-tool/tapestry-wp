<template>
  <div v-if="state === states.NOT_SUPPORTED">
    Oops, your browser doesn't support audio recording.
  </div>
  <div v-else>
    <div class="controls">
      <button @click="startRecording">Start</button>
      <button @click="toggleRecording">
        {{ state === states.PAUSED ? "Play" : "Pause" }}
      </button>
      <button @click="stopRecording">Stop</button>
    </div>
    <div class="content">
      <div>
        <code>{{ durationText }}</code>
      </div>
      <audio v-if="state === states.DONE" controls :src="audio"></audio>
      <button v-if="state === states.DONE" @click="$emit('submit', audio)">
        Done
      </button>
    </div>
  </div>
</template>

<script>
import AudioRecoder from "audio-recorder-polyfill"

// Polyfill for Safari and Edge
if (!window.MediaRecorder) {
  window.MediaRecorder = AudioRecoder
}

export default {
  name: "audio-recorder",
  props: {
    id: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      audio: null,
      data: [],
      duration: 0,
      durationInterval: null,
      recorder: null,
      state: null,
    }
  },
  computed: {
    durationText() {
      let hours = Math.floor(this.duration / 3600)
      let minutes = Math.floor((this.duration - hours * 3600) / 60)
      let sec = this.duration - hours * 3600 - minutes * 60
      if (sec < 10) {
        sec = `0${sec}`
      }
      if (hours > 0 && minutes < 10) {
        minutes = `0${minutes}`
      }
      if (hours === 0) {
        return `${minutes}:${sec}`
      }
      return `${hours}:${minutes}:${sec}`
    },
    states() {
      return {
        DONE: "done",
        NOT_SUPPORTED: "not-supported",
        PAUSED: "paused",
        READY: "ready",
        RECORDING: "recording",
      }
    },
  },
  created() {
    this.state = this.states.READY
  },
  mounted() {
    if (!navigator.mediaDevices.getUserMedia) {
      this.state = this.states.NOT_SUPPORTED
    }
  },
  methods: {
    startDurationCount() {
      this.durationInterval = setInterval(() => {
        this.duration++
      }, 1000)
    },
    startRecording() {
      this.data = []
      this.duration = 0
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const recorder = new MediaRecorder(stream)

        recorder.addEventListener("dataavailable", evt => {
          this.data.push(evt.data)
        })

        recorder.addEventListener("stop", () => {
          const blob = new Blob(this.data, { type: "audio/ogg; codecs=opus" })
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onload = () => {
            const data = reader.result
            this.audio = data
            this.state = this.states.DONE
          }
        })

        this.recorder = recorder
        this.recorder.start()
        this.startDurationCount()
        this.state = this.states.RECORDING
      })
    },
    stopDurationCount() {
      clearInterval(this.durationInterval)
    },
    stopRecording() {
      this.recorder.stop()
      this.stopDurationCount()
    },
    toggleRecording() {
      if (this.state === this.states.RECORDING) {
        this.recorder.pause()
        this.stopDurationCount()
        this.state = this.states.PAUSED
      } else if (this.state === this.states.PAUSED) {
        this.recorder.resume()
        this.startDurationCount()
        this.state = this.states.RECORDING
      }
    },
  },
}
</script>
