<template>
  <div id="tyde-menu">
    <div class="buttons">
      <TydeButton @click="setActivePage('settings')" icon="cog"></TydeButton>
      <TydeButton @click="$emit('return-to-map')" icon="globe-asia"></TydeButton>
      <TydeButton @click="setActivePage('help')" icon="question"></TydeButton>
    </div>
    <div class="content">
      <h1 class="title">Captain's Log</h1>
      <TydeMenuHome v-if="activePage === 'home'" :logs="logs" />
      <TydeMenuSettings @back="setActivePage('home')" v-if="activePage === 'settings'" />
      <TydeMenuHelp @back="setActivePage('home')" v-if="activePage === 'help'" />
    </div>
    <div class="continue">
      <TydeButton @click="$emit('continue')" icon="arrow-right" class="button-continue"></TydeButton>
    </div>
  </div>
</template>

<script>
import TydeButton from './TydeButton'
import TydeMenuHome from './TydeMenuHome'
import TydeMenuSettings from './TydeMenuSettings'
import TydeMenuHelp from './TydeMenuHelp'

export default {
  name: 'tyde-menu',
  props: {
    logs: {
      type: Array,
      required: false,
      default: [],
    },
  },
  components: {
    TydeButton,
    TydeMenuHome,
    TydeMenuSettings,
    TydeMenuHelp,
  },
  data() {
    return {
      activePage: 'home',
    }
  },
  methods: {
    setActivePage(page) {
      this.activePage = page
    },
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

.button-continue {
  width: 96px;
  height: 96px;
  font-size: 56px;
}

.continue {
  position: fixed;
  bottom: 2em;
  right: 2em;
  z-index: 20;
}

.content {
  background: var(--gray);
  border: 4px solid white;
  min-height: 100%;
  padding: 32px 64px;
  position: relative;
  z-index: 0;
}

.title {
  position: absolute;
  right: 1.5em;
  top: -74px;
  padding: 16px 3em;
  line-height: 1;
  margin: 0;
  font-weight: 900;
  font-size: 40px;
  text-transform: uppercase;
  z-index: 10;
}

.title:before {
  display: none;
}

.title:after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 16px 3em;
  background: var(--gray);
  border: 4px solid white;
  border-bottom: 4px solid var(--gray);
  transform: perspective(10px) rotateX(1deg);
  z-index: -1;
}
</style>
