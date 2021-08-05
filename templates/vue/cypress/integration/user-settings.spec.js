describe("User Settings", () => {
  beforeEach(() => {
    cy.fixture("three-nodes.json").as("tapestry")
    cy.setup("@tapestry")
  })

  it(`should be able to open user settings modal and change theme settings`, () => {
    cy.store()
      .its("state.theme")
      .then(() => {
        cy.getByTestId("user-settings-button").click({ force: true })

        cy.contains(/light mode/i).click()
        cy.contains(/save theme/i).click()

        cy.getByTestId("user-settings-button").click({ force: true })

        cy.contains(/dark mode/i).click()
        cy.contains(/save theme/i).click()
      })
  })
})
