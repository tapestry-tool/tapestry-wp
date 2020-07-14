export function getDirectChildren(state) {
  return id => {
    const links = state.links
    return links.filter(link => link.source == id).map(link => link.target)
  }
}

export function getDirectParents(state) {
  return id => {
    return state.links.filter(link => link.target == id).map(link => link.source)
  }
}

export function getNode(state) {
  return id => state.nodes[id]
}

export function getParent(state) {
  return id => {
    const link = state.links.find(l => l.target == id || l.target.id == id)
    return link ? link.source : null
  }
}

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

export function xOrFx({ settings }) {
  return settings.autoLayout ? "x" : "fx"
}

export function yOrFy({ settings }) {
  return settings.autoLayout ? "y" : "fy"
}

export function createDefaultNode({ settings }) {
  return () => ({
    type: "tapestry_node",
    description: "",
    conditions: [],
    behaviour: "new-window",
    status: "publish",
    nodeType: "child",
    title: "",
    imageURL: "",
    lockedImageURL: "",
    mediaType: "text",
    mediaFormat: "",
    mediaDuration: 0,
    typeId: 1,
    group: 1,
    progress: 0,
    permissions: settings.defaultPermissions || {
      public: ["read"],
      authenticated: ["read"],
    },
    typeData: {
      linkMetadata: null,
      mediaURL: "",
      mediaWidth: 960, //TODO: This needs to be flexible with H5P
      mediaHeight: 600,
      subAccordionText: "More content:",
    },
    hideTitle: false,
    hideProgress: false,
    hideMedia: false,
    skippable: true,
    fullscreen: false,
    coordinates: {
      x: 3000,
      y: 3000,
    },
    childOrdering: [],
    quiz: [],
    unlocked: true,
    accessible: true,
  })
}

export function tapestryJson(state) {
  const exportedTapestry = {
    nodes: state.nodes.map(node => {
      const newNode = { ...node }
      if (newNode.quiz) {
        newNode.quiz = newNode.quiz.map(question => {
          return { ...question, completed: false, entries: null }
        })
      }
      return newNode
    }),
    links: state.links,
    groups: state.groups,
  }
  return exportedTapestry
}

export function getNeighbours(state) {
  return id => {
    return state.links
      .filter(link => link.source == id || link.target == id)
      .map(link => (link.source == id ? link.target : link.source))
  }
}
