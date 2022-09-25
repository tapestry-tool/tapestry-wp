<template>
  <div v-if="state === states.NOT_SUPPORTED">
    Oops, your browser doesn't support audio recording.
  </div>
  <div v-else-if="state === states.LOADING">
    Please provide microphone access to record your answer.
  </div>
  <div v-else class="recorder">
    <audio
      v-if="state === states.SAVED || state === states.UNSAVED"
      controls
      :src="state === states.SAVED ? uncachedAudioUrl : audio"
    ></audio>
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
      <code v-if="state !== states.SAVED" class="duration-text">
        {{ durationText }}
      </code>
    </div>
    <button
      v-if="question.optional"
      class="my-3 btn-link"
      @click="$emit('skip-question')"
    >
      Skip
    </button>
    <button
      :disabled="duration === 0 && state !== states.SAVED"
      class="my-3"
      @click="resetRecording"
    >
      <i class="fas fa-undo"></i>
      Re-record
    </button>
    <button
      v-if="state === states.PAUSED || state === states.RECORDING"
      :disabled="duration === 0"
      class="my-3"
      data-qa="done-button-audio"
      @click="stopRecording"
    >
      <i class="fas fa-check"></i>
      Done
    </button>
    <button
      v-if="state === states.UNSAVED"
      class="my-3"
      data-qa="submit-button-audio"
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
  name: "audio-question",
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
    }
  },
  computed: {
    ...mapGetters(["getQuestion", "getAnswers"]),
    uncachedAudioUrl() {
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
      if (answers !== undefined) {
        return answers.audio && answers.audio.url
      } else {
        return false
      }
    },
    states() {
      return {
        NOT_SUPPORTED: "not-supported",
        LOADING: "loading",
        READY: "ready",
        RECORDING: "recording",
        PAUSED: "paused",
        UNSAVED: "unsaved",
        SAVED: "saved",
      }
    },
  },
  watch: {
    id() {
      let answersObject = this.getAnswers(this.node.id, this.question.id)
      if (answersObject?.audio?.url) {
        this.state = this.states.SAVED
        this.audio = wpData.uploadDirArray.baseurl + "/" + answersObject.audio.url
      } else {
        this.initialize()
      }
    },
  },
  created() {
    if (this.hasPrevious) {
      this.state = this.states.SAVED
      let answersObject = this.getAnswers(this.node.id, this.question.id)
      this.audio = wpData.uploadDirArray.baseurl + "/" + answersObject.audio.url
    } else {
      this.state = this.states.LOADING
      this.initialize()
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
            this.state = this.states.UNSAVED
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
    },
    resetRecording() {
      client.recordAnalyticsEvent("user", "reset", "audio-recorder", this.id)
      this.initialize()
      this.state = null
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
      this.state = this.states.SAVED
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

    &.btn-link {
      background: none !important;
      color: var(--text-color-primary);
    }

    &:not(:disabled):hover {
      background-color: var(--highlight-color) !important;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
      pointer-events: none;
    }
  }

  .duration-text {
    color: var(--text-color-primary);
  }

  i {
    margin: auto;
  }
}
</style>
