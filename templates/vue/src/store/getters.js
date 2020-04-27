export function getParent(state) {
  return id => {
    const link = state.links.find(l => l.target == id || l.target.id == id)
    return link ? link.source : null
  }
}

export function getModuleContent(_, { getNode, getDirectChildren }) {
  return moduleId => {
    const module = getNode(moduleId)
    const isCopilot = module.userType === "teen"
    return getDirectChildren(moduleId).map(stageId => ({
      node: getNode(stageId),
      topics: getDirectChildren(stageId)
        .map(getNode)
        .filter(content => isCopilot || content.completed),
    }))
  }
}

export function getModuleActivities(_, { getNode, getDirectChildren }) {
  return moduleId => {
    const topics = getDirectChildren(moduleId).flatMap(getDirectChildren)
    return topics.flatMap(id => {
      const topic = getNode(id)
      if (topic.mediaType === "accordion") {
        // look at the rows for questions
        const rows = getDirectChildren(topic.id).map(getNode)
        return rows.filter(row => row.quiz).flatMap(getCompletedActivities)
      }
      if (topic.quiz) {
        return getCompletedActivities(topic)
      }
      return []
    })
  }
}

function getCompletedActivities(node) {
  return node.quiz.filter(activity => activity.completed)
}

export function getActivities(state) {
  return (options = {}) => {
    const { exclude = [] } = options
    return state.nodes
      .filter(node => !exclude.includes(node.id) && Boolean(node.quiz))
      .flatMap(node => node.quiz)
  }
}

export function getProfileActivities({ nodes, settings }) {
  let activities = []
  let nodesWithQuestions = nodes.filter(
    node =>
      node.quiz &&
      node.quiz.some(
        question => question.entries && Object.keys(question.entries).length > 0
      )
  )
  nodesWithQuestions.forEach(node => {
    node.quiz
      .filter(
        question =>
          question.entries &&
          settings.profileActivities.find(item =>
            node.quiz.find(question => item.activityRef === question.id)
          )
      )
      .forEach(question => {
        activities.push(question)
      })
  })

  // Go through profile activities in settings and add related answers if there
  // Profile activites may have repeat activities and have a specific sort order
  let profileActivities = []
  for (let profileQuestion of settings.profileActivities) {
    for (let questionWithAnswer of activities) {
      if (questionWithAnswer.id === profileQuestion.activityRef) {
        profileActivities.push(questionWithAnswer)
        break
      }
    }
  }
  return profileActivities
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

export function getEntry(_, { getQuestion }) {
  return (questionId, answerType) => {
    const question = getQuestion(questionId)
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
      entry: answers[0],
    }
  }
  if (answerType === "checklistId") {
    return { type: "checklist", entry: answers.filter(answer => answer.length) }
  }
}
