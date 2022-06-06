describe("Embed Modal", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("tapestry")
    cy.setup("@tapestry")
  })

  it(`should be able to open embed modal and change embed settings`, () => {
    cy.getByTestId("embed-modal-button").click({ force: true })

    cy.contains(/create embed/i)
    cy.getByTestId("hide-sidebar-toggle").should("be.checked")
    cy.getByTestId("show-info-toggle").should("be.checked")
    cy.getByTestId("embed-code").should($textarea => {
      const val = $textarea.val()
      expect(val).to.include("</iframe>")
      expect(val).to.include("</div>")
      expect(val).to.include("no-sidebar")
    })

    cy.getByTestId("show-info-toggle").uncheck({ force: true })
    cy.getByTestId("embed-code").should($textarea => {
      const val = $textarea.val()
      expect(val).to.include("</iframe>")
      expect(val).not.to.include("</div>")
      expect(val).to.include("no-sidebar")
    })

    cy.getByTestId("hide-sidebar-toggle").uncheck({ force: true })
    cy.getByTestId("embed-code").should($textarea => {
      const val = $textarea.val()
      expect(val).to.include("</iframe>")
      expect(val).not.to.include("</div>")
      expect(val).not.to.include("no-sidebar")
    })

    cy.contains(/done/i).click({ force: true })
  })
})
