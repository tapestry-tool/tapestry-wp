describe("Sidebar", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
    cy.getSelectedNode()
      .its("id")
      .then(id => {
        cy.editNode(id, {
          license: {
            type: "cc",
          },
        })
      })
  })

  it("should be able to view node information via the sidebar", () => {
    cy.findByLabelText("open sidebar").click()
    assertActive("information")

    cy.sidebar().within(() => cy.contains(/view/i).click())
    cy.lightbox()
      .should("be.visible")
      .closeLightbox()

    cy.sidebar().within(() => cy.contains(/edit/i).click())
    cy.getByTestId("node-modal").should("be.visible")
    cy.contains(/cancel/i).click()

    cy.findByLabelText("copyright").click()
    assertActive("copyright")

    cy.findByLabelText("close sidebar").click()
    cy.getByTestId("sidebar-content").should("not.be.visible")
  })

  it("should be able to open the sidebar by visiting the url", () => {
    cy.app().then(app => {
      const { path } = app.$route
      app.$router.push({
        path,
        query: {
          sidebar: true,
          section: "copyright",
        },
      })
    })
    assertActive("copyright")
  })
})

function assertActive(section) {
  cy.getByTestId("sidebar-content").should("be.visible")
  cy.findByLabelText(section).should("have.css", "opacity", "1")
}
