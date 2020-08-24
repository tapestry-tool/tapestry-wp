import axios from "axios"

const BASE_URL = `${apiUrl}/gf`

async function exists() {
  const url = `${BASE_URL}/exists`
  const response = await axios.get(url)
  return response.data
}

async function getAllForms() {
  const url = `${BASE_URL}/forms`
  const response = await axios.get(url)
  return response.data.map(form => ({ id: String(form.id), title: form.title }))
}

async function getFormHtml(id) {
  const url = `${adminAjaxUrl}?action=gf_button_get_form&form_id=${id}`
  const response = await axios.get(url)
  return response.data
}

async function getFormEntry(id) {
  const url = `${BASE_URL}/entries?form_id=${id}`
  const response = await axios.get(url)
  return response.data && response.data[0]
}

export default {
  exists,
  getAllForms,
  getFormHtml,
  getFormEntry,
}
