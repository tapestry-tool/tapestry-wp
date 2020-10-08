import { setup } from "../support/utils"
import { conditionTypes } from "../../src/utils/constants"

describe("Locked Nodes", () => {
  beforeEach(() => {
    cy.fixture("two-nodes.json").as("twoNodes")
    setup("@twoNodes")
  })

  it(`
    Given: A Tapestry node
    When: A condition is added through the node modal
    Then: It should be locked until the condition is fulfilled
  `, () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [root, child] = Object.values(nodes)

        cy.wrap(child).editNode({
          conditions: [
            {
              type: conditionTypes.NODE_COMPLETED,
              nodeId: root.id,
            },
          ],
        })

        cy.openLightbox(child.id).should("exist")

        cy.login("subscriber").visitTapestry()
        cy.openLightbox(child.id).should("not.exist")

        cy.server()
        cy.route("POST", "**/progress").as("complete")

        cy.openLightbox(root.id).should("exist")
        cy.getByTestId("close-lightbox").click()

        cy.wait("@complete")

        cy.getByTestId(`open-node-${child.id}`).click()
        cy.get("#lightbox").should("exist")
      })
  })
})
