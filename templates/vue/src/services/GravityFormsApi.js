import axios from "axios"

async function getAllForms() {
  const url = `${apiUrl}/gf/forms`
  const response = await axios.get(url)
  return response.data.map(form => ({ id: String(form.id), title: form.title }))
}

async function getFormHtml(id) {
  const url = `${adminAjaxUrl}?action=gf_button_get_form&form_id=${id}`
  const response = await axios.get(url)
  return response.data
}

export default {
  getAllForms,
  getFormHtml,
}
