<template>
  <div class="completion-screen">
    <header>
      <h1>Thanks!</h1>
      <p>Your response has been recorded.</p>
    </header>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "completion-screen",
}
</script>

<style lang="scss" scoped>
.completion-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
</style>
