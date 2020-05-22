<template>
  <div class="favourite">
    <div class="button-row">
      <button class="button-row-trigger" @click="$emit('toggle')">
        <div class="button-row-icon">
          <i :class="visible ? 'fas fa-minus' : 'fas fa-plus'"></i>
        </div>
        <div>
          <p class="button-row-title">{{ node.title }}</p>
          <p class="button-row-description">{{ node.description }}</p>
        </div>
      </button>
      <a style="margin-right: 16px;" @click="$emit('unfavourite', node.id)">
        <i class="fas fa-heart fa-lg" style="color:red;"></i>
      </a>
    </div>
    <div v-if="visible" class="content">
      <tapestry-media
        v-if="node.mediaType !== 'accordion'"
        :node-id="node.id"
        :autoplay="false"
        :dimensions="dimensions"
        read-only
      />
      <accordion-media
        v-else
        read-only
        :node="node"
        :style="{
          backgroundColor: 'white',
          borderRadius: '8px',
        }"
      ></accordion-media>
    </div>
  </div>
</template>

<script>
import AccordionMedia from "@/components/lightbox/AccordionMedia"
import TapestryMedia from "@/components/TapestryMedia"

export default {
  name: "tyde-favourites-row",
  components: {
    AccordionMedia,
    TapestryMedia,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    dimensions: {
      type: Object,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.favourite {
  background-color: var(--tapestry-med-gray);
  border-radius: 16px;
  padding: 24px;
}

.button-row {
  display: flex;
  align-items: center;

  &-trigger {
    display: flex;
    align-items: center;
    background: none;
    margin: 0;
    padding: 0;
    width: 100%;
    text-align: left;
  }

  &-icon {
    background: #b29ac9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-right: 24px;
  }

  p {
    display: block;
    margin: 0;
    padding: 0;
    line-height: 1.1;
    font-size: 1.2em;
  }

  &-title {
    font-weight: bold;
  }

  &-description {
    font-weight: 400;
  }
}

.content {
  margin-top: 24px;
}
</style>
