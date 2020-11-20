describe("Sidebar", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
    cy.getSelectedNode()
      .its("id")
      .then(id => {
        cy.editNode(id, {
          license: {
            type: "custom",
            description: `Copyright <YEAR> <COPYRIGHT HOLDER>

            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
            
            The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
            
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
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

    cy.getByTestId("sidebar-content").scrollTo(0, 0)
    assertActive("information")

    cy.findByLabelText("close sidebar").click()
    cy.getByTestId("sidebar-content").should("not.be.visible")
  })

  it("should be able to open the sidebar by visiting the url", () => {
    cy.app().then(app => {
      const { path } = app.$route
      app.$router.push({
        path,
        query: {
          sidebar: "copyright",
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
