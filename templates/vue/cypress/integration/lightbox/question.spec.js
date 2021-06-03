describe("Question", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
  })

  it("should be able to complete drag and drop answer with items with no background image", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `Put Colors into the right bucket`
      const fromBucketLabel1 = "From bucket 1"
      const fromBucketLabel2 = "From bucket 2"
      const toBucketLabel1 = "Put red item here"
      const toBucketLabel2 = "Put blue item here"

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-dragdrop").click({ force: true })
      cy.getByTestId("from-bucket-label-1")
        .click({ force: true })
        .type(fromBucketLabel1)
      cy.getByTestId("bucket-item-backgroundcolor-1")
        .find(".swatch")
        .click()
        .find(`[aria-label="#E84B3C"]`)
        .click()
      cy.getByTestId("add-from-bucket-button").click({ force: true })
      cy.getByTestId("from-bucket-label-2")
        .click({ force: true })
        .type(fromBucketLabel2)
      cy.getByTestId("add-bucket-item-button-2").click({ force: true })
      cy.getByTestId("bucket-item-backgroundcolor-2")
        .find(".swatch")
        .click()
        .find(`[aria-label="#3398DB"]`)
        .click()
      cy.getByTestId("to-bucket-label-200")
        .click({ force: true })
        .type(toBucketLabel1)
      cy.getByTestId("add-to-bucket-button").click({ force: true })
      cy.getByTestId("to-bucket-label-201")
        .click({ force: true })
        .type(toBucketLabel2)

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
        //cy.get("input").type(answer)
        const dataTransfer = new DataTransfer()
        cy.getByTestId("user-bucket-item-1").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-to-bucket-200").trigger("drop", { dataTransfer })
        cy.getByTestId("user-bucket-item-2").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-to-bucket-201").trigger("drop", { dataTransfer })

        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to move items to different buckets in all directions in drag and drop answer mode", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `Put Colors into the right bucket`
      const fromBucketLabel1 = "From bucket 1"
      const fromBucketLabel2 = "From bucket 2"
      const toBucketLabel1 = "Put red item here"
      const toBucketLabel2 = "Put blue item here"

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-dragdrop").click({ force: true })
      cy.getByTestId("from-bucket-label-1")
        .click({ force: true })
        .type(fromBucketLabel1)
      cy.getByTestId("bucket-item-backgroundcolor-1")
        .find(".swatch")
        .click()
        .find(`[aria-label="#E84B3C"]`)
        .click()
      cy.getByTestId("add-from-bucket-button").click({ force: true })
      cy.getByTestId("from-bucket-label-2")
        .click({ force: true })
        .type(fromBucketLabel2)
      cy.getByTestId("add-bucket-item-button-2").click({ force: true })
      cy.getByTestId("bucket-item-backgroundcolor-2")
        .find(".swatch")
        .click()
        .find(`[aria-label="#3398DB"]`)
        .click()
      cy.getByTestId("to-bucket-label-200")
        .click({ force: true })
        .type(toBucketLabel1)
      cy.getByTestId("add-to-bucket-button").click({ force: true })
      cy.getByTestId("to-bucket-label-201")
        .click({ force: true })
        .type(toBucketLabel2)

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
        //cy.get("input").type(answer)
        const dataTransfer = new DataTransfer()
        cy.getByTestId("user-bucket-item-1").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-to-bucket-200").trigger("drop", { dataTransfer })
        cy.getByTestId("user-bucket-item-2").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-to-bucket-201").trigger("drop", { dataTransfer })
        cy.getByTestId("user-bucket-item-1").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-to-bucket-201").trigger("drop", { dataTransfer })
        cy.getByTestId("user-bucket-item-1").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-from-bucket-2").trigger("drop", { dataTransfer })
        cy.getByTestId("user-bucket-item-1").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-from-bucket-1").trigger("drop", { dataTransfer })
        cy.getByTestId("user-bucket-item-1").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-to-bucket-200").trigger("drop", { dataTransfer })

        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to complete drag and drop answer with items with background image and text ", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `Question Number 1`
      const fromBucketLabel1 = "From bucket 1"
      const fromBucketLabel2 = "From bucket 2"
      const toBucketLabel1 = "To bucket 1"
      const toBucketLabel2 = "To bucket 2"

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-dragdrop").click({ force: true })
      cy.getByTestId("from-bucket-label-1")
        .click({ force: true })
        .type(fromBucketLabel1)

      cy.getByTestId("bucket-item-useimage-1").click({ force: true })
      cy.server()
      cy.route("POST", "**/async-upload.php").as("upload")

      cy.getByTestId("bucket-item-thumbnail-1")
        .getByTestId("import-file-input")
        .attachFile("reddit.png")

      cy.getByTestId("add-from-bucket-button").click({ force: true })
      cy.getByTestId("from-bucket-label-2")
        .click({ force: true })
        .type(fromBucketLabel2)
      cy.getByTestId("add-bucket-item-button-2").click({ force: true })

      cy.getByTestId("bucket-item-useimage-2").click({ force: true })
      cy.getByTestId("bucket-item-thumbnail-2")
        .getByTestId("import-file-input")
        .attachFile("reddit.png")

      cy.getByTestId("bucket-item-usetext-1").click({ force: true })
      cy.getByTestId("bucket-item-text-1").type("item 1")
      cy.getByTestId("bucket-item-usetext-2").click({ force: true })
      cy.getByTestId("bucket-item-text-2").type("item 2")

      cy.getByTestId("to-bucket-label-200")
        .click({ force: true })
        .type(toBucketLabel1)
      cy.getByTestId("add-to-bucket-button").click({ force: true })
      cy.getByTestId("to-bucket-label-201")
        .click({ force: true })
        .type(toBucketLabel2)

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
        //cy.get("input").type(answer)
        const dataTransfer = new DataTransfer()
        cy.getByTestId("user-bucket-item-1").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-to-bucket-200").trigger("drop", { dataTransfer })
        cy.getByTestId("user-bucket-item-2").trigger("dragstart", { dataTransfer })
        cy.getByTestId("user-to-bucket-201").trigger("drop", { dataTransfer })

        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  // it("should be able to complete with a text-based answer", () => {
  //   cy.setup("@oneNode")

  //   cy.getSelectedNode().then(node => {
  //     cy.openModal("edit", node.id)
  //     cy.changeMediaType("question")

  //     const question = `What's your name?`
  //     const placeholder = "placeholder"
  //     const answer = "Tapestry"

  //     cy.contains(/question text/i).click()
  //     cy.focused().type(question)
  //     cy.getByTestId("question-answer-text").click({ force: true })
  //     cy.getByTestId("question-answer-text-single").click({ force: true })
  //     cy.getByTestId("question-answer-text-single-placeholder").type(placeholder)

  //     cy.submitModal()
  //     cy.openLightbox(node.id)

  //     cy.route("POST", "**/quiz*").as("submit")

  //     cy.lightbox().within(() => {
  //       cy.get(`[placeholder="${placeholder}"]`).should("be.visible")
  //       cy.get("input").type(answer)

  //       cy.contains(/submit/i).click()
  //       cy.contains(/submitting/i).should("be.visible")

  //       cy.wait("@submit")

  //       cy.contains("Thanks!").should("be.visible")
  //       cy.contains(/done/i).click()
  //     })
  //     cy.lightbox().should("not.exist")
  //   })
  // })

  // it("should be able to complete with an audio-based answer", () => {
  //   cy.setup("@oneNode")

  //   cy.getSelectedNode().then(node => {
  //     cy.openModal("edit", node.id)
  //     cy.changeMediaType("question")

  //     const question = `What's your name?`

  //     cy.contains(/question text/i).click()
  //     cy.focused().type(question)
  //     cy.contains(/audio/i).click()

  //     cy.submitModal()
  //     cy.openLightbox(node.id)

  //     cy.contains(/microphone access/i, { timeout: 10000 }).should("not.exist")

  //     cy.clock()

  //     cy.getByTestId("record").click()

  //     cy.tick(5 * 1000) // move forward by 5 seconds
  //     cy.contains("0:05").should("be.visible")

  //     cy.getByTestId("record").click() // pause
  //     cy.tick(5 * 1000)
  //     cy.contains("0:05").should("be.visible")

  //     cy.getByTestId("record").click() // resume

  //     cy.tick(3600 * 1000) // move forward by 1 hour
  //     cy.contains("1:00:05").should("be.visible")

  //     cy.route("POST", "**/quiz*").as("submit")

  //     cy.contains(/done/i).click()
  //     cy.lightbox().within(() => {
  //       cy.get("audio").should("be.visible")
  //       cy.contains(/submit/i).click()
  //       cy.contains(/submitting/i).should("be.visible")

  //       cy.wait("@submit")

  //       cy.contains("Thanks!").should("be.visible")
  //       cy.contains(/done/i).click()
  //     })
  //     cy.lightbox().should("not.exist")
  //   })
  // })
})
