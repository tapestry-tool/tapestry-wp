import axios from "axios"

const API_URL = `${wpData.rest_url}/h5p/v1`

async function getAllContent() {
  const url = `${API_URL}/all`
  const response = await axios.get(url)
  return response.data.map(h5p => {
    const title = getTitleFromH5P(h5p)
    return {
      title,
      ...h5p,
    }
  })
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

/* Helpers */

function getTitleFromH5P({ id, url }) {
  const fileName = url.split("exports/")[1]
  const rawTitle = fileName.split(`-${id}.h5p`)[0]

  let title = ""
  let wasSymbol = false
  for (const word of rawTitle.split("-")) {
    const charCode = parseInt(word)
    if (isNaN(charCode)) {
      title += title.length > 0 && !wasSymbol ? " " + word : word
      wasSymbol = false
    } else {
      const char = String.fromCharCode(charCode)
      title += char
      wasSymbol = true
    }
  }
  return title
}
