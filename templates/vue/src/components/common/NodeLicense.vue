<template>
  <section v-if="node.license">
    <h2 class="content-header">License</h2>
    <p class="content-body" style="margin-bottom: 0.5em;">
      <a
        v-if="license.type === licenseTypes.CUSTOM && license.link"
        :href="license.link"
        target="_blank"
      >
        <span style="margin-right: 4px;" class="license-link">
          {{ license.name }}
        </span>
        <tapestry-icon icon="external-link-alt" />
      </a>
      <span v-else class="license-link">
        <span v-if="node.license.type !== licenseTypes.CUSTOM">
          <i v-for="icon in license.icons" :key="icon" :class="icon"></i>
        </span>
        {{ license.name }}
      </span>
    </p>
    <div
      v-if="license.type === licenseTypes.CUSTOM && license.description"
      class="content-body"
      v-html="license.description"
    ></div>
  </section>
</template>

<script>
import TapestryIcon from "@/components/common/TapestryIcon"
import { licenseTypes, licenses } from "@/utils/constants"

export default {
  name: "node-license",
  components: {
    TapestryIcon,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      licenseTypes,
    }
  },
  computed: {
    license() {
      return {
        ...this.node.license,
        ...licenses[this.node.license.type],
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.content-header {
  margin: 1em -1em 0.2em;
  position: relative;
  border-bottom: solid 2px #6b747d;
  padding: 0.2em 1em;
  font-size: 1.75em;
}

.content-body {
  display: block;
  text-align: left;
  color: #becddc;

  a {
    color: #becddc;
    text-decoration: underline;
    &:hover {
      color: #fff;
    }
  }

  .license-link {
    color: white;
    text-transform: capitalize;
    font-weight: 600;
    i {
      margin-right: 4px;
    }
  }
}
</style>
