describe("User Settings", () => {
  beforeEach(() => {
    cy.fixture("three-nodes.json").as("tapestry")
    cy.setup("@tapestry")
  })

  it(`should be able to open user settings modal and change theme settings`, () => {
    cy.getByTestId("user-settings-button").click()

    cy.contains(/light mode/i).click()
    cy.getByTestId("user-settings-submit-button").click()

    cy.getByTestId("user-settings-button").click()

    cy.contains(/dark mode/i).click()
    cy.getByTestId("user-settings-submit-button").click()
  })
})
