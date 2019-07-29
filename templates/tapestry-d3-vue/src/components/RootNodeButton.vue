<template>
  <div id="root-node-container">
    <div id="root-node-btn">
      <i class="fas fa-plus-circle fa-5x"></i>
      <div id="root-node-label">Add Root Node</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'root-node-button',
  data() {
    return {}
  }
}
</script>

<style scoped>
#root-node-btn {
    margin-top: 20vh;
    text-align: center;
    cursor: pointer;
}

#root-node-label {
    text-align: center; 
    font-size: 1.5em;
    padding-top: 10px;
}

#root-node-btn:hover,
#root-node-btn:active {
    transform: scale(1.1);
    color: #11a6d8;
}

</style>

