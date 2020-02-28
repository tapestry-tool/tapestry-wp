/// <reference types="Cypress" />
import {
    API_URL,
    getStore,
    visitTapestry,
    getByTestId,
    openRootNodeModal,
    getModal,
    submitModal,
    openAddNodeModal,
    openEditNodeModal,
    getNode,
    getMediaButton,
    getEditNodeButton,
    getAddNodeButton,
  } from "../support/utils"  

const TEST_TAPESTRY_NAME = "testing"

describe("Author Testing", () => {
    before(() => {
        cy.login("admin")
        cy.contains("Tapestries").click()
        cy.get(".page-title-action").click()
        cy.get("#post-title-0").type(TEST_TAPESTRY_NAME, { force: true })
        cy.contains("Publish…").click()
        cy.get(".editor-post-publish-panel__header-publish-button button").click()
        cy.contains("is now live")
        visitTapestry(TEST_TAPESTRY_NAME)
        cy.contains("Add Root Node")
    })

    after(() => {
        cy.logout()
        cy.login("admin")
        cy.deleteTapestry(TEST_TAPESTRY_NAME)
    })

    beforeEach(() => {
        cy.logout()
        cy.login("admin")
        visitTapestry(TEST_TAPESTRY_NAME)
    })

    describe("Basic Node Management", () => {
        it("Add Root Node", () => {
            const node = {
              title: "Root",
              description: "I am a root node",
              mediaType: "text",
              textContent: "Abcd",
            }
      
            cy.server()
            cy.route("POST", `${API_URL}/tapestries/**/nodes`).as("postNode")
      
            openRootNodeModal()
            getModal().should("exist")
      
            getByTestId("node-title").type(node.title)
            getByTestId("node-description").type(node.description)
            getByTestId("node-mediaType").select(node.mediaType)
            getByTestId("node-textContent").type(node.textContent)
      
            submitModal()
            cy.wait("@postNode")
              .its("response.body.id")
              .then(id => {
                getModal().should("not.exist")
                getNode(id).should("exist")
                cy.contains(node.title).should("exist")
              })
        })
        
        it("Root Node is Visable and Draggable", () => {
            cy.get(".node")
            .trigger('mousedown', { which: 1 })
            .trigger('mousemove', { clientX: 100, clientY: 100 })
            .trigger('mouseup', { force: true })
        })

        it("Add Child Nodes", () => {
            const nodes = [
              {
                title: "Child 1",
                description: "I am a child 1",
                mediaType: "text",
                textContent: "Abcd",
              },
              {
                title: "Child 2",
                description: "I am a child 2",
                mediaType: "text",
                textContent: "Abcd",
              },
            ]
      
            getStore()
              .its("state.nodes.0.id")
              .then(rootId => {
                cy.server()
                nodes.forEach(node => {
                  cy.route("POST", `${API_URL}/tapestries/**/nodes`).as("postNode")
      
                  openAddNodeModal(rootId)
                  getByTestId("node-title").type(node.title)
                  getByTestId("node-description").type(node.description)
                  getByTestId("node-mediaType").select(node.mediaType)
                  getByTestId("node-textContent").type(node.textContent)
                  submitModal()
      
                  cy.wait("@postNode")
                    .its("response.body.id")
                    .then(id => {
                      getNode(id).should("exist")
                      cy.contains(node.title).should("exist")
                    })
                })
              })
          })
    })
})
