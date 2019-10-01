<template>
  <div id="tyde-menu">
    <div class="buttons">
      <TydeButton icon="cog"></TydeButton>
      <TydeButton icon="globe-asia"></TydeButton>
      <TydeButton icon="question"></TydeButton>
    </div>
    <div class="content">
      <h1 class="title">Captain's Log</h1>
      <nav>
        <ul class="tabs">
          <TydeTab @click="setActiveTab" v-for="tab in tabs" :key="tab" :isActive="tab === activeTab" :tab="tab"/>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import TydeButton from './TydeButton'
import TydeTab from './TydeTab'

export default {
  name: 'tyde-menu',
  components: {
    TydeButton,
    TydeTab,
  },
  data() {
    return {
      activeTab: 'all',
      tabs: [
        'activities',
        'content',
        'favourites',
        'all',
      ]
    }
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab
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

.content {
  background: var(--gray);
  border: 3px solid white;
  min-height: 100%;
  padding: 32px 64px;
  position: relative;
  z-index: 0;
}

.tabs {
  display: flex;
  font-size: 24px;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  padding: 0;
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
  border: 3px solid white;
  border-bottom: 3px solid var(--gray);
  transform: perspective(10px) rotateX(1deg);
  z-index: -1;
}
</style>
