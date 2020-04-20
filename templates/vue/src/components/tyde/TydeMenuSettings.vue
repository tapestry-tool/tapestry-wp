<template>
  <section id="tyde-menu-settings">
    <h1>Settings</h1>
    <div class="settings">
      <div class="setting">
        <h1>Music</h1>
        <button :class="{ active: settings.isAudioPlaying }" @click="toggleAudio">
          On
        </button>
        <button :class="{ active: !settings.isAudioPlaying }" @click="toggleAudio">
          Off
        </button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "tyde-menu-settings",
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

<style lang="scss" scoped>
#tyde-menu-settings {
  position: relative;

  .back-button {
    position: absolute;
    top: 0;
    left: -3em;
    width: 64px;
    height: 64px;
    font-size: 32px;
  }

  h1 {
    font-weight: bold;
    text-transform: uppercase;

    &:before {
      display: none;
    }
  }

  .settings {
    margin-top: 2em;
    height: calc(100vh - 210px);
    overflow-y: scroll;

    .setting {
      display: flex;

      h1 {
        margin: 0;
        margin-right: 2em;
        font-size: 2rem;
      }

      button {
        background: none;
        color: inherit;
        padding: 0;
        margin: 0;
        margin-right: 1.5em;
        transition: all 0.2s ease-out;

        &:last-child {
          margin-right: 0;
        }

        &.active {
          position: relative;
          transform: translateY(-8px);

          &::after {
            content: "";
            background: white;
            width: 100%;
            height: 3px;
            position: absolute;
            bottom: -8px;
            left: 0;
          }
        }
      }
    }
  }
}
</style>
