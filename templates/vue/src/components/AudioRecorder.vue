<template>
  <div v-if="state === states.NOT_SUPPORTED">
    Oops, your browser doesn't support audio recording.
  </div>
  <div v-else class="recorder">
    <h1>{{ question.text }}</h1>
    <div class="mic">
      <i class="fas fa-microphone"></i>
    </div>
    <audio v-if="state === states.DONE" controls :src="audio"></audio>
    <div v-if="state !== states.DONE">
      <code style="color: white;">{{ durationText }}</code>
    </div>
    <div class="controls">
      <button class="control" @click="toggleRecording">
        <i
          :class="[
            'fas',
            {
              'fa-undo': state === states.DONE,
              'fa-pause': state === states.RECORDING,
              'fa-play': state !== states.RECORDING,
            },
          ]"
        ></i>
      </button>
      <button
        class="control"
        :disabled="state === states.DONE"
        @click="stopRecording"
      >
        <i class="fas fa-stop"></i>
      </button>
    </div>
    <div class="content">
      <button v-if="state === states.DONE" @click="$emit('submit', audio)">
        Done
      </button>
    </div>
  </div>
</template>

<script>
import AudioRecoder from "audio-recorder-polyfill"
import { mapGetters } from "vuex"

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
    ...mapGetters(["getQuestion"]),
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
      return (
        this.question.entries.audioId && this.question.entries.audioId.length > 0
      )
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
    if (this.hasPrevious) {
      this.state = this.states.DONE
      this.audio =
        "data:audio/ogg; codecs=opus;base64," +
        this.getQuestion(this.id).entries.audioId
    } else {
      this.state = this.states.READY
    }
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
      } else {
        this.startRecording()
      }
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
    border-radius: 16px;

    &:hover {
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

  .control {
    border-radius: 50%;
    font-size: 24px;
    height: 56px;
    width: 56px;
  }

  .controls {
    margin-bottom: 16px;
  }

  .mic {
    font-size: 72px;
  }
}
</style>
