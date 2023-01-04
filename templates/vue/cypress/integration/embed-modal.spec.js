describe("Embed Modal", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("tapestry")
    cy.setup("@tapestry")
  })

  it(`should be able to open embed modal and get embed code`, () => {
    cy.getByTestId("embed-modal-button").click({ force: true })

    cy.contains(/create embed/i)
    cy.getByTestId("embed-code").should($textarea => {
      const val = $textarea.val()
      expect(val).to.include("</iframe>")
    })
  })
})
