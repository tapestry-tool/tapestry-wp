describe("Link Authoring", () => {
  beforeEach(() => {
    cy.fixture("three-nodes.json").as("threeNodes")
    cy.setup("@threeNodes")
  })

  it("should be able to add a link using the link tool", () => {
    cy.get("#tapestry-add-link-tool").click()

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [, child1, child2] = Object.values(nodes)

        cy.link(child1.id, child2.id).should("not.exist")
        cy.getNodeById(child1.id).click()
        cy.getNodeById(child2.id).click()
        cy.link(child1.id, child2.id).should("be.visible")
      })
  })

  it("should be able to delete a link between two leaf nodes", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [, child1, child2] = Object.values(nodes)
        cy.addLink(child1.id, child2.id)

        cy.link(child1.id, child2.id).click()
        cy.get("#delete-link-btn").click()

        cy.link(child1.id, child2.id).should("not.exist")
      })
  })

  it("should not be able to delete a link without add permission", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [, child1, child2] = Object.values(nodes)
        cy.addLink(child1.id, child2.id)

        cy.logout().visitTapestry()

        cy.link(child1.id, child2.id).click()
        cy.get("#delete-link-btn").should("be.hidden")
      })
  })

  it("should delete the accordion row if the row's link is deleted", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [root, child1, child2] = Object.values(nodes)

        cy.openModal("edit", root.id)
        cy.changeMediaType("multi-content")
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

        cy.link(root.id, child1.id).click()
        cy.get("#delete-link-btn").click()

        cy.link(root.id, child1.id).should("not.exist")
        cy.openLightbox(root.id)
        cy.lightbox().within(() => {
          cy.contains(child1.title).should("not.exist")
        })
      })
  })
})
