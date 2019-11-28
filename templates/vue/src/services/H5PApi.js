import axios from "axios"

const API_URL = `${wpData.rest_url}/h5p/v1`

async function getAllContent() {
  const url = `${API_URL}/all`
  const response = await axios.get(url)
  return response.data
}

async function getContentInThisPost() {
  const url = `${API_URL}/post/${wpPostId}`
  const response = await axios.get(url)
  return response.data
}

export default {
  getAllContent,
  getContentInThisPost,
}
