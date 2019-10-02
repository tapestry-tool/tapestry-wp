<template>
  <div>
    <div id="spotlight-overlay"></div>
    <div id="spotlight-content">
      <button id='lightbox-close-wrapper'>
        <div class='lightbox-close'>
          <i class='fa fa-times'></i>
        </div>
      </button>
      <div class="media-wrapper">
        <LightboxMedia />
      </div>
    </div>
  </div>
</template>

<script>
import LightboxMedia from './LightboxMedia'

export default {
  name: 'lightbox',
  components: {
    LightboxMedia,
  },
}
</script>

<style scoped>

</style>
