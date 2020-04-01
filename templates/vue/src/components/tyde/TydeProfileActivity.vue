<template>
  <li id="tyde-profile-activity">
    <div class="activity-thumbnail">
      <tyde-icon :icon="icon" class="activity-thumbnail-icon"></tyde-icon>
    </div>
    <div class="activity-details">
      <h1>{{ activity.title }}</h1>
      <p>You answered:</p>
      <div>
        <audio-player
          v-if="activity.audioSrc"
          :audio-src="activity.audioSrc"
        ></audio-player>
        <div v-else-if="activity.text" v-html="activity.text"></div>
        <ul v-else-if="activity.checklist">
          <li v-for="answer in activity.checklist" :key="answer">{{ answer }}</li>
        </ul>
      </div>
    </div>
  </li>
</template>

<script>
import AudioPlayer from "@/components/AudioPlayer"
import TydeIcon from "./TydeIcon"

export default {
  name: "tyde-profile-activity",
  components: {
    AudioPlayer,
    TydeIcon,
  },
  props: {
    activity: {
      type: Object,
      required: true,
    },
  },
  computed: {
    icon() {
      return this.activity.checklist
        ? "checklist"
        : this.activity.text
        ? "text"
        : "audio"
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/tyde-colors.scss";

#tyde-profile-activity {
  position: relative;
  background: var(--tapestry-med-gray);
  border: 1px solid var(--tapestry-light-gray);
  margin: 0;
  margin-bottom: 8px;
  min-height: 160px;
  padding: 24px;
  width: 100%;
  display: flex;

  .back-button {
    position: absolute;
    top: 0;
    left: -3em;
    width: 64px;
    height: 64px;
    font-size: 32px;
  }

  .activity-thumbnail {
    width: 250px;
    height: 225px;
    float: left;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  img.activity-thumbnail-icon {
    height: 100px;
    width: auto;
  }

  i.activity-thumbnail-icon {
    font-size: 100px;
    text-shadow: 2px 2px 100px #000;
  }

  .activity-details {
    float: right;
    font-size: 20px;
    width: calc(100% - 280px);
    word-break: break-word;
    > h1::before {
      content: none;
    }

    > p {
      padding: unset;
      line-height: 1.4em;
      margin-bottom: 0;
    }
  }
}
</style>
