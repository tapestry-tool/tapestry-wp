<template>
  <button @click="$emit('click', $event)">
    <slot></slot>
  </button>
</template>

<style scoped>
button {
  --size: 5rem;

  width: var(--size);
  height: var(--size);
  background: var(--cos-color-tertiary);
  position: absolute;
  top: calc(-1 * var(--size));
  border-top-left-radius: var(--size);
  border-top-right-radius: var(--size);
  font-size: 2.5rem;
  transform: translateY(20%);
  z-index: 0;
}
</style>
