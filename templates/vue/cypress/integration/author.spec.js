import { API_URL } from "../support/utils"

describe("Author side", () => {
  beforeEach(() => {
    cy.login("admin")
  })

  /* afterEach(() => {
    cy.logout()
  }) */

  describe("General", function() {
    it.only("Should be able to add a root node", () => {
      cy.server()
      cy.fixture("node").as("nodeData")
      cy.fixture("empty").as("emptyTapestry")

      // stub out the get request to tapestries
      cy.route("GET", `${API_URL}/tapestries/*`, "@emptyTapestry")
      cy.route("POST", `${API_URL}/tapestries/**/nodes`, "@nodeData")

      cy.visitTapestry()

      // open add node modal
      cy.get("#root-node-button > div").click()
      cy.get("#node-modal-container").should("exist")

      cy.get("@nodeData")
        .then(data => {
          cy.get("#node-title").type(data.title)
          cy.get("#node-description").type(data.description)
          cy.get("#node-media-type").select(data.mediaType)
          cy.get("#node-text-content").type(data.typeData.textContent)
          cy.contains("Submit").click()

          cy.get(`#node-${data.id}`).should("exist")
        })
    })

    it("Should be able to add multiple child nodes", () => {})
    it("New nodes should be draggable and viewable", () => {})
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
