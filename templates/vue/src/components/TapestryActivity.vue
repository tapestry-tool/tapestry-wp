<template>
  <div class="tapestry-activity">
    <div class="icon"><tapestry-icon :icon="type" /></div>
    <div v-if="type === 'text'" class="text">{{ entry }}</div>
    <ul v-if="type === 'checklist'" class="checklist">
      <li v-for="choice in entry" :key="choice">{{ choice }}</li>
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
  align-items: center;
  background: #262626;
  border-radius: 8px;
  display: flex;
  margin-bottom: 8px;
  padding: 8px 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .icon {
    margin-right: 16px;
    height: 24px;
    width: 24px;
  }

  .checklist {
    list-style: none;
    display: flex;

    li {
      margin-right: 8px;
      &:last-child {
        margin-right: 0;
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
