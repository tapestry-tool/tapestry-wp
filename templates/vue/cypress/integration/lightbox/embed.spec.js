describe("External link", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
    cy.setup("@oneNode")
  })

  it("should be able to add an external link using the url input", () => {
    const newNode = {
      title: "5 JavaScript Tricks That Are Good To Know",
      url:
        "https://levelup.gitconnected.com/5-javascript-tricks-that-are-good-to-know-78045dea6678",
    }

    // Stub out external API call
    cy.intercept("GET", /api.linkpreview.net/, {
      body: {
        title: newNode.title,
        image: "",
        description: "hello world",
      },
    })

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("url-embed")
      cy.getByTestId(`node-link-url`).type(newNode.url)
      cy.contains(/new window/i).click()
      cy.submitModal()

      cy.openLightbox(node.id).within(() => {
        cy.contains(newNode.title).should("exist")
      })
    })
  })

  it("should be able to add an external link using the file upload", () => {
    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("url-embed")

      cy.intercept("POST", "**/async-upload.php").as("upload")

      cy.get("[name=async-upload]").attachFile("reddit.png")
      cy.wait("@upload")
        .then(({ response }) => {
          return JSON.parse(response.body).data.url
        })
        .then(url => {
          cy.getByTestId("node-link-url").should("have.value", url)
          cy.submitModal()

          cy.openLightbox(node.id)
          cy.get("iframe").should("have.attr", "src", url)
        })
    })
  })
})
