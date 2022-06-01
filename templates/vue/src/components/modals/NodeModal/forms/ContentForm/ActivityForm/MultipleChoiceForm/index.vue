<template>
  <div>
    <b-form-group class="mt-3">
      <b-form-checkbox
        v-model="allowSelectMultiple"
        data-qa="question-answer-multipleChoice-multipleAnswer"
      >
        Allow selecting multiple answers
      </b-form-checkbox>
    </b-form-group>
    <b-form-group class="mt-2">
      <b-form-checkbox v-model="useImages" data-qa="multiple-choice-thumbnail">
        Use Images
      </b-form-checkbox>
    </b-form-group>
    <b-form-group>
      <sortable-list
        v-model="choices"
        lock-axis="y"
        :use-drag-handle="true"
        @input="updateChoicesOrdering"
      >
        <b-form-checkbox-group v-model="preSelectedOptions">
          <choice-row
            v-for="(choice, index) in choices"
            :key="choice.id"
            :ref="`choice-row-${choice.id}`"
            :data-qa="`choice-row-${index}`"
            class="choice-row mt-2"
            :index="index"
            :value="choice"
            :use-image="useImages"
            :is-disabled="
              !allowSelectMultiple &&
                preSelectedOptions.length > 0 &&
                preSelectedOptions[0] != choice.id
            "
            :is-removable="choices.length > 2"
            @input="choices[index] = $event"
            @remove="removeChoice(index, choice)"
            @add="addChoice"
          ></choice-row>
        </b-form-checkbox-group>
      </sortable-list>
      <b-container class="after-choices mt-2">
        <b-button
          class="add-button"
          data-qa="add-choice-button"
          variant="primary"
          @click="addChoice"
        >
          + Add choice
        </b-button>
        <p class="tick-instructions text-muted">
          &nbsp;Select choices that should be selected by default when posing this
          question.
        </p>
      </b-container>
    </b-form-group>
  </div>
</template>

<script>
import ChoiceRow from "./ChoiceRow"
import { ContainerMixin } from "vue-slicksort"
import Helpers from "@/utils/Helpers"

const defaultChoice = {
  imageUrl: "",
  value: "",
}

const minNumOfChoices = 2

const SortableList = {
  mixins: [ContainerMixin],
  template: `
    <b-container>
      <slot />
    </b-container>
  `,
}

export default {
  components: {
    ChoiceRow,
    SortableList,
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      multipleChoice: this.value,
      allowSelectMultiple: false,
      useImages: false,
      choices: [],
      preSelectedOptions: [],
    }
  },
  watch: {
    multipleChoice: {
      handler(val) {
        this.$emit("input", val)
      },
      deep: true,
    },
    allowSelectMultiple(newAllowSelectMultiple) {
      this.multipleChoice.allowSelectMultiple = newAllowSelectMultiple
      if (!newAllowSelectMultiple && this.preSelectedOptions.length > 1) {
        this.preSelectedOptions = [this.preSelectedOptions[0]]
      }
    },
    choices(newChoices) {
      this.multipleChoice.choices = newChoices
    },
    useImages(newUseImages) {
      this.multipleChoice.useImages = newUseImages
    },
    preSelectedOptions(newPreSelectedOptions) {
      this.multipleChoice.preSelectedOptions = newPreSelectedOptions
    },
  },
  created() {
    this.allowSelectMultiple = this.multipleChoice.allowSelectMultiple
    this.choices = this.multipleChoice.choices
    while (this.choices.length < minNumOfChoices) {
      this.addChoice()
    }
    this.useImages = this.multipleChoice.useImages
    this.preSelectedOptions = this.multipleChoice.preSelectedOptions
  },
  methods: {
    addChoice: function() {
      const choiceId = Helpers.createUUID()
      this.choices.push({
        ...Helpers.deepCopy(defaultChoice),
        id: choiceId,
      })
      // TODO: Fix this as this line doesn't seem to work
      this.$nextTick(() => this.$refs["choice-row-" + choiceId][0].$el.focus())
    },
    removeChoice: function(index, item) {
      this.multipleChoice.choices.splice(index, 1)
      for (let i = 0; i < this.preSelectedOptions.length; i++) {
        if (item.id === this.preSelectedOptions[i]) {
          this.preSelectedOptions.splice(i, 1)
        }
      }
    },
    updateChoicesOrdering(arr) {
      this.multipleChoice.choices = arr
    },
  },
}
</script>

<style lang="scss">
ul.list {
  margin-bottom: 0;
}
</style>
<style lang="scss" scoped>
.after-choices {
  padding-left: 30px;
  padding-right: 0;

  .add-button {
    float: right;
  }
  .tick-instructions {
    margin-left: 17px;

    &::before {
      font-weight: bold;
      content: "↑ ";
    }
  }
}
</style>
