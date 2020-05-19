// TODO: Add node generator
// TODO: Add link generator

export const SITE_URL = Cypress.env("BASE_URL")

export const API_URL = `${SITE_URL}/wp-json/tapestry-tool/v1`

export const TEST_TAPESTRY_NAME = `cypress`

export const getStore = () => cy.window().its("app.$store")

export const visitTapestry = (name = "empty") => {
  cy.visit(`${SITE_URL}/tapestry/${name}`)
  cy.get("#content")
}

export const openRootNodeModal = () => cy.get("#root-node-button > div").click()

export const openAddNodeModal = id => {
  cy.get(`#node-${id}`).click({ force: true })
  getAddNodeButton(id).click()
  return cy.get(`#node-modal-container`)
}

export const openEditNodeModal = id => {
  cy.get(`#node-${id}`).click({ force: true })
  getEditNodeButton(id).click()
  return cy.get(`#node-modal-container`)
}

export const getModal = () => cy.get("#node-modal-container")

export const submitModal = () => cy.contains("Submit").click()

export const getMediaButton = id => cy.get(`#mediaButton${id}`)

export const getAddNodeButton = id => cy.get(`#addNodeIcon${id}`)

export const getEditNodeButton = id => cy.get(`#editNodeIcon${id}`)

export const getByTestId = id => cy.get(`[data-testid=${id}]`)

export const getNode = id => cy.get(`#node-${id}`)

export const getLightbox = () => cy.get("#lightbox")

export const findNode = pred =>
  getStore()
    .its("state.nodes")
    .then(nodes => nodes.find(pred))

export const normalizeUrl = url => {
  return url.startsWith("http:") || url.startsWith("https:") ? url : `https:${url}`
}

export const applyModalChanges = newNode => {
  const { mediaType, quiz, ...rest } = newNode
  if (mediaType) {
    getByTestId("node-mediaType").select(mediaType)
  }
  Object.entries(rest).forEach(([testId, value]) => {
    getByTestId(`node-${testId}`)
      .clear()
      .type(value)
  })

  if (quiz) {
    cy.contains(/quiz/i).click()
    getByTestId("add-question-checkbox").click({ force: true })
    quiz.forEach((question, index) => {
      if (index > 0) {
        cy.contains(/add question/i).click()
      }
      const { title, answerTypes } = question
      getByTestId(`question-title-${index}`)
        .clear()
        .type(title)
      Object.entries(answerTypes).forEach(([type, id]) => {
        if (type === "audio") {
          getByTestId(`question-answer-${type}-${index}`).check()
        } else {
          getByTestId(`question-answer-${type}-${index}`)
            .click()
            .within(() => {
              cy.contains(id).click()
            })
        }
      })
    })
  }
}
