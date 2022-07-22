<template>
  <div data-qa="open-minimap" class="minimap-button">
    <button @click="$emit('click')">
      <i class="fas fa-map"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: "tapestry-minimap-button",
}
</script>

<style lang="scss" scoped>
.minimap-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  background: var(--bg-color-secondary);
  box-shadow: 0 0 7px 0 var(--bg-color-primary);
  border-radius: 8px;

  button {
    color: var(--text-color-tertiary);
    padding: 0;
    background: none;
    width: 100%;
    height: 100%;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--highlight-color);
    }
  }
}
</style>
