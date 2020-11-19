import { tydeTypes, DEFAULT_DEPTH } from "./constants"
import * as wp from "@/services/wp"

/**
 * Parses the dataset to the expected VueX format. Specifically it converts the
 * dataset to the VueX state format, then applies the current progress.
 * @param {TapestryDataset} dataset
 * @param {TapestryProgress} progress
 */
export function parse(dataset, progress) {
  return setDatasetProgress(parseToStore(dataset), applyLocalProgress(progress))
}

export function makeMockProgress(dataset) {
  const progress = {}

  for (const node of dataset.nodes) {
    progress[node.id] = {
      progress: 0,
      accessible: true,
      conditions: [],
      unlocked: true,
      content: {
        quiz: [...node.quiz],
        typeData: { ...node.typeData },
      },
      completed: false,
      quiz: {},
    }
  }

  return progress
}

// --

function parseToStore(dataset) {
  const store = {
    ...dataset,
  }

  if (!Array.isArray(dataset.nodes)) dataset.nodes = Object.values(dataset.nodes)

  for (const node of dataset.nodes) {
    const { imageURL, lockedImageURL } = node
    const { mediaURL } = node.typeData
    if (imageURL) {
      node.imageURL = imageURL.replace(/(http(s?)):\/\//gi, "//")
    }
    if (lockedImageURL) {
      node.lockedImageURL = lockedImageURL.replace(/(http(s?)):\/\//gi, "//")
    }
    if (mediaURL && typeof mediaURL === "string") {
      node.typeData.mediaURL = mediaURL.replace(/(http(s?)):\/\//gi, "//")
    }

    if (!node.tydeType) {
      node.tydeType = tydeTypes.REGULAR
    }
  }

  for (const node of dataset.nodes.filter(node => node.mediaType === "accordion")) {
    const accordionRowIds = getChildIds({ links: dataset.links }, node.id)
    accordionRowIds.forEach(accordionRowId => {
      const accordionRow = getNode(dataset, accordionRowId)
      accordionRow.presentationStyle = "accordion-row"
      const subRows = getChildIds({ links: dataset.links }, accordionRowId)
      if (subRows.length) {
        accordionRow.isSubAccordion = true
      }
      subRows.forEach(id => {
        const subRow = getNode(dataset, id)
        subRow.presentationStyle = "accordion-row"
      })
    })
  }

  store.settings = dataset.settings || {}
  const { defaultDepth } = store.settings
  if (defaultDepth === undefined) {
    store.settings.defaultDepth = DEFAULT_DEPTH
  }

  dataset.nodes
    .filter(
      n =>
        n.tydeType === tydeTypes.MODULE ||
        n.mediaType === "accordion" ||
        n.isSubAccordion ||
        n.tydeType === tydeTypes.STAGE
    )
    .forEach(n => initializeOrdering(dataset, n))

  store.selectedNodeId = dataset.rootId
  store.visibleNodes = dataset.nodes.map(node => parseInt(node.id, 10))
  store.nodes = dataset.nodes.reduce((acc, node) => {
    acc[node.id] = node
    return acc
  }, {})
  store.links = dataset.links.filter(link => {
    const { source, target } = link
    return (
      getNode(dataset, source) !== undefined &&
      getNode(dataset, target) !== undefined
    )
  })

  return store
}

function applyLocalProgress(progress) {
  if (!wp.isLoggedIn()) {
    const localProgress = localStorage.getItem("tapestry-progress")
    if (localProgress) {
      const userProgress = JSON.parse(localProgress)
      Object.keys(progress)
        .filter(nodeId => userProgress.hasOwnProperty(nodeId))
        .forEach(nodeId => {
          const nodeProgress = userProgress[nodeId]
          const newProgress = progress[nodeId]
          newProgress.progress = nodeProgress.progress
        })
    }
  }
  return progress
}

function setDatasetProgress(dataset, progress) {
  if (!wp.isLoggedIn()) {
    localStorage.setItem("tapestry-progress", JSON.stringify(progress))
  }
  for (const [id, nodeProgress] of Object.entries(progress)) {
    const node = dataset.nodes[id]
    if (node) {
      const willLock = node.unlocked && !nodeProgress.unlocked
      if (willLock && !wp.canEditTapestry()) {
        node.quiz = []
        node.typeData = {}
      }

      node.unlocked = nodeProgress.unlocked
      node.accessible = nodeProgress.accessible
      node.conditions = nodeProgress.conditions
      node.completed = nodeProgress.completed

      const { content } = nodeProgress
      if (content) {
        node.quiz = content.quiz
        node.typeData = content.typeData
      }

      if (node.mediaType !== "accordion") {
        node.progress = nodeProgress.progress
        const questions = node.quiz
        if (nodeProgress.quiz) {
          Object.entries(nodeProgress.quiz).forEach(
            ([questionId, completionInfo]) => {
              const question = questions.find(question => question.id === questionId)
              if (question) {
                question.completed = completionInfo.completed
                question.entries = {}
                Object.entries(completionInfo).forEach(([key, value]) => {
                  if (key !== "completed") {
                    question.entries[key] = value
                  }
                })
              }
            }
          )
        }
      }
    }
  }
  return dataset
}

function initializeOrdering(state, node) {
  getChildIds(state, node.id)
    .filter(cid => !node.childOrdering.includes(cid))
    .forEach(id => node.childOrdering.push(id))
  const children = getChildIds(state, node.id)
  node.childOrdering = node.childOrdering.filter(id => children.includes(id))
}

export function getNode(dataset, nodeId) {
  return dataset.nodes.find(node => node.id == nodeId)
}

export function getChildIds(dataset, nodeId) {
  const links = dataset.links
  return links
    .filter(link =>
      link.source.id == undefined ? link.source == nodeId : link.source.id == nodeId
    )
    .map(link => link.target)
}
