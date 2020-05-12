import axios from "axios"
import { LINK_PREVIEW_API_KEY } from "../../config"
import Helpers from "../utils/Helpers"

const API_URL = `${location.protocol}//api.linkpreview.net`

export async function getLinkMetadata(url) {
  const endpoint = `${API_URL}/?key=${LINK_PREVIEW_API_KEY}&q=${Helpers.normalizeUrl(
    url
  )}`
  try {
    const { data } = await axios.get(endpoint)
    return { data }
  } catch (Error) {
    console.error("Link preview could not be retrieved", Error)
    return []
  }
}
