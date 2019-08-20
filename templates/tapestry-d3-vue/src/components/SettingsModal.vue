<template>
  <div id="settings-modal-container">
    <!-- Modal -->
    <div class="modal fade" id="tapestrySettingModal" tabindex="-1" role="dialog" aria-labelledby="tapestrySettingModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="tapestrySettingModalLabel">Tapestry Settings</h4>
            </div>
            <div class="modal-body" id="tapestrySettingModalBody">
                <form class="form-container">
                    <label>Background Image
                        <input id="tapestry-background-img-input" name="background-image" type="text" placeholder="Enter image URL" required >
                    </label>
                    <input id="tapestry-auto-layout-checkbox" type="checkbox" required>
                    <label id="tapestry-auto-layout-label">Auto Layout</label>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" id="tapestry-cancel-edit-setting">Close</button>
                <button type="button" class="btn btn-primary" id="tapestry-submit-edit-setting" @click="submitSettings()">Submit</button>
            </div>
        </div>
        </div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'settings-modal',
  data() {
    return {}
  },
  methods: {
    submitSettings() {
        let tapestrySettingsObj = {};
        if ($("#tapestry-background-img-input").val()) {
            tapestrySettingsObj.background = $("#tapestry-background-img-input").val();
        }

        if($("#tapestry-auto-layout-checkbox").is(":checked")) {
            tapestrySettingsObj.autolayout = true;
        } else {
            tapestrySettingsObj.autolayout = false;
        }
        this.$emit("tapestrySubmitSettings", tapestrySettingsObj);

    }
  }
}
</script>