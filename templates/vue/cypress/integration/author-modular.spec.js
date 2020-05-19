describe("Authoring", () => {
  const setup = fixture => {
    cy.login("admin")
    if (fixture) {
      cy.get(fixture).then(tapestry => {
        cy.addTapestry(tapestry).visitTapestry()
      })
    } else {
      cy.addTapestry().visitTapestry()
    }
  }

  const cleanup = () => {
    cy.deleteTapestry()
  }

  beforeEach(() => {
    cy.fixture("authoring/node-management/root.json").as("oneNode")
    cy.fixture("authoring/node-management/two-nodes.json").as("twoNodes")
  })

  afterEach(cleanup)

  describe("Basic node management", () => {
    it("Should be able to add and see a root node", () => {
      setup()

      const node = {
        title: "Root",
        description: "I am a root node",
        mediaType: "text",
        textContent: "Abcd",
      }
      cy.addNode(node).should("exist")
      cy.contains(node.title).should("exist")
    })

    it("Should be able to open edit modal", () => {
      setup("@oneNode")

      cy.getNodeByIndex(0)
        .editNode()
        .should("exist")
    })

    it("Should be able to open add modal", () => {
      setup("@oneNode")

      cy.getNodeByIndex(0)
        .addNode()
        .should("exist")
    })

    it("Should be able to add child nodes", () => {
      setup("@oneNode")

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

      for (const node of nodes) {
        cy.getNodeByIndex(0)
          .addNode(node)
          .should("exist")
        cy.contains(node.title).should("exist")
      }
    })

    it("Should be able to open add modal", () => {
      setup("@oneNode")

      cy.getNodeByIndex(0)
        .addNode()
        .should("exist")
    })

    it("Should be able to delete a leaf node", () => {
      setup("@twoNodes")

      cy.getNodeByIndex(1).deleteNode()
      cy.getNodeByIndex(1).should("not.exist")
    })
  })

  describe("Node content", () => {
    it("Should be able to edit content fields and see the changes applied", () => {
      setup("@oneNode")

      const newNode = {
        title: "New root!",
      }
      cy.getNodeByIndex(0).then(node => {
        const oldTitle = node.title
        cy.getNodeByIndex(0).editNode(newNode)
        cy.contains(oldTitle).should("not.exist")
        cy.contains(newNode.title).should("exist")
      })
    })

    describe.only("Media types", () => {
      it("Should be able to add a text node and verify that the text matches what was entered", () => {
        setup("@oneNode")

        const newNode = {
          mediaType: "text",
          textContent: "Hello world!",
        }
        cy.getNodeByIndex(0)
          .editNode(newNode)
          .openLightbox()
          .contains(newNode.textContent)
          .should("exist")
      })

      it("Should be able to add a video url and length and have the video load", () => {
        setup("@oneNode")

        const newNode = {
          mediaType: "video",
          videoUrl:
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          videoDuration: 15,
        }
        cy.getNodeByIndex(0)
          .editNode(newNode)
          .openLightbox()
          .within(() => {
            cy.get("video").should("have.attr", "src", newNode.videoUrl)
          })
      })

      it.skip("Should be able to add a quiz to a video and have that quiz appear at the end of the video", () => {
        setup("@oneNode")

        const newNode = {
          mediaType: "video",
          videoUrl:
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          videoDuration: 15,
          quiz: [
            {
              title: "What's your name?",
              answerTypes: {
                textbox: 1,
              },
            },
          ],
        }

        cy.getNodeByIndex(0)
          .editNode(newNode) // TODO: Add support for quiz updates
          .openLightbox()
          .within(() => {
            cy.get("video").then(el => {
              el.get(0).currentTime = 15
              cy.contains(/take quiz/i).click()
              cy.contains(/text/i)
                .parent()
                .click()
              cy.contains(/what's your name/i).should("exist")
            })
          })

        /* cy.contains(/quiz/i).click()
        getByTestId("add-question-checkbox").click({ force: true })
        getByTestId(`question-title-0`)
          .clear()
          .type("What's your name?")
        getByTestId(`question-answer-textbox-0`)
          .click()
          .within(() => {
            cy.contains(/test form/i).click()
          })
        submitModal() */
      })
    })
  })
})
