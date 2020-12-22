describe("Map Tapestry", () => {
  beforeEach(() => {
    cy.fixture("two-nodes.json").as("twoNodes")
    cy.setup("@twoNodes")

    cy.getByTestId("settings-button").click()
    cy.contains(/advanced/i).click()
    cy.getByTestId("map-checkbox").click({ force: true })
    cy.submitSettingsModal()
  })

  it("should be able to add markers to map if and only if coordinates are valid", () => {
    cy.get(".card-body")
      .eq(1)
      .contains("Add to map")
      .click()
    cy.contains("Show on Map").click({ force: true })

    // prevents invalid submission
    cy.getByTestId("node-lat-input").type("91")
    cy.getByTestId("submit-node-modal").should("be.disabled")
    cy.getByTestId("node-lat-input").type("-91")
    cy.getByTestId("submit-node-modal").should("be.disabled")
    cy.getByTestId("node-lng-input").type("181")
    cy.getByTestId("submit-node-modal").should("be.disabled")
    cy.getByTestId("node-lng-input").type("-181")
    cy.getByTestId("submit-node-modal").should("be.disabled")

    // allows valid submission
    cy.getByTestId("node-lat-input")
      .clear()
      .type("90")
    cy.getByTestId("node-lng-input")
      .clear()
      .type("180")
    cy.getByTestId("submit-node-modal").should("not.be.disabled")
    cy.getByTestId("node-lat-input")
      .clear()
      .type("-50")
    cy.getByTestId("node-lng-input")
      .clear()
      .type("-150")
    cy.getByTestId("submit-node-modal").should("not.be.disabled")
    cy.submitModal()

    // properly adds marker
    cy.get(".leaflet-marker-icon").should($p => {
      expect($p).to.have.length(1)
    })
    cy.contains("-50").should("exist")
    cy.contains("-150").should("exist")
  })

  it("if logged out, should see map without the list of nodes", () => {
    cy.logout().visitTapestry()
    cy.get(".nodes-list").should("not.be.visible")
    cy.get(".vue2leaflet-map").should("be.visible")
  })

  it("should see map markers and be able to click to view nodes even if logged out", () => {
    cy.get(".card-body")
      .eq(1)
      .contains("Add to map")
      .click()
    cy.contains("Show on Map").click({ force: true })
    cy.getByTestId("node-lat-input")
      .clear()
      .type("-50")
    cy.getByTestId("node-lng-input")
      .clear()
      .type("-150")
    cy.submitModal()

    cy.logout().visitTapestry()

    cy.get(".leaflet-marker-icon").should("be.visible")
    cy.get(".leaflet-marker-icon").click({ force: true })
    cy.get(".vue2leaflet-map")
      .get(".btn > h6")
      .click({ force: true })
    cy.lightbox().should("be.visible")
    cy.closeLightbox()
  })

  it("should be able to click on nodes list to go to a marker and open popups", () => {
    // setup
    cy.get(".card-body")
      .eq(1)
      .contains("Add to map")
      .click()
    cy.contains("Show on Map").click({ force: true })
    cy.getByTestId("node-lat-input")
      .clear()
      .type("-50")
    cy.getByTestId("node-lng-input")
      .clear()
      .type("-150")
    cy.submitModal()

    cy.store()
      .its("state.nodes")
      .then(nodes => {
        nodes = Object.values(nodes)
        nodes.forEach(node => {
          if (node.mapCoordinates && node.mapCoordinates.lat != "") {
            cy.getByTestId(`nodes-list-item-${node.id}`).should("be.visible")
            cy.getByTestId(`nodes-list-item-${node.id}`).click()
            cy.get(".vue2leaflet-map")
              .get(".btn > h6")
              .click({ force: true })
            cy.lightbox().should("be.visible")
            cy.closeLightbox()
          }
        })
      })
  })

  it("should be able to delete nodes and see marker gone", () => {
    cy.get(".card-body")
      .eq(1)
      .contains("Edit")
      .click()
    cy.contains("Delete Node").click()
    cy.get(".leaflet-marker-icon").should($p => {
      expect($p).to.have.length(0)
    })

    cy.store()
      .its("state.nodes")
      .should(nodes => {
        expect(Object.keys(nodes)).to.have.length(1)
      })
  })

  it("can add new nodes", () => {
    cy.contains("Add new node").click()
    const newNode = {
      title: "new node",
      mediaType: "text",
      textContent: "content",
    }

    cy.getByTestId(`node-title`).type(newNode.title)
    cy.getEditable(`node-text-content`).type(newNode.textContent)
    cy.submitModal()

    cy.store()
      .its("state.nodes")
      .should(nodes => {
        expect(Object.keys(nodes)).to.have.length(3)
      })

    cy.get(".nodes-list")
      .contains(newNode.title)
      .should("be.visible")
  })
})
