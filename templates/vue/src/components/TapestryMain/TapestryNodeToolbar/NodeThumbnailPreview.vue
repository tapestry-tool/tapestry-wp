<template>
  <svg
    width="46"
    height="46"
    preserveAspectRatio="xMidYMid slice"
    focusable="false"
    role="img"
  >
    <circle
      cx="23"
      cy="23"
      r="12"
      :fill="value ? 'url(#' + imagePatternId + ')' : '#868e96'"
      stroke="#868e96"
    ></circle>
    <defs v-if="value">
      <pattern :id="imagePatternId" width="1" height="1">
        <image
          preserveAspectRatio="xMidYMid slice"
          :href="value"
          x="0"
          y="0"
          width="23"
          height="23"
        />
      </pattern>
    </defs>
    <text v-if="!value" x="50%" y="50%" fill="#dee2e6" dy=".3em" dx="-2em">
      No image
    </text>
  </svg>
</template>

<script>
export default {
  name: "node-thumbnail-preview",
  props: {
    value: {
      type: String,
      default: null,
    },
  },
  computed: {
    imagePatternId() {
      return (
        "thumbnail-preview-" +
        Math.random()
          .toString(36)
          .substring(9)
      )
    },
  },
}
</script>

<style></style>
