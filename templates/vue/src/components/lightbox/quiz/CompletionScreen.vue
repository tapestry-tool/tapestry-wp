<template>
  <div>
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
