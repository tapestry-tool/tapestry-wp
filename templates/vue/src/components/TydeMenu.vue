<template>
  <div id="tyde-menu">
    <div class="buttons">
      <TydeButton icon="cog"></TydeButton>
      <TydeButton icon="globe-asia"></TydeButton>
      <TydeButton icon="question"></TydeButton>
    </div>
    <div class="content">
      <h1>Captain's Log</h1>
      <p>I'm the TYDE menu.</p>
    </div>
  </div>
</template>

<script>
import TydeButton from './TydeButton'

export default {
  name: 'tyde-menu',
  components: {
    TydeButton,
  },
  data() {
    return {
      activeTabIndex: 3,
      tabs: [
        'activities',
        'content',
        'favourites',
        'all',
      ]
    }
  },
}
</script>

<style scoped>
#tyde-menu {
  width: 100vw;
  height: 100vh;
  position: fixed;
  text-align: left;
  top: 0;
  left: 0;
  background: black;
  color: white;
  z-index: 10;
  padding: 16px 80px;
}

.buttons {
  width: 100%;
  display: flex;
  margin-bottom: 16px;
}

.content {
  background: var(--gray);
  border: 3px solid white;
}
</style>
