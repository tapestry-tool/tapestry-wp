<template>
  <div id="modal-spaceship-icons">
    <h6 class="mb-3 text-muted">Planet View Icon</h6>
    <b-form-group label="Not earned">
      <file-upload
        input-test-id="tyde-planet-not-earned-icon"
        v-model="node.typeData.planetViewNotEarnedIconUrl"
        placeholder="Enter link (starting with http)"
      />
    </b-form-group>
    <b-form-group label="Earned">
      <file-upload
        input-test-id="tyde-planet-earned-icon"
        v-model="node.typeData.planetViewEarnedIconUrl"
        placeholder="Enter link (starting with http)"
      />
    </b-form-group>
    <h6 class="mb-3 text-muted">Spaceship Cockpit Image</h6>
    <b-form-group label="Not earned">
      <file-upload
        input-test-id="tyde-cockpit-not-earned-icon"
        v-model="node.typeData.spaceshipPartNotEarnedIconUrl"
        placeholder="Enter link (starting with http)"
      />
    </b-form-group>
    <b-form-group label="Earned">
      <file-upload
        input-test-id="tyde-cockpit-earned-icon"
        v-model="node.typeData.spaceshipPartEarnedIconUrl"
        placeholder="Enter link (starting with http)"
      />
    </b-form-group>
    <b-form-group label="Hover">
      <file-upload
        input-test-id="tyde-cockpit-hover-icon"
        v-model="node.typeData.spaceshipPartHoverIconUrl"
        placeholder="Enter link (starting with http)"
      />
    </b-form-group>
    <h6 class="mb-3 text-muted">
      Spaceship Part Coordinates and Size in Cockpit
    </h6>
    <b-row id="node-spaceship-parts" class="mb-4">
      <b-col sm="5" class="pt-2">
        Distance from upper left-hand corner:
      </b-col>
      <b-col>
        <b-input-group prepend="X: " append="%" label-for="node-spaceship-part-x">
          <b-form-input
            id="node-spaceship-part-x"
            data-qa="node-spaceship-part-x"
            v-model="node.typeData.spaceshipPartX"
            placeholder="In Percentage (top left)"
            type="number"
            min="0"
            max="100"
          />
        </b-input-group>
      </b-col>
      <b-col>
        <b-input-group prepend="Y: " append="%" label-for="node-spaceship-part-y">
          <b-form-input
            id="node-spaceship-part-y"
            data-qa="node-spaceship-part-y"
            v-model="node.typeData.spaceshipPartY"
            placeholder="In Percentage (top left)"
            type="number"
            min="0"
            max="100"
          />
        </b-input-group>
      </b-col>
    </b-row>
    <b-row id="node-spaceship-parts">
      <b-col sm="5" class="pt-2">
        Dimensions of image:
      </b-col>
      <b-col>
        <b-input-group
          prepend="Width: "
          append="%"
          label-for="node-spaceship-part-width"
        >
          <b-form-input
            id="node-spaceship-part-width"
            data-qa="node-spaceship-part-width"
            v-model="node.typeData.spaceshipPartWidth"
            placeholder="In percentage"
            type="number"
            min="0"
            max="100"
          />
        </b-input-group>
      </b-col>
      <b-col>
        <b-input-group
          prepend="Height: "
          append="%"
          label-for="node-spaceship-part-height"
        >
          <b-form-input
            id="node-spaceship-part-height"
            data-qa="node-spaceship-part-height"
            v-model="node.typeData.spaceshipPartHeight"
            placeholder="In percentage"
            type="number"
            min="0"
            max="100"
          />
        </b-input-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import FileUpload from "@/components/FileUpload"

export default {
  components: {
    FileUpload,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
}
</script>
