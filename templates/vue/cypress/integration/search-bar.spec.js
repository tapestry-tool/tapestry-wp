describe("Search bar", () => {
  beforeEach(() => {
    cy.fixture("multi-author.json").as("tapestry")
    cy.setup("@tapestry")
  })

  it("should be able to search nodes by its title")

  it("should be able to search nodes by author")

  it("should be able to search nodes by published status")
})
