import { API_URL, getStore, visitTapestry, fillNodeForm, generateLink } from "../support/utils"

describe("Author side", () => {
  beforeEach(() => {
    cy.login("admin")

    cy.fixture("nodes/root").as("nodeData")
    cy.fixture("nodes/text1").as("textNodeOne")

    cy.fixture("tapestries/empty").as("emptyTapestry")
  })

  describe("General", function() {
    it.only("Should be able to add and move nodes", () => {
      cy.server()

      // stub out the get request to tapestries
      cy.route("GET", `${API_URL}/tapestries/*`, "@emptyTapestry")

      visitTapestry()

      /* --- Add root node --- */
      // TODO: Abstract this to an addNode function

      cy.route("POST", `${API_URL}/tapestries/**/nodes`, "@nodeData")
      cy.route("PUT", `${API_URL}/tapestries/**/nodes/**/permissions`, "@nodeData")

      cy.get("#root-node-button > div").click()
      cy.get("#node-modal-container").should("exist")

      fillNodeForm("@nodeData")

      cy.get("@nodeData")
        .then(data => {
          cy.get("#node-modal-container").should("not.exist")
          cy.get(`#node-${data.id}`).should("exist")
          getStore().its('state.nodes').should("have.length", 1)
          getStore().its('state.nodes.0.id').should("equal", data.id)
        })

      /* --- Add child node --- */
      // TODO: Refactor this to use addNode function above

      cy.route("POST", `${API_URL}/tapestries/**/nodes`, "@textNodeOne")
      cy.route("PUT", `${API_URL}/tapestries/**/nodes/**/permissions`, "@textNodeOne")

      getStore()
        .its('state.nodes.0.id')
        .then(id => {
          cy.get("@textNodeOne")
            .then(node => {
              cy.route("POST", `${API_URL}/tapestries/**/links`, generateLink(id, node.id))
            })
        })

      cy.get("#addNodeIcon1").click()
      cy.get("#node-modal-container").should("exist")
      fillNodeForm("@textNodeOne")

      cy.get("@textNodeOne")
        .then(data => {
          cy.get(`#node-${data.id}`).should("exist")
          getStore().its('state.nodes').should("have.length", 2)
          getStore().its('state.nodes.1.id').should("equal", data.id)

          getStore().its('state.links').should("have.length", 1)
        })

      /* --- Move child node --- */
      /* cy.get("@textNodeOne")
        .then(data => {
          cy.get(`#node-${data.id}`)
            .trigger("mousedown", { which: 1 })
            .trigger("mousemove", { clientX: 30, clientY: 100 })
            .trigger("mouseup")
        }) */
    })

    it("Should be able to delete a leaf node", () => {})
    it("Should be able to delete a link if the nodes its connected to have at least one other link connected to it", () => {})
  })

  describe("Node content", () => {
    it("Should be able to edit content fields and see the changes applied", () => {})
  })

  describe("Node appearance", () => {
    it("Should show a thumbnail if a thumbnail url is passed", () => {})
    it("Should hide node title if its input is checked", () => {})
    it("Should hide progress bar if its input is checked", () => {})
    it("Should hide media button if its input is checked", () => {})
  })

  describe("Node permissions", () => {
    it("Should hide node and associated links if user does not have read access", () => {})
    it("Should hide edit button if user does not have write access", () => {})
    it("Should hide add button if user does not have add access", () => {})
  })
})
