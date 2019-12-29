export function logs(state) {
  const mapIdToKey = {
    textId: "text",
    checklistId: "checklist",
    audioId: "audio",
  }
  const contents = state.nodes
    .filter(node => node.completed)
    .map(node => ({
      type: "content",
      imageURL: node.imageURL,
      title: node.title,
      description: node.description,
      nodeId: node.id,
    }))

  const activities = []
  const nodesWithQuestions = state.nodes.filter(
    node =>
      node.quiz &&
      node.quiz.some(
        question => question.entries && Object.keys(question.entries).length > 0
      )
  )
  nodesWithQuestions.forEach(node => {
    node.quiz.forEach(question => {
      Object.entries(question.entries).forEach(([answerType, entry]) => {
        activities.push({
          type: "activity",
          title: question.text,
          nodeId: node.id,
          [mapIdToKey[answerType]]: getAnswer(answerType, entry),
        })
      })
    })
  })

  return contents.concat(activities)
}

const getAnswer = (answerType, entry) => {
  const types = {
    textId: parseText,
    checklistId: parseChecklist,
    audioId: parseAudio,
  }
  return types[answerType](entry)
}

const parseText = entry => {
  const text = entry[1]
  return text ? `<div>${text.replace(/(?:\r\n|\r|\n)/g, "<br>")}</div>` : ""
}

const parseAudio = entry => {
  return { id: entry }
}

const parseChecklist = entry => {
  const inputId = "1"
  const keys = Object.keys(entry).filter(key => key.startsWith(inputId))
  return keys.map(key => entry[key]).filter(answer => answer.length > 0)
}
