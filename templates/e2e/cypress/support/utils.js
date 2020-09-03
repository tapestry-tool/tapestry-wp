// TODO: Add node generator
// TODO: Add link generator

export const API_URL = `/wp-json/tapestry-tool/v1`

export const TEST_TAPESTRY_NAME = `cypress`

export const getStore = () => cy.window().its("app.$store")

export const visitTapestry = (name = "empty") => {
  cy.visit(`/tapestry/${name}`)
  cy.get("#content")
}

export const openRootNodeModal = () => getByTestId("root-node-button").click()

export const openAddNodeModal = id => {
  cy.get(`#node-${id}`).click({ force: true })
  getAddNodeButton(id).click({ force: true })
  return cy.get(`#node-modal`)
}

export const openEditNodeModal = id => {
  cy.get(`#node-${id}`).click({ force: true })
  getEditNodeButton(id).click({ force: true })
  return cy.get(`#node-modal`)
}

export const getModal = () => cy.get("#node-modal")

export const submitModal = () => cy.contains("Submit").click({ force: true })

export const getMediaButton = id => cy.get(`#mediaButton${id} > i`)

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
  getModal().should("be.visible")

  const { appearance, mediaType, activity, typeData, permissions, ...rest } = newNode
  if (mediaType) {
    getByTestId("node-mediaType").select(mediaType)
  }

  if (typeData) {
    switch (mediaType) {
      case "gravity-form": {
        getByTestId(`node-gravity-form-id`)
          .click()
          .within(() => {
            cy.contains(typeData.id).click()
          })
        break
      }
      case "text": {
        getByTestId(`node-textContent`)
          .find("[contenteditable=true]")
          .clear()
          .type(typeData.textContent)
        break
      }
      case "url-embed": {
        getByTestId(`node-linkUrl`)
          .clear()
          .type(typeData.url)
        getByTestId(`node-linkBehaviour-${typeData.behaviour}`).click({
          force: true,
        })
        break
      }
      case "video": {
        getByTestId(`node-videoUrl`)
          .clear()
          .type(typeData.url)
        break
      }
      default:
        break
    }
  }

  Object.entries(rest).forEach(([testId, value]) => {
    if (testId === "description") {
      getByTestId(`node-description`).find("[contenteditable=true]").clear().type(value)
    } else {
      getByTestId(`node-${testId}`)
      .clear()
      .type(value)
    }
  })

  if (appearance) {
    cy.contains(/appearance/i).click()
    Object.entries(appearance).forEach(([prop, value]) => {
      if (value) {
        getByTestId(`node-appearance-${prop}`)
          .should("exist")
          .check({ force: true })
      } else {
        getByTestId(`node-appearance-${prop}`)
          .should("exist")
          .uncheck({ force: true })
      }
      if (prop === "thumbnail" && value) {
        const { url } = value
        getByTestId("node-appearance-thumbnail-url")
          .clear()
          .type(url)
      }
    })
  }

  if (activity) {
    cy.contains(/activity/i).click({ force: true })
    getByTestId("add-question-checkbox").click({ force: true })
    activity.forEach((question, index) => {
      if (index > 0) {
        cy.contains(/add question/i).click({ force: true })
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

  if (permissions) {
    cy.contains(/access/i).click()
    Object.entries(permissions).forEach(([role, allowedPermissions]) => {
      const permissionTypes = ["read", "add", "edit"]
      permissionTypes.forEach(type => {
        const testId = `node-permissions-${role}-${type}`
        if (allowedPermissions.includes(type)) {
          getByTestId(testId).check({ force: true })
        } else {
          getByTestId(testId).uncheck({ force: true })
        }
      })
    })
  }
}

export const setup = (fixture, role = "admin") => {
  if (fixture) {
    cy.get(fixture).then(tapestry => {
      cy.addTapestry(tapestry)
    })
  } else {
    cy.addTapestry()
  }
  if (role !== "public") {
    cy.login(role)
  }
  cy.visitTapestry()
}

export const cleanup = () => {
  cy.deleteTapestry()
}
