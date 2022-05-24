describe("User Settings", () => {
  beforeEach(() => {
    cy.fixture("three-nodes.json").as("tapestry")
    cy.setup("@tapestry")
  })

  it(`should be able to open user settings modal and change theme settings`, () => {
    cy.getByTestId("user-settings-button").click({ force: true })

    cy.contains(/light mode/i).click({ force: true })
    cy.contains(/save/i).click({ force: true })

    cy.getByTestId("user-settings-button").click({ force: true })

    cy.contains(/dark mode/i).click({ force: true })
    cy.contains(/save/i).click({ force: true })
  })
})
