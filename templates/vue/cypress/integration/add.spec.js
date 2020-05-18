describe("POST Tapestry", () => {
  it("Should be able to create a new empty Tapestry", () => {
    const url = `http://localhost:8888/wp-json/tapestry-tool/v1/tapestries`
    cy.fixture("tapestry.json").then(simpleTapestry => {
      const title = "simple-tapestry"
      cy.login("admin")
      cy.request({
        url: url,
        body: { title, ...simpleTapestry },
        method: "POST",
      })
      cy.visitTapestry(title)
    })
  })
})
