import axios from "axios"

async function getAllForms() {
  const url = `${apiUrl}/gf/forms`
  const response = await axios.get(url)
  return response.data.map(form => ({ id: String(form.id), title: form.title }))
}

export default {
  getAllForms,
}
