<template>
  <div class="circular-progress-container">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        class="circular-progress-track"
        :stroke-width="thickness"
        fill="none"
        :stroke="trackColor"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
      />
      <circle
        class="circular-progress-bar"
        :class="{ animated: animated }"
        :stroke-width="thickness"
        fill="none"
        :stroke="!!completedColor && value === 1 ? completedColor : color"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
        :stroke-dasharray="`${circumference} ${circumference}`"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <div v-if="showPercentage" class="circular-progress-label">
      {{ !!completedLabel && value === 1 ? completedLabel : percentageLabel }}
    </div>
  </div>
</template>

<script>
export default {
  name: "circular-progress",
  props: {
    value: {
      type: Number,
      required: true,
    },
    size: {
      type: Number,
      required: false,
      default: 40,
    },
    thickness: {
      type: Number,
      required: false,
      default: 5,
    },
    color: {
      type: String,
      required: false,
      default: "#1eade1",
    },
    trackColor: {
      type: String,
      required: false,
      default: "#e6e6e6",
    },
    completedColor: {
      type: String,
      required: false,
    },
    completedLabel: {
      type: String,
      required: false,
    },
    showPercentage: {
      type: Boolean,
      required: false,
      default: false,
    },
    animated: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  computed: {
    radius() {
      return this.size / 2 - this.thickness
    },
    circumference() {
      return this.radius * 2 * Math.PI
    },
    dashOffset() {
      return this.circumference - this.value * this.circumference
    },
    percentageLabel() {
      return (this.value * 100).toFixed(0) + "%"
    },
  },
}
</script>

<style lang="scss" scoped>
.circular-progress-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.circular-progress-bar {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;

  &.animated {
    transition: stroke-dashoffset 0.35s;
  }
}

.circular-progress-label {
  margin-left: 10px;
}
</style>
