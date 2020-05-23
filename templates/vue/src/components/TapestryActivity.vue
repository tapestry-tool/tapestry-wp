<template>
  <div class="tapestry-activity">
    <div class="icon"><tapestry-icon :icon="type" /></div>
    <div v-if="type === 'text'" class="text">{{ entry }}</div>
    <ul v-if="type === 'checklist'" class="checklist">
      <li v-for="(choice, index) in entry" :key="index">
        <div class="img-wrapper">
          <img :src="choice.imageUrl" />
        </div>
        {{ choice.choiceText }}
      </li>
    </ul>
    <audio v-if="type === 'audio'" controls :src="entry"></audio>
  </div>
</template>

<script>
import TapestryIcon from "@/components/TapestryIcon"

export default {
  name: "tapestry-activity",
  components: {
    TapestryIcon,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ["text", "checklist", "audio"].includes(val),
    },
    entry: {
      type: [String, Array],
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.tapestry-activity {
  position: relative;
  align-items: center;
  background: #eee;
  border-radius: 8px;
  display: flex;
  margin-bottom: 8px;
  padding: 8px 16px 8px 38px;
  justify-content: center;
  font-size: 1.5em;

  &:last-child {
    margin-bottom: 0;
  }

  .icon {
    color: #ccc;
    height: 24px;
    width: 24px;
    position: absolute;
    left: 8px;
  }

  img {
    filter: brightness(0.8);
  }

  .checklist {
    list-style: none;
    display: flex;
    flex-wrap: wrap;

    li {
      display: flex;
      flex: 0 0 33%;
      text-align: left;
      margin-bottom: 0.5em;

      &:nth-last-child(-n + 2):first-child,
      &:nth-last-child(-n + 2):first-child ~ li {
        flex-grow: 1;
      }

      &:last-child {
        margin-bottom: 0;
      }

      > .img-wrapper {
        width: 20%;
        min-width: 40px;
        margin-right: 10px;
      }
    }
  }

  * {
    margin: 0;
    padding: 0;
  }
}

.text {
  white-space: pre-wrap;
}
</style>
