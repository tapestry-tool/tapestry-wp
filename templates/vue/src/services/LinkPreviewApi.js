import axios from "axios"
import { LINK_PREVIEW_API_KEY } from "../../config"
import Helpers from "../utils/Helpers"

const API_URL = `http://api.linkpreview.net`

export async function getLinkMetadata(url) {
  const endpoint = `${API_URL}/?key=${LINK_PREVIEW_API_KEY}&q=${Helpers.normalizeUrl(
    url
  )}`
  const { data } = await axios.get(endpoint)
  return { data }
}
