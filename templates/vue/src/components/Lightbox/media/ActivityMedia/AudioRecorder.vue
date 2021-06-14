<template>
  <div v-if="state === states.NOT_SUPPORTED">
    Oops, your browser doesn't support audio recording.
  </div>
  <div v-else-if="state === states.WAIT">
    Please provide microphone access to record your answer.
  </div>
  <div v-else class="recorder">
    <p>disableSubmitFlag is {{ disableSubmitFlag }}</p>
    <!-- <p>question is {{ question }}</p> -->
    <!-- <p>audio url is {{ audio }}</p>
    <p>doneButtonPressed is {{ doneButtonPressed }}</p>
    <p>getAudioUrl is {{ getAudioUrl }}</p> -->
    <!-- src should be the url -->
    <audio v-if="doneButtonPressed" controls :src="audio"></audio>
    <audio v-else-if="state === states.DONE" controls :src="getAudioUrl"></audio>
    <button
      v-else
      class="main-button my-2"
      data-qa="record"
      @click="toggleRecording"
    >
      <i
        :class="'fas fa-' + (state === states.RECORDING ? 'pause' : 'microphone')"
      ></i>
    </button>
    <div class="w-100">
      <code v-if="state !== states.DONE" style="color: white;">
        {{ durationText }}
      </code>
    </div>
    <button
      :disabled="duration === 0 && state !== states.DONE"
      class="my-3"
      @click="resetRecording"
    >
      <i class="fas fa-undo"></i>
      Re-record
    </button>
    <button
      v-if="state !== states.DONE"
      :disabled="duration === 0"
      class="my-3"
      @click="stopRecording"
    >
      <i class="fas fa-check"></i>
      Done
    </button>
    <button
      v-if="state === states.DONE"
      :disabled="disableSubmitFlag"
      class="my-3"
      @click="handleSubmit"
    >
      <i class="fas fa-check"></i>
      Submit
    </button>
  </div>
</template>

<script>
import AudioRecoder from "audio-recorder-polyfill"
import client from "@/services/TapestryAPI"
import { mapGetters } from "vuex"
import { data as wpData } from "@/services/wp"

// Polyfill for Safari and Edge
if (!window.MediaRecorder) {
  window.MediaRecorder = AudioRecoder
}

export default {
  name: "audio-recorder",
  props: {
    id: {
      type: String,
      required: true,
    },
    node: {
      type: Object,
      required: true,
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
      doneButtonPressed: false,
      disableSubmitFlag: this.audio !== null,
    }
  },
  computed: {
    ...mapGetters(["getQuestion", "getAnswers"]),
    getAudioUrl() {
      return this.audio + "?" + Date.now()
    },
    question() {
      return this.getQuestion(this.id)
    },
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
    hasPrevious() {
      let answers = this.getAnswers(this.node.id, this.question.id)
      return answers.audio && answers.audio.url && answers.audio.url.length > 0
    },
    states() {
      return {
        WAIT: "wait",
        DONE: "done",
        NOT_SUPPORTED: "not-supported",
        PAUSED: "paused",
        READY: "ready",
        RECORDING: "recording",
      }
    },
  },
  watch: {
    id() {
      let answersObject = this.getAnswers(this.node.id, this.question.id)
      console.log("current answersObject is", answersObject)
      console.log("switched question")
      if (
        answersObject.audio &&
        answersObject.audio.url &&
        answersObject.audio.url.length > 0
      ) {
        this.audio = wpData.uploadDirArray.baseurl + "/" + answersObject.audio.url
      } else {
        this.initialize()
      }
    },
  },
  created() {
    if (this.hasPrevious) {
      console.log("audio answer already exist got here")
      this.state = this.states.DONE
      let answersObject = this.getAnswers(this.node.id, this.question.id)
      console.log("answersObject in created is", answersObject)
      console.log("wpdata.uploadDirArray is", wpData.uploadDirArray)
      console.log("wpdata.uploadDirArray.baseurl is", wpData.uploadDirArray.baseurl)
      this.audio = wpData.uploadDirArray.baseurl + "/" + answersObject.audio.url
      console.log("already exist audio url is", this.audio)
    } else {
      console.log("audio answer does not exist got here")
      this.state = this.states.WAIT
      this.initialize()
      console.log("audio initial state is", this.audio)
    }
  },
  mounted() {
    if (!navigator.mediaDevices.getUserMedia) {
      this.state = this.states.NOT_SUPPORTED
    }
  },
  methods: {
    initialize() {
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
            this.doneButtonPressed = true
          }
        })

        this.recorder = recorder
        this.state = this.states.READY
      })
    },
    startDurationCount() {
      this.durationInterval = setInterval(() => {
        this.duration++
      }, 1000)
    },
    stopDurationCount() {
      clearInterval(this.durationInterval)
    },
    startRecording() {
      client.recordAnalyticsEvent("user", "start", "audio-recorder", this.id)
      this.recorder.start()
      this.startDurationCount()
      this.state = this.states.RECORDING
    },
    pauseRecording() {
      client.recordAnalyticsEvent("user", "pause", "audio-recorder", this.id)
      this.recorder.pause()
      this.stopDurationCount()
      this.state = this.states.PAUSED
    },
    resumeRecording() {
      client.recordAnalyticsEvent("user", "resume", "audio-recorder", this.id)
      this.recorder.resume()
      this.startDurationCount()
      this.state = this.states.RECORDING
    },
    stopRecording() {
      client.recordAnalyticsEvent("user", "stop", "audio-recorder", this.id)
      this.recorder.stop()
      this.stopDurationCount()
      this.disableSubmitFlag = false
    },
    resetRecording() {
      client.recordAnalyticsEvent("user", "reset", "audio-recorder", this.id)
      this.initialize()
      this.state = null
      this.doneButtonPressed = false
    },
    toggleRecording() {
      switch (this.state) {
        case this.states.RECORDING:
          this.pauseRecording()
          break
        case this.states.PAUSED:
          this.resumeRecording()
          break
        default:
          this.startRecording()
          break
      }
    },
    handleSubmit() {
      client.recordAnalyticsEvent("user", "submit", "audio-recorder", this.id)
      console.log("new submitted audio should be", this.audio)
      this.doneButtonPressed = false
      this.$emit("submit", this.audio)
    },
  },
}
</script>

<style lang="scss" scoped>
.recorder {
  h1 {
    margin-bottom: 32px;
  }

  audio {
    margin-bottom: 16px;
  }

  button {
    background-color: rgba(26, 26, 26, 0.8);
    border-radius: 30px;
    font-size: 24px;
    height: 56px;
    width: auto;
    min-width: 56px;

    &.main-button {
      width: 122px;
      height: 122px;
      font-size: 72px;
      border-radius: 72px;
    }

    &:not(:disabled):hover {
      background-color: #11a6d8;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
      pointer-events: none;
    }
  }

  i {
    margin: auto;
  }
}
</style>
