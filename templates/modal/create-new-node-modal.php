<!-- Modal -->
<div class="modal fade" id="createNewNodeModal" tabindex="-1" role="dialog" aria-labelledby="createNewNodeModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="createNewNodeModalLabel"></h4>
            </div>
            <div class="modal-body" id="createNewNodeModalBody">
                <div id="add-node-error-msg"></div>
                <form class="form-container">
                    <label>Title
                        <input name="title" type="text" placeholder="Enter the topic title" required >
                    </label>
                    <label>Thumbnail
                        <input name="imageURL" type="url" placeholder="Enter the URL for the thumbnail" required>
                    </label>
                    <label>Media Type
                        <div class="dropdown">
                        <select id="mediaType" name="mediaType">
                            <option value="default">Select type:</option>
                            <option value="video">Video</option>
                            <!--<option value="image">image</option>-->
                        </select>
                        </div>
                    </label>
                    <label>Media Format
                        <div class="dropdown">
                        <select id="mediaFormat" name="mediaFormat">
                            <option value="default">Select format:</option>
                            <option value="mp4">MP4</option>
                            <option value="h5p">H5P</option>
                            <!--<option value="jpeg">JPEG</option>-->
                        </select>
                        </div>
                    </label>
                    <div id="contents-details" class="content-details" style="display: none">
                        <h3>Content Details</h3>
                        <div id="mp4-content" class="mp4-content">
                        <label>Video URL
                            <input name="mp4-mediaURL" type="url" placeholder="Enter URL for MP4 Video" >
                        </label>
                        <label>Video Duration
                            <input name="mp4-mediaDuration" type="text" placeholder="Enter duration (in seconds)" >
                        </label>
                        </div>
                        <div id="h5p-content" class="h5p-content">
                        <label>H5P Embed Link
                            <input name="h5p-mediaURL" type="url" placeholder="Enter H5P Embed Link" >
                        </label>
                        <label>H5P Content Duration
                            <input name="h5p-mediaDuration" type="text" placeholder="Enter duration (in seconds)" >
                        </label>
                        </div>
                        <div id="appearsat-section">
                        <label>Appears at:
                            <input name="appearsAt" type="text" placeholder="Enter time (in seconds) the media gets unlocked" >
                        </label>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn" data-dismiss="modal" id="cancel-add-new-node">Close</button>
                <button type="button" class="btn" id="submit-add-new-node">Submit</button>
                <button type="button" class="btn" id="submit-add-root-node">Submit</button>
            </div>
        </div>
    </div>
</div>
