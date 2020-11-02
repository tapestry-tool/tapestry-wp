import { TEST_TAPESTRY_NAME } from "../support/constants"

describe("Settings", () => {
  beforeEach(() => {
    cy.fixture("three-nodes.json").as("tapestry")
    cy.setup("@tapestry")
    cy.getByTestId("settings-button").click()
  })

  it(`should be able to set default depth`, () => {
    // Set the default depth to 1
    cy.contains(/default depth/i).click()
    cy.focused()
      .invoke("val", 1)
      .trigger("change")

    cy.submitSettingsModal()

    cy.visitTapestry()

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [, ...children] = Object.values(nodes)
        children.forEach(child => {
          cy.contains(child.title).should("not.be.visible")
        })
      })
  })

  it(`should be able to set a background image`, () => {
    cy.server()
    cy.route("POST", "**/async-upload.php").as("upload")

    cy.get("[name=async-upload]").attachFile("reddit.png")
    cy.wait("@upload")
      .its("response.body.data.url")
      .then(url => {
        cy.getByTestId("node-upload-input").should("have.value", url)
        cy.submitSettingsModal()
        cy.get("#app").should("have.css", "background-image", `url("${url}")`)
      })
  })

  it(`should be able to duplicate a tapestry`, () => {
    cy.contains(/advanced/i).click()

    cy.server()
    cy.route("POST", "**/tapestries").as("duplicate")

    cy.contains(/duplicate tapestry/i).click()
    cy.getByTestId("spinner").should("be.visible")
    cy.wait("@duplicate")

    cy.getByTestId("duplicate-tapestry-link")
      .should("be.visible")
      .then($el => {
        const { href } = $el.get(0)
        cy.visit(href)
      })

    cy.contains(/loading/i).should("not.exist")
    cy.get("@tapestry").then(({ nodes }) => {
      nodes.forEach(node => cy.contains(node.title).should("be.visible"))
    })
    cy.deleteTapestry(`${TEST_TAPESTRY_NAME} (1)`)
  })
})
