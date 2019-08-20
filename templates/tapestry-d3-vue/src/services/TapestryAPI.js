import axios from 'axios'

export default class {
    /**
     * 
     * @param {Number} postId 
     */
    constructor(postId) {
        this.postId = postId
    }

    /**
     * Get the tapestry
     * 
     * @return  {Object}
     */
    async getTapestry() {
        try {
            const url = `${apiUrl}/tapestries/${this.postId}`;
            const response = await axios.get(url);
            return response.data;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Add node
     * 
     * @param   {Object}    node
     * 
     * @return  {Object}
     */
    async addNode(node) {
        try {
            const url = `${apiUrl}/tapestries/${this.postId}/nodes`;
            const response = await axios.post(url, node);
            return response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Add link
     * 
     * @param   {Object}    link
     * 
     * @return  {Object}
     */
    async addLink(link) {
        try {
            const url = `${apiUrl}/tapestries/${this.postId}/links`;
            const response = await axios.post(url, link);
            return response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Add permissions
     * 
     * @param   {Number}    nodeMetaId
     * @param   {Object}    permissions
     * 
     * @return  {Object}
     */
    async updatePermissions(nodeMetaId, permissions) {
        try {
            const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}/permissions`;
            const response = await axios.put(url, permissions);
            return response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Update node
     * 
     * @param   {Number}    nodeMetaId
     * @param   {Object}    node
     * 
     * @return  {Object}
     */
    async updateNode(nodeMetaId, node) {
        try {
            const url = `${apiUrl}/tapestries/${this.postId}/nodes/${nodeMetaId}`;
            const response = await axios.put(url, node);
            return response;
        } catch (e) {
            throw e;
        }
    }

        /**
     * Update User's Tapestry Setting
     * 
     * @param   {Object}    tapestrySettingsObj
     * 
     * @return  {Object}
     */
    async updateUserTapestrySetting(tapestrySettingsObj) {
        try {
            const url = `${apiUrl}/users/settings/${this.postId}`;
            const response = await axios.put(url, tapestrySettingsObj);
            return response;
        } catch (e) {
            throw e;
        }
    }
}
