<template>
  <div
    class="container"
    draggable="true"
    @dragstart="dragStart($event, bucketItem, parentBucket, isFromBucketItem)"
  >
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
      default() {
        return {
          id: 1,
          color: "#808080",
          imageurl: "",
          text: "",
          useImage: false,
          useText: false,
        }
      },
    },
    parentBucket: {
      type: Object,
      required: false,
    },
    isFromBucketItem: {
      type: Boolean,
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
  methods: {
    dragStart: function(e, item, parentBucket, isFromBucketItem) {
      e.dataTransfer.dropEffect = "move"
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("itemId", item.id)
      e.dataTransfer.setData("parentBucketId", parentBucket.id)
      e.dataTransfer.setData("isFromBucketItem", isFromBucketItem)
      console.log(item)
      console.log(parentBucket)
      console.log(isFromBucketItem)
    },
  },
}
</script>

<style scoped>
.circle {
  border-radius: 100%;
  height: 200px;
  width: 200px;
  border: solid;
  margin-top: 0px;
  margin-bottom: 0px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  text-align: center;
  margin: auto;
}
.container {
  margin-top: 30px;
  margin-bottom: 30px;
  cursor: pointer;
}
</style>
