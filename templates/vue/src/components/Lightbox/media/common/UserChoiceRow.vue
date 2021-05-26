<template >
<div>
    <b-form-checkbox v-if="isCheckBox" :value="item.value" :data-qa="`user-choicerow-checkbox-checked-${item.id}`">
        <b-img v-if="hasImage" :src="item.imageurl" class="imageChoice"
        :data-qa="`user-choicerow-checkbox-thumbnail-${item.id}`"></b-img>
        {{item.value}}
    </b-form-checkbox>
   <b-form-radio v-else-if="!isCheckBox" :value="item.value"
   :data-qa="`user-choicerow-radio-checked-${item.id}`">
       <b-img v-if="hasImage" :src="item.imageurl" class="imageChoice"
       :data-qa="`user-choicerow-radio-thumbnail-${item.id}`"></b-img>
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
    height: 90px;
}

</style>