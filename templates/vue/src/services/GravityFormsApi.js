import axios from "axios"

const API_URL = wpData.gf_rest_url

const makeUrl = path => `${API_URL}${path}?_gf_json_nonce=${wpData.gf_nonce}`

const request = (method, endpoint) => {
  return axios
    .request({ url: makeUrl(endpoint), method })
    .then(response => response.data)
    .then(({ status, response }) =>
      status >= 400 ? Promise.reject(response) : response
    )
}

/**
 * Get entries for a given `formId`
 * @param {string | number} formId
 */
const getEntries = async formId => {
  if (formId && formId.length) {
    const response = await request("GET", `/forms/${formId}/entries`)
    return response.entries || []
  }
  return []
}

const getLatestEntry = async formId => {
  const entries = await getEntries(formId)
  if (entries && entries.length) {
    let latest = entries[0]
    for (const entry of entries) {
      const dateUpdated = new Date(entry.date_updated)
      if (dateUpdated > new Date(latest.date_updated)) {
        latest = entry
      }
    }
    return latest
  }
  return null
}

const getAllEntries = async nodes => {
  const nodesWithQuestions = nodes.filter(node => node.quiz && node.quiz.length > 0)
  const populatedNodes = await Promise.all(
    nodesWithQuestions.map(async node => {
      const populatedQuestions = await Promise.all(
        node.quiz.map(async question => {
          const { checklistId, textId } = question.answers
          const checklistAnswer = await getLatestEntry(checklistId)
          const textAnswer = await getLatestEntry(textId)
          return {
            id: question.id,
            answers: {
              text: textAnswer ? textAnswer[1] : null,
              checklist: checklistAnswer
                ? parseChecklistAnswers(checklistAnswer)
                : null,
            },
          }
        })
      )
      return { id: node.id, quiz: populatedQuestions }
    })
  )
  const nodeQuizMap = {}
  populatedNodes.forEach(node => {
    nodeQuizMap[node.id] = node.quiz
  })
  return nodeQuizMap
}

const parseChecklistAnswers = answers => {
  const inputId = "1"
  const keys = Object.keys(answers).filter(key => key.startsWith(inputId))
  return keys.map(key => answers[key]).filter(answer => answer.length > 0)
}

export default {
  getEntries,
  getAllEntries,
}
