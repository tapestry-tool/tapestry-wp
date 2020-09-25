export function parse(dataset) {
  const store = {
    ...dataset,
  }

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

  dataset.nodes
    .filter(n => n.mediaType === "accordion" || n.isSubAccordion)
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
