import { setup } from "../../support/utils"

describe("Accordion", () => {
  beforeEach(() => {
    cy.fixture("root.json").as("oneNode")
    cy.fixture("accordion.json").as("accordion")
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
        cy.getByTestId("accordion-rows")
          .find("div.accordion-row")
          .each(($el, index) => {
            const row = rows[index]
            cy.wrap($el)
              .contains(row.title)
              .should("exist")
          })

        for (const row of rows) {
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
  `, () => {
    setup("@accordion")

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [accordion, row1, row2] = Object.values(nodes)

        cy.getByTestId(`edit-node-${accordion.id}`).click()
        cy.contains(/lock rows/i).click()
        cy.submitModal()

        cy.getByTestId(`open-node-${accordion.id}`).click()
        cy.getByTestId("lightbox").within(() => {
          cy.contains(row1.title).should("not.be.disabled")
          cy.contains(row2.title).should("be.disabled")

          cy.contains(row1.title).click()
          cy.contains(row2.title).should("not.be.disabled")

          cy.contains(row2.title).click()
          cy.contains(row2.typeData.textContent).should("be.visible")
        })
      })
  })

  it(`
    Given: A non-empty accordion
    When: Its rows are reordered
    Then: The lightbox should reflect the new order
  `, () => {
    setup("@accordion")

    cy.getSelectedNode().then(node => {
      const [row1, row2] = node.childOrdering
      const newOrdering = [row2, row1]

      cy.wrap(node).editNodeInStore({
        childOrdering: newOrdering,
      })

      cy.getByTestId(`open-node-${node.id}`).click()
      cy.getByTestId("lightbox").within(() => {
        cy.getByTestId("accordion-rows")
          .find("div.accordion-row")
          .each(($el, index) => {
            const row = newOrdering[index]
            cy.store()
              .its(`state.nodes.${row}`)
              .then(rowNode => {
                cy.wrap($el)
                  .contains(rowNode.title)
                  .should("exist")
              })
          })
      })
    })
  })

  it(`
    Given: An accordion row
    When: A child node is added to it
    Then: The row should appear as a subaccordion
  `, () => {
    setup("@accordion")

    const row = {
      title: "sub row",
      typeData: {
        textContent: "hello world",
      },
    }

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        const [root, child] = Object.values(nodes)
        cy.addNode(row, child.id)

        cy.getByTestId(`open-node-${root.id}`).click()
        cy.getByTestId("lightbox").within(() => {
          cy.contains(child.title).click()
          cy.getByTestId(`row-content-${child.id}`).within(() => {
            cy.contains(row.title).click()
            cy.contains(row.typeData.textContent).should("be.visible")
          })
        })
      })
  })
})
