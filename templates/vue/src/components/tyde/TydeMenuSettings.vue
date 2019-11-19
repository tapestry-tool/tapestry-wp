<template>
  <section class="wrapper">
    <tyde-button class="back-button" icon="arrow-left" @click="$emit('back')" />
    <h1 class="title">Settings</h1>
    <div class="settings">
      <div class="setting">
        <h1 class="title title--setting">Music</h1>
        <button
          :class="[
            'setting_button',
            { 'setting_button--active': settings.isAudioPlaying },
          ]"
          @click="toggleAudio"
        >
          On
        </button>
        <button
          :class="[
            'setting_button',
            { 'setting_button--active': !settings.isAudioPlaying },
          ]"
          @click="toggleAudio"
        >
          Off
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import TydeButton from "./TydeButton"

export default {
  name: "tyde-menu-settings",
  components: {
    TydeButton,
  },
  props: {
    settings: {
      type: Object,
      required: true,
    },
  },
  methods: {
    toggleAudio() {
      this.$emit("settings-change", {
        isAudioPlaying: !this.settings.isAudioPlaying,
      })
    },
  },
}
</script>

<style scoped>
.back-button {
  position: absolute;
  top: 0;
  left: -3em;
  width: 64px;
  height: 64px;
  font-size: 32px;
}

.title {
  font-weight: bold;
  text-transform: uppercase;
}

.title:before {
  display: none;
}

.title--setting {
  margin: 0;
  margin-right: 2em;
  font-size: 2rem;
}

.settings {
  margin-top: 2em;
  height: calc(100vh - 210px);
  overflow-y: scroll;
}

.setting {
  display: flex;
}

.setting_button {
  background: none;
  color: inherit;
  padding: 0;
  margin: 0;
  margin-right: 1.5em;
  transition: all 0.2s ease-out;
}

.setting_button:last-child {
  margin-right: 0;
}

.setting_button--active {
  position: relative;
  transform: translateY(-8px);
}

.setting_button--active::after {
  content: "";
  background: white;
  width: 100%;
  height: 3px;
  position: absolute;
  bottom: -8px;
  left: 0;
}

.wrapper {
  position: relative;
}
</style>
