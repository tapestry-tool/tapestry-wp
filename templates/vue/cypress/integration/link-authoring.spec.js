import { setup } from "../support/utils"

describe("Link Authoring", () => {
  /**
   * Currently, d3-drag (which handles our drag events) and Cypress are incompatible.
   * See:
   *  - https://github.com/cypress-io/cypress/issues/311
   *  - https://stackoverflow.com/questions/54027884/testing-d3-js-drag-events-with-cypress-js
   *
   * We can potentially test this still using Jest and Vue-Testing-Lib:
   *  - https://github.com/wynnset/tapestry-wp/pull/767
   */
  describe.skip("Linking", () => {
    it(`
      Given: Two unlinked leaf nodes
      When: The add button is dragged from one to the other
      Then: A confirmation should appear that, when confirmed, adds the link
    `)

    it(`
      Given: The link confirmation modal
      When: The cancel button is pressed
      Then: The link should not be created
    `)

    it(`
      Given: Two linked nodes
      When: A link is added
      Then: The link should not be created
    `)

    it(`
      Given: Two nodes, one without add permission
      When: A link is added
      Then: An alert should appear and the link not created
    `)

    it(`
      Given: An accordion node and a regular node
      When: A link is added from the accordion to the node
      Then: A confirmation should appear that, when confirmed, adds the node as a row
    `)

    it(`
      Given: An accordion node and a regular node
      When: A link is added from the accordion to the node
      Then: A confirmation should appear that, when cancelled, adds only the link
    `)
  })

  describe("Deletion", () => {
    beforeEach(() => {
      cy.fixture("stump.json").as("stump")
      setup("@stump")
    })

    it(`
      Given: Two linked leaf nodes
      When: Their link is clicked
      Then: A confirmation should appear that, when confirmed, deletes the link
    `, () => {
      cy.store()
        .its("state.nodes")
        .then(nodes => {
          const [, child1, child2] = Object.values(nodes)
          cy.addLink(child1.id, child2.id)

          const stub = cy.stub()
          stub.onFirstCall().returns(true)

          cy.on("window:confirm", stub)

          const link = `link-${child1.id}-${child2.id}`
          cy.getByTestId(link)
            .click()
            .then(() => {
              expect(stub).to.be.called
              expect(stub.getCall(0).lastArg).to.match(
                /are you sure you want to delete the link/i
              )
            })
          cy.getByTestId(link).should("not.exist")
        })
    })

    it(`
      Given: A leaf node with only one link
      When: The link is clicked
      Then: An alert should appear and the link not deleted
    `, () => {
      cy.store()
        .its("state.nodes")
        .then(nodes => {
          const [root, child] = Object.values(nodes)

          const confirm = cy.stub()
          confirm.onFirstCall().returns(true)

          const alert = cy.stub()
          cy.on("window:confirm", confirm)
          cy.on("window:alert", alert)

          const link = `link-${root.id}-${child.id}`
          cy.getByTestId(link)
            .click()
            .then(() => {
              expect(alert).to.be.called
              expect(alert.getCall(0).lastArg).to.match(/cannot delete this link/i)
            })
          cy.getByTestId(link).should("exist")
        })
    })

    it(`
      Given: Two linked nodes, one without add permission
      When: The link is clicked
      Then: An alert should appear and the link not deleted
    `, () => {
      cy.store()
        .its("state.nodes")
        .then(nodes => {
          const [, child1, child2] = Object.values(nodes)
          cy.addLink(child1.id, child2.id)

          cy.logout().visitTapestry()
          const confirm = cy.stub()
          confirm.onFirstCall().returns(true)

          const alert = cy.stub()
          cy.on("window:confirm", confirm)
          cy.on("window:alert", alert)

          const link = `link-${child1.id}-${child2.id}`
          cy.getByTestId(link)
            .click()
            .then(() => {
              expect(alert).to.be.called
              expect(alert.getCall(0).lastArg).to.match(/cannot delete this link/i)
            })
          cy.getByTestId(link).should("exist")
        })
    })

    it(`
      Given: An accordion node and its row
      When: The link is deleted
      Then: The row should be removed from the accordion
    `, () => {
      cy.store()
        .its("state.nodes")
        .then(nodes => {
          const [root, child1, child2] = Object.values(nodes)

          cy.getByTestId(`edit-node-${root.id}`).click()
          cy.getByTestId(`node-media-type`).select("accordion")
          cy.submitModal()

          cy.addLink(child1.id, child2.id)
          cy.getByTestId(`link-${child1.id}-${child2.id}`).should("exist")

          cy.getByTestId(`open-node-${root.id}`).click()
          cy.getByTestId("lightbox").within(() => {
            cy.contains(child1.title).should("exist")
          })
          cy.getByTestId("close-lightbox").click()

          cy.getByTestId(`link-${root.id}-${child1.id}`)
            .click()
            .should("not.exist")
          cy.getByTestId(`open-node-${root.id}`).click()
          cy.getByTestId("lightbox").within(() => {
            cy.contains(child1.title).should("not.exist")
          })
        })
    })
  })
})
