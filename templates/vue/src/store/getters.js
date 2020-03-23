export function getActivities(state) {
  return (options = {}) => {
    const { exclude = [] } = options
    return state.nodes
      .filter(node => !exclude.includes(node.id) && Boolean(node.quiz))
      .flatMap(node => node.quiz)
  }
}

export function getQuestion(state) {
  return id => {
    const node = state.nodes
      .filter(node => node.quiz)
      .find(node => node.quiz.find(q => q.id == id))
    if (node) {
      return node.quiz.find(q => q.id == id)
    }
    return null
  }
}

export function getEntry(_, { getNode }) {
  return (nodeId, questionId, answerType) => {
    const node = getNode(nodeId)
    if (!node || !node.quiz) {
      return null
    }
    const question = node.quiz.find(q => q.id === questionId)
    if (!question) {
      return null
    }
    const entry = question.entries[answerType]
    if (!entry) {
      return null
    }
    /* If the answer is an audio, then entry is just the audio id. */
    if (answerType === "audioId") {
      return { type: "audio", entry }
    }

    const answers = getAnswersFromEntry(entry)
    return formatEntry(answers, answerType)
  }
}

/* An answer is a value where its key is numeric */
function getAnswersFromEntry(entry) {
  return Object.entries(entry)
    .filter(obj => !isNaN(parseInt(obj[0], 10)))
    .map(i => i[1])
}

function formatEntry(answers, answerType) {
  if (answerType === "textId") {
    return {
      type: "text",
      entry: `<div>${answers[0].replace(/(?:\r\n|\r|\n)/g, "<br>")}</div>`,
    }
  }
  const ul = document.createElement("ul")
  answers.forEach(answer => {
    const li = document.createElement("li")
    li.innerText = answer
    ul.appendChild(li)
  })
  return { type: "checklist", entry: ul.outerHTML }
}
