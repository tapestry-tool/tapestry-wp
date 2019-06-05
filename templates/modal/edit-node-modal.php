<!-- Modal -->
<div class="modal fade" id="editNodeModal" tabindex="-1" role="dialog" aria-labelledby="editNodeModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
        <div class="modal-header">
            <h4 class="modal-title" id="editNodeModalLabel"></h4>
        </div>
        <div class="modal-body" id="editNodeModalBody">
            <form class="form-container">
                <label>Title
                    <input name="title" type="text" placeholder="Enter the topic title" required >
                </label>
                <label>Thumbnail
                    <input name="imageURL" type="url" placeholder="Enter the URL for the thumbnail" required>
                </label>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal" id="cancel-edit-node">Close</button>
            <button type="button" class="btn btn-primary" id="submit-edit-node">Submit</button>
        </div>
    </div>
    </div>
</div>