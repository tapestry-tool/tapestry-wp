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

const TEST_TAPESTRY_NAME = "cypress"

describe("Author side", () => {
  before(() => cy.addTapestry(TEST_TAPESTRY_NAME))

  after(() => cy.deleteTapestry(TEST_TAPESTRY_NAME))

  beforeEach(() => {
    cy.login("admin")
    visitTapestry(TEST_TAPESTRY_NAME)
    // Wait for tapestry to load
    cy.contains(/loading/i).should("not.exist")
  })

  describe("Basic Node Management", function() {
    after(() => {
      cy.getNodeByIndex(0).addChild({
        title: "Child 2",
        description: "I am a child 2",
        mediaType: "text",
        textContent: "Abcd",
      })
    })

    it("Should be able to add and see a root node", () => {
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

    it("Should be able to open content with the media button", () => {
      getStore()
        .its("state.nodes.0.id")
        .then(id => cy.openLightbox(id).should("exist"))
    })

    it("Should be able to open author menu with the edit button", () => {
      getStore()
        .its("state.nodes.0.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/edit node/i).should("exist")
        })
    })

    it("Should be able to open new node menu with the add button", () => {
      getStore()
        .its("state.nodes.0.id")
        .then(id => {
          openAddNodeModal(id)
          cy.contains(/add/i).should("exist")
        })
    })

    it("Should be able to add child nodes", () => {
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
      nodes.forEach(node => cy.getNodeByIndex(0).addChild(node))
    })

    // Skip this test and the next because of incompatibility between D3 and Cypress
    // it("Should be able to add a link between two nodes", () => {})

    // it("Should be able to delete a link if the connected nodes have at least one other link connected to them", () => {})

    it("Should be able to delete a leaf node", () => {
      getStore()
        .its("state.nodes.2.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/delete/i).click()
          getNode(id).should("not.exist")
        })
    })
  })

  describe("Node content", () => {
    it("Should be able to edit content fields and see the changes applied", () => {
      const newTitle = "New root!"
      getStore()
        .its("state.nodes.0")
        .then(root => {
          const oldTitle = root.title

          openEditNodeModal(root.id)
          getByTestId("node-title")
            .clear()
            .type(newTitle)
          submitModal()

          cy.contains(oldTitle).should("not.exist")
          cy.contains(newTitle).should("exist")
        })
    })

    describe("Media Types", function() {
      beforeEach(function() {
        getStore()
          .its("state.nodes.2.id")
          .then(id => {
            openEditNodeModal(id)
            cy.wrap(id).as("id")
          })
      })

      const setup = mediaType => {
        getByTestId("node-mediaType").select(mediaType)
        cy.server()
        cy.route("PUT", `${API_URL}/tapestries/**/nodes/*`).as("editNode")
      }

      it("Should be able to add a text node and verify that the text matches what was entered", function() {
        setup("text")

        const content = "Hello world!"
        getByTestId("node-textContent")
          .clear()
          .type(content)
        submitModal()

        cy.wait("@editNode")
        cy.openLightbox(this.id)
        cy.contains(content).should("exist")
      })

      it("Should be able to add a video url and length and have the video load", function() {
        setup("video")
        const url =
          "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        const duration = 15
        getByTestId("node-videoUrl")
          .clear()
          .type(url)
        getByTestId("node-videoDuration")
          .clear()
          .type(duration)
        submitModal()

        cy.wait("@editNode")
        cy.openLightbox(this.id)
        cy.get("video").should("have.attr", "src", url)
      })

      it("Should be able to add a quiz to a video and have that quiz appear at the end of the video", function() {
        setup("video")

        cy.contains(/quiz/i).click()
        getByTestId("add-question-checkbox").click({ force: true })
        getByTestId(`question-title-0`)
          .clear()
          .type("What's your name?")
        getByTestId(`question-answer-textbox-0`)
          .click()
          .within(() => {
            cy.contains(/test form/i).click()
          })
        submitModal()

        cy.wait("@editNode")
        cy.openLightbox(this.id)
        cy.get("video").then(el => {
          el.get(0).currentTime = 15
          cy.contains(/take quiz/i).click()
          cy.contains(/text/i)
            .parent()
            .click()
          cy.contains(/what's your name/i).should("exist")
        })
      })

      it("Should be able to add a Gravity Form and have the form be visible", function() {
        setup("gravity-form")

        getByTestId("combobox-gravity-form")
          .click()
          .within(() => {
            cy.contains(/test form/i).click()
          })
        submitModal()

        cy.wait("@editNode")
        cy.openLightbox(this.id)
        cy.contains(/what's your name/i).should("exist")
      })

      // Skipping because of drag and drop
      // it("Should be able to upload content to an external link node and have that content be visible", () => {})

      it("Should be able to add an external link node and have it show a summary of the external page", function() {
        setup("url-embed")

        const url =
          "https://levelup.gitconnected.com/5-javascript-tricks-that-are-good-to-know-78045dea6678"
        const title = "5 JavaScript Tricks That Are Good To Know"
        getByTestId("node-linkUrl").within(() => {
          cy.get("[name=text-input]")
            .clear()
            .type(url)
        })
        getByTestId("node-linkBehaviour-new-window").click({ force: true })
        submitModal()

        cy.wait("@editNode")
        cy.openLightbox(this.id)
        cy.contains(title).should("exist")
      })
    })
  })

  describe("Node appearance", () => {
    describe("Appearance options", () => {
      beforeEach(() => {
        getStore()
          .its("state.nodes.0.id")
          .then(id => {
            openEditNodeModal(id)
            cy.contains(/appearance/i).click()
          })
      })

      // uncheck hidden options when done
      after(() => {
        visitTapestry(TEST_TAPESTRY_NAME)
        getStore()
          .its("state.nodes.0.id")
          .then(id => {
            openEditNodeModal(id)
            cy.contains(/appearance/i).click()
          })
        const ids = ["hide-title", "hide-progress", "hide-media"]
        ids.forEach(id => {
          getByTestId(`node-appearance-${id}`).uncheck({ force: true })
        })
      })

      const setup = prop => {
        getByTestId(`node-appearance-${prop}`).check({ force: true })
        submitModal()
      }

      it("Should show a thumbnail if a thumbnail url is passed", () => {
        const url =
          "https://image.shutterstock.com/z/stock-photo-colorful-flower-on-dark-tropical-foliage-nature-background-721703848.jpg"

        getByTestId("node-appearance-add-thumbnail").check({ force: true })
        getByTestId("node-imageUrl").within(() => {
          cy.get('[name="text-input"]')
            .clear()
            .type(url)
        })
        submitModal()

        getStore()
          .its("state.nodes.0.id")
          .then(id => {
            getNode(id)
              .get("image")
              .should("have.attr", "href")
              .should("equal", url)
          })
      })

      it("Should hide node title", () => {
        setup("hide-title")
        getStore()
          .its("state.nodes.0.id")
          .then(id =>
            getNode(id).within(() => {
              cy.get(".meta").should("not.exist")
            })
          )
      })

      it("Should hide progress bar", () => {
        setup("hide-progress")
        getStore()
          .its("state.nodes.0.id")
          .then(id =>
            getNode(id).within(() => {
              cy.get("path").should("not.exist")
            })
          )
      })

      it("Should hide media button", () => {
        setup("hide-media")
        getStore()
          .its("state.nodes.0.id")
          .then(id => getMediaButton(id).should("be.hidden"))
      })
    })

    it("Should be able to open lightbox by clicking on center of node if media button is hidden", () => {
      cy.server()
      cy.route("PUT", `${API_URL}/tapestries/**/nodes/*`).as("editNode")

      cy.getNodeByIndex(0)
        .its("id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/appearance/i).click()
          getByTestId(`node-appearance-hide-media`).check({ force: true })
          submitModal()

          cy.wait("@editNode")
          getNode(id).click()
          cy.get("#lightbox").should("exist")
        })
    })
  })

  describe("Node permissions", () => {
    it("Should hide node and associated links if user does not have read access", () => {
      getStore()
        .its("state.nodes.1.id")
        .then(id => {
          cy.server()
          cy.route("PUT", `${API_URL}/tapestries/**/*`).as("putRequest")

          openEditNodeModal(id)
          cy.contains(/permissions/i).click()
          getByTestId("node-permissions-public-read").uncheck({ force: true })
          submitModal()

          cy.wait(["@putRequest", "@putRequest"])

          cy.logout()
          visitTapestry(TEST_TAPESTRY_NAME)

          getNode(id).should("not.exist")
        })
    })

    it("Should hide edit button if user does not have write access", () => {
      getStore()
        .its("state.nodes.1.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/permissions/i).click()
          getByTestId("node-permissions-public-read").check({ force: true })
          getByTestId("node-permissions-authenticated-edit").check({ force: true })
          submitModal()

          cy.logout()
          visitTapestry(TEST_TAPESTRY_NAME)
          getNode(id).click({ force: true })
          getEditNodeButton(id).should("not.exist")

          cy.login("subscriber")
          visitTapestry(TEST_TAPESTRY_NAME)
          getNode(id).click({ force: true })
          getEditNodeButton(id).should("exist")
        })
    })

    it("Should hide add button if user does not have add access", () => {
      getStore()
        .its("state.nodes.1.id")
        .then(id => {
          openEditNodeModal(id)
          cy.contains(/permissions/i).click()
          getByTestId("node-permissions-authenticated-add").check({ force: true })
          submitModal()

          cy.logout()
          visitTapestry(TEST_TAPESTRY_NAME)
          getNode(id).click({ force: true })
          getAddNodeButton(id).should("not.exist")

          cy.login("subscriber")
          visitTapestry(TEST_TAPESTRY_NAME)
          getNode(id).click({ force: true })
          getAddNodeButton(id).should("exist")

          cy.logout()
        })
    })
  })
})
