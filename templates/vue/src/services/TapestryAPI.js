import axios from 'axios'
import Helpers from '../utils/Helpers'

export default class {
    /**
     *
     * @param {Number} postId
     */
    constructor(postId) {
        axios.defaults.headers.common['X-WP-Nonce'] = wpData.nonce;
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

    async getNode(id) {
      try {
        const data = await this.getTapestry();
        return data.nodes[Helpers.findNodeIndex(id, data)];
      } catch (e) {
        throw e;
      }
    }

    async getNodeProgress(id) {
      try {
        const progress = await this.getUserProgress()
        return progress[id]
      } catch (e) {
        throw e
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

    async getUserProgress() {
      try {
        const url = `${apiUrl}/users/progress?post_id=${this.postId}`
        const response = await axios.get(url)
        return JSON.parse(response.data)
      } catch (e) {
        throw e
      }
    }

    async updateUserProgress(id, progressValue) {
      try {
        const url = `${apiUrl}/users/progress`
        const response = await axios.post(url, {
          post_id: this.postId,
          node_id: id,
          progress_value: progressValue
        })
        return response
      } catch (e) {
        throw e
      }
    }

    async getSettings() {
      try {
        const tapestry = await this.getTapestry()
        return tapestry.settings
      } catch (e) {
        throw e
      }
    }

    async updateSettings(settings) {
      try {
        const url = `${apiUrl}/tapestries/${this.postId}/settings`
        const response = await axios.put(url, settings)
        return response
      } catch (e) {
        throw e
      }
    }

    async getH5pSettings() {
      try {
        const url = `${apiUrl}/users/h5pSettings?post_id=${this.postId}`
        const response = await axios.get(url)
        return response
      } catch (e) {
        throw e
      }
    }
}
