<template>
  <div v-if="state === states.NOT_SUPPORTED">
    Oops, your browser doesn't support audio recording.
  </div>
  <div v-else>
    <button @click="startRecording">Start</button>
    <button @click="toggleRecording">
      {{ state === states.PAUSED ? "Play" : "Pause" }}
    </button>
    <button @click="stopRecording">Stop</button>
    <audio v-if="state === states.DONE" controls :src="audio"></audio>
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
      recorder: null,
      state: null,
    }
  },
  computed: {
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
    startRecording() {
      this.data = []
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
        this.state = this.states.RECORDING
      })
    },
    stopRecording() {
      this.recorder.stop()
    },
    toggleRecording() {
      if (this.state === this.states.RECORDING) {
        this.recorder.pause()
        this.state = this.states.PAUSED
      } else if (this.state === this.states.PAUSED) {
        this.recorder.resume()
        this.state = this.states.RECORDING
      }
    },
  },
}
</script>
