import { setup } from "../../support/utils"

describe("Accordion", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
  })

  it(`
    Given: A Tapestry node
    When: It's edited to an accordion and opened
    Then: An accordion lightbox should appear
  `, () => {
    setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.getByTestId(`edit-node-${node.id}`).click()
      cy.getByTestId(`node-media-type`).select("accordion")
      cy.submitModal()

      cy.getByTestId(`open-node-${node.id}`).click()
      cy.getByTestId("lightbox").within(() => {
        cy.getByTestId("accordion").should("be.visible")
        cy.contains(node.title).should("be.visible")
      })
    })
  })

  it(`
    Given: An accordion
    When: Child nodes are added and the accordion opened
    Then: Rows should appear and be clickable
  `, () => {
    setup("@oneNode")

    cy.getSelectedNode().editNodeInStore({
      mediaType: "accordion",
    })

    const rows = [
      {
        title: "row 1",
        typeData: {
          textContent: "hello world",
        },
      },
      {
        title: "row 2",
        typeData: {
          textContent: "bye world",
        },
      },
    ]

    cy.getSelectedNode().then(node => {
      for (const row of rows) {
        cy.addNode(row, node.id)
      }

      cy.getByTestId(`open-node-${node.id}`).click()
      cy.getByTestId("lightbox").within(() => {
        for (const row of rows) {
          cy.contains(row.title).should("be.visible")
          cy.contains(row.title).click()
          cy.contains(row.typeData.textContent).should("be.visible")
        }
      })
    })
  })

  it(`
    Given: A non-empty accordion
    When: Its rows are locked
    Then: Only the first row should be clickable until completed
  `)

  it(`
    Given: A non-empty accordion
    When: Its rows are reordered
    Then: The lightbox should reflect the new order
  `)

  it(`
    Given: An accordion row
    When: A child node is added to it
    Then: The row should appear as a subaccordion
  `)
})
