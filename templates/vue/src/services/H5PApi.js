import axios from "axios"

async function getAllContent() {
  const url = `${apiUrl}/h5p`
  const response = await axios.get(url)
  return response.data
}

export default {
  getAllContent,
}
