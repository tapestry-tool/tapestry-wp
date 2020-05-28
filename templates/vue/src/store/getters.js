export function getParent(state) {
  return id => {
    const link = state.links.find(l => l.target == id || l.target.id == id)
    return link ? link.source : null
  }
}

export function getModuleFavourites(_, { isFavourite, getNode, getDirectChildren }) {
  return moduleId => {
    const favourites = []
    if (isFavourite(moduleId)) {
      favourites.push(moduleId)
    }
    const stages = getDirectChildren(moduleId)
    stages.forEach(stageId => {
      const stage = getNode(stageId)
      const grouping = {
        title: stage.title,
      }
      const favouritesInStage = []
      if (isFavourite(stageId)) {
        favouritesInStage.push(stageId)
      }
      const topics = getDirectChildren(stageId).map(getNode)
      const accordionRows = topics
        .filter(topic => topic.mediaType === "accordion")
        .flatMap(topic => getDirectChildren(topic.id).map(getNode))
      const subAccordionRows = accordionRows
        .filter(row => getDirectChildren(row.id).length > 0)
        .flatMap(row => getDirectChildren(row).map(getNode))
      const allTopics = [...topics, ...accordionRows, ...subAccordionRows]
      allTopics
        .filter(topic => isFavourite(topic.id))
        .forEach(topic => favouritesInStage.push(topic.id))
      grouping.rows = favouritesInStage
      if (favouritesInStage.length) {
        favourites.push(grouping)
      }
    })
    return favourites
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
        const rowActivities = rows
          .filter(row => row.quiz)
          .flatMap(getCompletedActivities)
        const subRows = rows
          .map(row => getDirectChildren(row.id))
          .filter(child => child.length > 0)
          .map(getNode)
        const subRowActivities = subRows
          .filter(row => row.quiz)
          .flatMap(getCompletedActivities)
        return rowActivities.concat(subRowActivities)
      }
      if (topic.quiz) {
        return getCompletedActivities(topic)
      }
      return []
    })
  }
}

function getCompletedActivities(node) {
  return node.quiz
    .filter(activity => activity.completed)
    .map(activity => ({ ...activity, userType: node.userType }))
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
    /* If the answer is an audio, then entry is the audio file in base64. */
    if (answerType === "audioId") {
      return { type: "audio", entry: "data:audio/ogg; codecs=opus;base64," + entry }
    }
    const answers = getAnswersFromEntry(entry)
    return formatEntry(answers, answerType)
  }
}

export function favourites(state) {
  return state.favourites || []
}

export function isFavourite(_, { favourites }) {
  return id => favourites.find(fid => fid == id) > -1
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
    return { type: "checklist", entry: answers.filter(answer => answer !== "") }
  }
}

export function createDefaultNode({ settings }) {
  return () => ({
    title: "",
    behaviour: "embed",
    mediaType: "",
    typeData: {
      mediaURL: "",
      textContent: "",
      subAccordionText: "More content:",
    },
    mediaDuration: "",
    imageURL: "",
    lockedImageURL: "",
    hideTitle: false,
    hideProgress: false,
    hideMedia: false,
    skippable: true,
    fullscreen: false,
    permissions: settings.defaultPermissions || {
      public: ["read"],
      authenticated: ["read"],
    },
    description: "",
    quiz: [],
    childOrdering: [],
  })
}
