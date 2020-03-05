/// <reference types="Cypress" />

import {
  visitTapestry,
  getStore,
  getNode,
  API_URL,
  findNode,
  getLightbox,
} from "../support/utils"

const TEST_TAPESTRY_NAME = Cypress.env("USER_TAPESTRY_NAME")

describe("User side", () => {
  beforeEach(() => {
    cy.server()
    cy.route("GET", `${API_URL}/tapestries/*`).as("loadTapestry")
    visitTapestry(TEST_TAPESTRY_NAME)
    cy.wait("@loadTapestry")
  })

  describe("General", () => {
    it("Should be able to view and drag nodes", () => {
      getStore()
        .its("state.nodes")
        .then(nodes =>
          nodes.forEach(node => {
            getNode(node.id).should("be.visible")
          })
        )
    })
    it("Should be able to click on media icon to open lightbox", () => {
      getStore()
        .its("state.nodes.0.id")
        .then(id => {
          cy.openLightbox(id).should("be.visible")
        })
    })
    it("Should display lightbox in fullscreen if item is a fullscreen item", () => {
      findNode(node => node.fullscreen).then(node => {
        cy.openLightbox(node.id)
          .find("#spotlight-content")
          .then(el => {
            const box = el[0].getBoundingClientRect()
            cy.window()
              .its("innerWidth")
              .should("equal", box.width)
          })
      })
    })
  })

  describe("Content types", () => {
    it("Should be able to view text node", () => {
      findNode(node => node.mediaType === "text").then(node => {
        cy.openLightbox(node.id)
          .contains(node.typeData.textContent)
          .should("exist")
      })
    })
    it("Should be able to view video node", () => {
      findNode(node => node.mediaFormat === "mp4" && !node.fullscreen).then(node => {
        cy.openLightbox(node.id)
          .find("source")
          .should("have.attr", "src")
          .should("equal", node.typeData.mediaURL)
      })
    })
    it("Should be able to view h5p node", () => {
      findNode(node => node.mediaFormat === "h5p").then(node => {
        cy.openLightbox(node.id)
          .find("#h5p")
          .should("have.attr", "src")
          .should("equal", node.typeData.mediaURL)
      })
    })

    describe("External links", () => {
      it("Should show embedded webpage if external link is embedded", () => {
        findNode(
          node => node.mediaType === "url-embed" && node.behaviour === "embed"
        ).then(node => {
          cy.openLightbox(node.id)
            .find("iframe")
            .should("have.attr", "src")
            .should("include", node.typeData.mediaURL)
        })
      })
      it("Should show preview metadata if external link is not embedded", () => {
        findNode(
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
      findNode(node => node.mediaFormat === "mp4" && !node.fullscreen).then(node => {
        cy.openLightbox(node.id)
          .find("video")
          .then(el => {
            const video = el[0]
            video.currentTime = 15
          })
        cy.get(".end-screen").should("be.visible")
        cy.contains(/take quiz/i).click()
        cy.get(".quiz-screen").should("be.visible")
      })
    })

    it("Should be able to complete a gravity form quiz", () => {
      getLightbox().within(() => {
        cy.contains(/text/i).click()
        cy.get("form").within(() => {
          cy.get("input[type=text]").type("Dave")
          cy.get("input[type=submit]").click()
        })
        cy.get(".quiz-screen").should("be.visible")
      })
    })
    it("Should be able to complete an h5p audio quiz", () => {
      getLightbox().within(() => {
        cy.contains(/audio/i).click()
        cy.get("iframe").should("be.visible")
      })
    })
  })
})
