describe("my first test", () => {
  it("should toggle the lightbox", () => {
    cy.visitTapestry("show-module-video")
    cy.get("#mediaButtonIcon5823").click()

    cy.get("#lightbox").should("exist")

    cy.get(".close-btn").click()

    cy.get("#lightbox").should("not.exist")
  })
})
