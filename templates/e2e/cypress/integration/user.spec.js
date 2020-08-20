import { setup, cleanup } from "../support/utils"

describe("User", () => {
  beforeEach(() => {
    cy.fixture("user.json").as("tapestry")
    setup("@tapestry", "public")
  })

  afterEach(cleanup)

  describe("General", () => {
    it("Should be able to view nodes", () => {
      cy.store()
        .its("nodes")
        .then(nodes =>
          nodes.forEach((_, idx) => cy.getDOMNodeByIndex(idx).should("be.visible"))
        )
    })

    it("Should be able to click on media icon to open lightbox", () => {
      cy.getNodeByIndex(0)
        .openLightbox()
        .should("be.visible")
    })

    it("Should display lightbox in fullscreen if item is a fullscreen item", () => {
      cy.findNode(node => node.fullscreen)
        .openLightbox()
        .find(".content")
        .then(el => {
          const box = el.get(0).getBoundingClientRect()
          cy.window()
            .its("innerWidth")
            .should("equal", box.width)
        })
    })
  })

  describe("Content types", () => {
    it("Should be able to view text node", () => {
      cy.findNode(node => node.mediaType === "text").then(node => {
        cy.openLightbox(node.id)
          .contains(node.typeData.textContent)
          .should("exist")
      })
    })

    it("Should be able to view video node", () => {
      cy.findNode(node => node.mediaFormat === "mp4").then(node => {
        cy.openLightbox(node.id)
          .find("video")
          .should("have.attr", "src")
          .should("equal", node.typeData.mediaURL)
      })
    })

    it("Should be able to view h5p node", () => {
      cy.findNode(node => node.mediaFormat === "h5p").then(node => {
        cy.openLightbox(node.id)
          .find("#h5p")
          .should("have.attr", "src")
          .should("equal", node.typeData.mediaURL)
      })
    })

    describe("External links", () => {
      it("Should show embedded webpage if external link is embedded", () => {
        cy.findNode(
          node => node.mediaType === "url-embed" && node.behaviour === "embed"
        ).then(node => {
          cy.openLightbox(node.id)
            .find("iframe")
            .should("have.attr", "src")
            .should("include", node.typeData.mediaURL)
        })
      })
      it("Should show preview metadata if external link is not embedded", () => {
        cy.findNode(
          node => node.mediaType === "url-embed" && node.behaviour === "new-window"
        ).then(node => {
          expect(node.typeData.linkMetadata).to.not.be.null

          const { linkMetadata } = node.typeData
          cy.openLightbox(node.id).within(() => {
            cy.contains(linkMetadata.title).should("exist")
            cy.contains(linkMetadata.description).should("exist")
          })
        })
      })
    })
  })

  describe("Quiz", () => {
    beforeEach(() => {
      cy.findNode(node => node.mediaFormat === "mp4" && node.quiz).openLightbox()
      cy.contains(/question/i).click({ force: true })
    })

    it("Should be able to complete a gravity form quiz", () => {
      cy.contains(/text/i).click({ force: true })
      cy.get("form").within(() => {
        cy.get("input[type=text]").type("Dave")
        cy.get("input[type=submit]").click({ force: true })
      })
      cy.get(".completion-screen").should("be.visible")
    })
  })
})
