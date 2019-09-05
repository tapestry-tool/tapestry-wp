<template>
  <div id="node-modal-container">
    <!-- Modal -->
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
            <h3 class="modal-title" id="createNewNodeModalLabel"></h3>
          </div>
          <div class="modal-body" id="createNewNodeModalBody">
            <div id="add-node-error-msg"></div>
            <form class="form-container" style="margin-bottom: -18px; padding-bottom: 0;">
              <h4 style="margin-top: -1rem; margin-bottom: 2rem;">Content Details</h4>
              <label>
                Title
                <input
                  id="add-node-title-input"
                  name="title"
                  type="text"
                  placeholder="Enter title"
                  required
                />
              </label>
              <div id="tapestry-node-description-container">
                <label id="tapestry-node-description">
                  Description
                  <textarea
                    id="tapestry-node-description-area"
                    placeholder="Enter description"
                  ></textarea>
                </label>
              </div>
              <label>
                Content Type
                <div class="dropdown">
                  <select id="mediaType" name="mediaType" v-model="selectedMediaType">
                    <option value="default" selected>Select content type:</option>
                    <option value="text">Text</option>
                    <option value="video">Video</option>
                    <option value="h5p">H5P</option>
                    <!--<option value="image">image</option>-->
                  </select>
                  <input type="hidden" id="hiddenMediaType" name="mediaType" disabled="disabled" />
                </div>
              </label>
              <div id="contents-details">
                <div id="mp4-content" v-show="selectedMediaType == 'video'">
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
                <div id="h5p-content" v-show="selectedMediaType == 'h5p'">
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
                    H5P Video Duration (only if video)
                    <input
                      id="h5p-mediaDuration-input"
                      name="h5p-mediaDuration"
                      type="text"
                      placeholder="Enter duration (in seconds)"
                    />
                  </label>
                </div>
                <div id="tapestry-text-content" v-show="selectedMediaType != 'default'">
                  <label>
                    Text content
                    <textarea
                      id="tapestry-node-text-area"
                      placeholder="Enter text here"
                    ></textarea>
                  </label>
                </div>
              </div>
              <div id="appearance-details" class="lightbox-form-section">
                <h4>Appearance</h4>
                <label>
                  Thumbnail
                  <input
                    id="add-node-thumbnail-input"
                    name="imageURL"
                    type="url"
                    placeholder="Enter the URL for the thumbnail"
                  />
                </label>
                <input
                  id="tapestry-lock-node-checkbox"
                  name="locked"
                  type="checkbox"
                  required
                  v-model="lockNode"
                />
                <label id="tapestry-lock-node-label">Hide node until parent node is viewed</label>
                <div id="appearsat-section">
                  <div id="locked-container"></div>
                  <label id="appears-at-label" v-show="lockNode">
                    At which point in the video should this node appear?
                    <input
                      id="appears-at"
                      name="appearsAt"
                      type="text"
                      placeholder="Enter number of seconds"
                    />
                  </label>
                </div>
              </div>
              <div id="permissions-details" class="lightbox-form-section">
                <h4>Permissions</h4>
                <table id="permissions-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>read</th>
                      <th>add</th>
                      <th>edit</th>
                      <th>add-submit</th>
                      <th>edit-submit</th>
                      <th>approve</th>
                    </tr>
                  </thead>
                  <tbody>
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
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>
                        <input id="user-number-input" type="number" placeholder="123" />
                      </td>
                      <td colspan="6">
                        <button type="button" id="user-permissions-btn" @click="addUser">
                          <span class="fas fa-plus permissions-plus"></span>User
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn" data-dismiss="modal" id="cancel-add-new-node">Close</button>
            <button
              type="button"
              class="btn"
              id="submit-add-new-node"
              @click="submitAddNewNode()"
            >Submit</button>
            <button
              type="button"
              class="btn"
              id="submit-add-root-node"
              @click="submitAddRootNode()"
            >Submit</button>
            <button type="button" class="btn" id="submit-edit-node" @click="submitEditNode()">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helpers from "../utils/Helpers";
import TapestryAPI from "../services/TapestryAPI";

export default {
  name: "node-modal",
  data() {
    return {
      lockNode: false,
      selectedMediaType: "default"
    };
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
      this.$emit("tapestryAddNewNode", formData, false);
    },
    submitAddRootNode() {
      const formData = $("form").serializeArray();
      this.$emit("tapestryAddNewNode", formData, false, true);
    },
    submitEditNode() {
      const formData = $("form").serializeArray();
      this.$emit("tapestryAddNewNode", formData, true);
    },
    addUser() {
      const userId = $("#user-number-input").val();
      if (
        userId &&
        onlyContainsDigits(userId) &&
        $("#user-" + userId + "-editcell").val() != ""
      ) {
        appendPermissionsRow(userId, "user");
        $("#user-number-input").val("");
      } else {
        alert("Enter valid user id");
      }
    }
  }
};
</script>

<style scoped>
#createNewNodeModalBody {
  text-align: left;
}
</style>
