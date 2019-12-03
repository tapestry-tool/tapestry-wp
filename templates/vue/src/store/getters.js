export function logs(state) {
  const mapIdToKey = {
    textId: "text",
    checklistId: "checklist",
  }
  const contents = state.nodes
    .filter(node => node.completed)
    .map(node => ({
      type: "content",
      imageURL: node.imageURL,
      title: node.title,
      description: node.description,
    }))

  const activities = []
  const nodesWithQuestions = state.nodes.filter(
    node =>
      node.quiz &&
      node.quiz.some(question => Object.keys(question.entries).length > 0)
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
    audioId: ()=>{},
  }
  return types[answerType](entry)
}

const parseText = entry => entry[1]

const parseChecklist = entry => {
  const inputId = "1"
  const keys = Object.keys(entry).filter(key => key.startsWith(inputId))
  return keys.map(key => entry[key]).filter(answer => answer.length > 0)
}
