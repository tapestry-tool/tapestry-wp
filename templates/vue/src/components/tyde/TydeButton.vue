<template>
  <button @click="$emit('click')" class="tyde-button">
    <i :class="iconClass"></i>
    <slot></slot>
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
  name: 'tyde-button',
  computed: {
    iconClass: function() {
      return `fas fa-${this.icon}`
    },
  }
}
</script>

<style scoped>
.tyde-button {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  border: 4px solid black;
  background: white;
  font-size: 40px;
  margin-right: 16px;
  transition: all 0.2s ease;
}

.tyde-button:last-child {
  margin-right: 0;
}

.tyde-button:before {
  content: '';
  position: absolute;
  top: -7px;
  left: -7px;
  right: -7px;
  bottom: -7px;
  background: transparent;
  border: 3px solid var(--light-gray);
  border-radius: 50%;
}

.tyde-button:focus {
  outline: none;
}

.tyde-button:hover {
  background: var(--light-blue);
  color: white;
  transform: scale(1.1);
}
</style>
