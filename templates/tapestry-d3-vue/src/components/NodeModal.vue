<template>
  <div id="node-modal-container">
    <div
      class="modal fade"
      id="createNewNodeModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="createNewNodeModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title" id="createNewNodeModalLabel"></h4>
          </div>
          <div class="modal-body" id="createNewNodeModalBody">
            <div id="add-node-error-msg"></div>
            <form class="form-container">
              <div>
                <label>
                  Title
                  <input
                    id="add-node-title-input"
                    name="title"
                    type="text"
                    placeholder="Enter the topic title"
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Thumbnail
                  <input
                    id="add-node-thumbnail-input"
                    name="imageURL"
                    type="url"
                    placeholder="Enter the URL for the thumbnail"
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Media Type
                  <div class="dropdown">
                    <select id="mediaType" name="mediaType" v-model="selectedMediaType">
                      <option value>Select type:</option>
                      <option value="video" selected>Video</option>
                      <!--<option value="image">image</option>-->
                  </select>
                  </div>
                </label>
              </div>
              <div v-show="selectedMediaType">
                <label>
                  Media Format
                  <div class="dropdown">
                    <select id="mediaFormat" name="mediaFormat" v-model="selectedMediaFormat">
                      <option value>Select format:</option>
                      <option value="mp4">MP4</option>
                      <option value="h5p">H5P</option>
                    </select>
                  </div>
                </label>
              </div>
              <div
                id="contents-details"
                class="content-details"
                style="display: none"
                v-show="selectedMediaType && selectedMediaFormat"
              >
                <h3>Content Details</h3>
                <div
                  id="mp4-content"
                  class="mp4-content"
                  v-show="selectedMediaFormat == 'mp4'"
                >
                  <label>
                    Video URL
                    <input
                      id="mp4-mediaURL-input"
                      name="mp4-mediaURL"
                      type="url"
                      placeholder="Enter URL for MP4 Video"
                    />
                  </label>
                  <label>
                    Video Duration
                    <input
                      id="mp4-mediaDuration-input"
                      name="mp4-mediaDuration"
                      type="text"
                      placeholder="Enter duration (in seconds)"
                    />
                  </label>
                </div>
                <div
                  id="h5p-content"
                  class="h5p-content"
                  v-show="selectedMediaFormat == 'h5p'"
                >
                  <label>
                    H5P Embed Link
                    <input
                      id="h5p-mediaURL-input"
                      name="h5p-mediaURL"
                      type="url"
                      placeholder="Enter H5P Embed Link"
                    />
                  </label>
                  <label>
                    H5P Content Duration
                    <input
                      id="h5p-mediaDuration-input"
                      name="h5p-mediaDuration"
                      type="text"
                      placeholder="Enter duration (in seconds)"
                    />
                  </label>
                </div>
                <div
                  id="appearsat-section"
                  v-show="selectedMediaType=='video' && selectedMediaFormat"
                >
                  <label>
                    Appears at:
                    <input
                      id="appears-at"
                      name="appearsAt"
                      type="text"
                      placeholder="Enter time (in seconds) the media gets unlocked"
                    />
                  </label>
                </div>
              </div>
              <div id="permissions-details">
                <table id="permissions-table">
                  <tr>
                    <td>Permissions</td>
                    <td>read</td>
                    <td>add</td>
                    <td>edit</td>
                    <td>add-submit</td>
                    <td>edit-submit</td>
                    <td>approve</td>
                  </tr>
                  <tr>
                    <td>Public</td>
                    <td>
                      <input
                        class="public-checkbox"
                        id="public-read-checkbox"
                        name="read"
                        type="checkbox"
                        checked
                      />
                    </td>
                    <td>
                      <input
                        class="public-checkbox"
                        id="public-add-checkbox"
                        name="add"
                        type="checkbox"
                      />
                    </td>
                    <td>
                      <input
                        class="public-checkbox"
                        id="public-edit-checkbox"
                        name="edit"
                        type="checkbox"
                      />
                    </td>
                    <td>
                      <input
                        class="public-checkbox"
                        id="public-add-submit-checkbox"
                        name="add_submit"
                        type="checkbox"
                      />
                    </td>
                    <td>
                      <input
                        class="public-checkbox"
                        id="public-edit-submit-checkbox"
                        name="edit_submit"
                        type="checkbox"
                      />
                    </td>
                    <td>
                      <input
                        class="public-checkbox"
                        id="public-approve-checkbox"
                        name="approve"
                        type="checkbox"
                      />
                    </td>
                  </tr>
                </table>
                <div class="permissions-btn-panel">
                  <input id="user-number-input" type="number" placeholder="123" />
                  <button type="button" id="user-permissions-btn">
                    <span class="fas fa-plus permissions-plus"></span>User
                  </button>
                  <!-- <input id="group-number-input" type="number" placeholder="123" >
                  <button type="button" id="group-permissions-btn"><span class="fas fa-plus permissions-plus"></span>Group</button>-->
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn" data-dismiss="modal" id="cancel-add-new-node">Close</button>
            <button
              type="button"
              class="btn"
              id="submit-add-new-node"
              @click="submitAddNewNode"
            >Submit</button>
            <button
              type="button"
              class="btn"
              id="submit-add-root-node"
              @click="submitAddRootNode"
            >Submit</button>
            <button type="button" class="btn" id="submit-edit-node" @click="submitEditNode">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helpers from "../utils/Helpers"
import TapestryAPI from "../services/TapestryAPI"

export default {
  name: "node-modal",
  data() {
    return {
      selectedMediaFormat: "",
      selectedMediaType: ""
    }
  },
  props: {
    tapestry: {
      type: Object,
      required: true
    }
  },
  methods: {
    submitAddNewNode() {
      const formData = $("form").serializeArray();
      this.$parent.$emit("tapestryAddNewNode", formData, false);
    },
    submitAddRootNode() {
      const formData = $("form").serializeArray();
      this.$parent.$emit("tapestryAddNewNode", formData, false, true);
    },
    submitEditNode() {
      const formData = $("form").serializeArray();
      this.$parent.$emit("tapestryAddNewNode", formData, true);
    }
  }
}
</script>

<style scoped>
#createNewNodeModalBody {
  text-align: left;
}

#createNewNodeModalBody label {
  display: block;
}

#contents-details > #appearsat-section {
  border: 1px solid #eee;
  border-top: none;
  margin-bottom: 20px;
}

#permissions-details {
  margin-top: 20px;
}

#mp4-content,
#h5p-content {
  position: relative;
  background: #fefefe;
  border: 1px solid #eee;
  border-bottom: none;
  box-sizing: border-box;
}
</style>
