<template>
  <div class="container">
    <div
      class="circle"
      :style="{
        'background-image': 'url(' + bucketItem.imageurl + ')',
        'background-color': bucketItem.color,
      }"
    ></div>
    <b style="">{{ bucketItem.text }}</b>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    node: {
      type: Object,
      required: true,
    },
    bucketItem: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {}
  },
  computed: {
    bucketClass() {
      if (this.isFromBucket) {
        return "fromBucketContainer"
      } else {
        return "toBucketContainer"
      }
    },
  },
  methods: {},
}
</script>

<style scoped>
.circle {
  border-radius: 100%;
  height: 200px;
  border: solid;
  margin-top: 0px;
  margin-bottom: 0px;
  background-size: 300px 200px;
  background-repeat: no-repeat;
  text-align: center;
}
.container {
  margin-top: 30px;
  margin-bottom: 30px;
}
</style>
