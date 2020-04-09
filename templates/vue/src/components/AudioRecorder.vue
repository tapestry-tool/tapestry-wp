<template>
  <loading v-if="state === states.LOADING" />
  <div v-else-if="state === states.NOT_SUPPORTED">
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
import Loading from "./Loading"

// Polyfill for Safari and Edge
if (!window.MediaRecorder) {
  window.MediaRecorder = AudioRecoder
}

export default {
  name: "audio-recorder",
  components: {
    Loading,
  },
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
        LOADING: "loading",
        NOT_SUPPORTED: "not-supported",
        PAUSED: "paused",
        READY: "ready",
        RECORDING: "recording",
      }
    },
  },
  created() {
    this.state = this.states.LOADING
  },
  mounted() {
    if (!navigator.mediaDevices.getUserMedia) {
      this.state = this.states.NOT_SUPPORTED
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const recorder = new MediaRecorder(stream)

        recorder.addEventListener("dataavailable", evt => {
          this.data.push(evt.data)
        })

        recorder.addEventListener("stop", () => {
          const blob = new Blob(this.data, { type: "audio/ogg; codecs=opus" })
          this.audio = URL.createObjectURL(blob)
          this.state = this.states.DONE
        })

        this.recorder = recorder
        this.state = this.states.READY
      })
    }
  },
  methods: {
    startRecording() {
      this.data = []
      this.recorder.start()
      this.state = this.states.RECORDING
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
