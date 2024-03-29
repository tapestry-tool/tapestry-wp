import { conditionTypes } from "../../src/utils/constants"

describe("Locked Nodes", () => {
  beforeEach(() => {
    cy.fixture("two-nodes.json").as("twoNodes")
    cy.setup("@twoNodes")
  })

  it("should be able to lock and unlock a node", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [root, child] = Object.values(nodes)

        const condition = {
          type: conditionTypes.NODE_COMPLETED,
          nodeId: root.id,
        }

        cy.openModal("edit", child.id)
        cy.contains(/access/i).click()
        cy.contains(/prevent access/i).click()

        cy.getByTestId("add-condition").click()
        cy.getByTestId("condition-type").select(condition.type)
        cy.getByTestId("condition-id").select(String(condition.nodeId))

        cy.submitModal()

        cy.getByTestId(`open-node-${child.id}`).should(
          "not.have.attr",
          "aria-disabled"
        )

        cy.login("subscriber").visitTapestry()
        cy.getByTestId(`open-node-${child.id}`).should("have.attr", "aria-disabled")

        cy.getNodeById(child.id).click()
        cy.contains(/this content will be unlocked/i).should("be.visible")

        cy.intercept("POST", "**/progress").as("complete")

        cy.openLightbox(root.id).should("exist")
        cy.closeLightbox()

        cy.wait("@complete")

        cy.getByTestId(`open-node-${child.id}`).should(
          "not.have.attr",
          "aria-disabled"
        )
      })
  })

  it("should be able to hide a node when locked", () => {
    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [root, child] = Object.values(nodes)

        const condition = {
          type: conditionTypes.NODE_COMPLETED,
          nodeId: root.id,
        }

        cy.openModal("edit", child.id)
        cy.contains(/access/i).click()
        cy.contains(/prevent access/i).click()
        cy.contains(/grey out/i).click()

        cy.getByTestId("add-condition").click()
        cy.getByTestId("condition-type").select(condition.type)
        cy.getByTestId("condition-id").select(String(condition.nodeId))

        cy.submitModal()

        cy.getByTestId(`open-node-${child.id}`).should(
          "not.have.attr",
          "aria-disabled"
        )

        cy.login("subscriber").visitTapestry()
        cy.getByTestId(`node-${child.id}`).should("not.be.visible")

        cy.intercept("POST", "**/progress").as("complete")

        cy.openLightbox(root.id).should("exist")
        cy.closeLightbox()

        cy.wait("@complete")

        cy.getByTestId(`node-${child.id}`).should("be.visible")
        cy.getByTestId(`open-node-${child.id}`).should(
          "not.have.attr",
          "aria-disabled"
        )
      })
  })
})
