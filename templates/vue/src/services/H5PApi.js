import axios from "axios"
import Helpers from "@/utils/Helpers"

import { data } from "./wp"

async function getAllContent() {
  const url = `${data.apiUrl}/h5p`
  const response = await axios.get(url)
  return parse(response.data)
}

export default {
  getAllContent,
}

function parse(response) {
  if (response && response.length) {
    return response.map(({ id, title }) => {
      return {
        id,
        title: Helpers.decodeHTMLChars(title),
      }
    })
  }
  return []
}
