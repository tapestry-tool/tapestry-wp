<template >
<div>
    <b-form-checkbox v-if="isCheckBox" :value="item.value">
        <b-img v-if="hasImage" :src="item.imageurl" class="imageChoice"></b-img>
        {{item.value}}
    </b-form-checkbox>
   <b-form-radio v-else-if="!isCheckBox" :value="item.value">
       <b-img v-if="hasImage" :src="item.imageurl" class="imageChoice"></b-img>
       {{item.value}}
   </b-form-radio>
</div>
</template>

<script>
export default {
  name: "user-choice-row",
  props: {
    isCheckBox: {
      type: Boolean,
      required: true,
    },
    hasImage: {
      type: Boolean,
      required: true,
    }, 
    item: {
      required: true,
    },
  },
}
</script>

<style lang="scss">
.container {
  display: flex;
  //border-style:solid;
}
.imageChoice{
    height: 150px;
}

</style>