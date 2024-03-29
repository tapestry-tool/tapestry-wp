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
    cy.intercept("POST", "**/async-upload.php").as("upload")

    cy.get("[name=async-upload]").attachFile("reddit.png")
    cy.wait("@upload")
      .then(({ response }) => {
        return JSON.parse(response.body).data.url
      })
      .then(url => {
        cy.getByTestId("node-upload-input").should("have.value", url)
        cy.submitSettingsModal()
        cy.get("body").should("have.css", "background-image", `url("${url}")`)
      })
  })
})
