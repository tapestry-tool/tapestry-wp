describe("Link Authoring", () => {
  beforeEach(() => {
    cy.fixture("three-nodes.json").as("threeNodes")
    cy.setup("@threeNodes")
  })

  it("should be able to delete a link between two leaf nodes", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [, child1, child2] = Object.values(nodes)
        cy.addLink(child1.id, child2.id)

        const stub = cy.stub()
        stub.onFirstCall().returns(true)

        cy.on("window:confirm", stub)

        cy.link(child1.id, child2.id)
          .click()
          .then(() => {
            expect(stub).to.be.called
            expect(stub.getCall(0).lastArg).to.match(
              /are you sure you want to delete the link/i
            )
          })
        cy.link(child1.id, child2.id).should("not.exist")
      })
  })

  it("should not be able to delete a node's only link", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [root, child] = Object.values(nodes)

        const confirm = cy.stub()
        confirm.onFirstCall().returns(true)

        const alert = cy.stub()
        cy.on("window:confirm", confirm)
        cy.on("window:alert", alert)

        cy.link(root.id, child.id)
          .click()
          .then(() => {
            expect(alert).to.be.called
            expect(alert.getCall(0).lastArg).to.match(/cannot delete this link/i)
          })
        cy.link(root.id, child.id).should("exist")
      })
  })

  it("should not be able to delete a link without add permission", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [, child1, child2] = Object.values(nodes)
        cy.addLink(child1.id, child2.id)

        cy.logout().visitTapestry()

        const link = `link-${child1.id}-${child2.id}`
        cy.getByTestId(link).click()
        cy.getByTestId(link).should("exist")
      })
  })

  it("should delete the accordion row if the row's link is deleted", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [root, child1, child2] = Object.values(nodes)

        cy.openModal("edit", root.id)
        cy.changeMediaType("accordion")
        cy.submitModal()

        /**
         * Reload so accordions have correct rows. See bug report:
         *  - https://app.asana.com/0/1126491658233864/1198168819652457
         */
        cy.visitTapestry()

        cy.addLink(child1.id, child2.id)
        cy.link(child1.id, child2.id).should("exist")

        cy.openLightbox(root.id)
        cy.lightbox().within(() => {
          cy.contains(child1.title).should("exist")
        })
        cy.closeLightbox()

        cy.link(root.id, child1.id)
          .click()
          .should("not.exist")
        cy.openLightbox(root.id)
        cy.lightbox().within(() => {
          cy.contains(child1.title).should("not.exist")
        })
      })
  })
})
