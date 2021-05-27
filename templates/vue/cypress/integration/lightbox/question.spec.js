describe("Question", () => {
  beforeEach(() => {
    cy.fixture("one-node.json").as("oneNode")
  })

  it("should be able to complete with a radio answer", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `What is 5 + 5?`

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-multiple-choice").click({ force: true })
      cy.getByTestId("question-answer-multipleChoice-single").click({ force: true })
      cy.getByTestId(`choicerow-radio-50`).getByTestId(`choicerow-radio-input-50`).click().type("100")
      cy.getByTestId(`choicerow-radio-51`).getByTestId(`choicerow-radio-input-51`).click().type("90")
      cy.getByTestId(`choicerow-radio-52`).getByTestId(`choicerow-radio-input-52`).click().type("10")

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
           cy.getByTestId(`invalid-feedback`).should("be.visible")
           cy.getByTestId(`user-choicerow-radio-52`).getByTestId(`user-choicerow-radio-checked-52`).click({ force: true })

           cy.contains(/submit/i).click()
           cy.contains(/submitting/i).should("be.visible")

           cy.wait("@submit")

           cy.contains("Thanks!").should("be.visible")
           cy.contains(/done/i).click()
        })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to complete with a checkbox answer", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `What is 1 + 1?`

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-multiple-choice").click({ force: true })
      cy.getByTestId(`choicerow-checkbox-1`).getByTestId(`choicerow-checkbox-input-1`).click().type("1")
      cy.getByTestId(`choicerow-checkbox-2`).getByTestId(`choicerow-checkbox-input-2`).click().type("2")
      cy.getByTestId(`choicerow-checkbox-3`).getByTestId(`choicerow-checkbox-input-3`).click().type("3")

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
           cy.getByTestId(`invalid-feedback`).should("be.visible")
           cy.getByTestId(`user-choicerow-checkbox-2`).getByTestId(`user-choicerow-checkbox-checked-2`).click({ force: true })

           cy.contains(/submit/i).click()
           cy.contains(/submitting/i).should("be.visible")

           cy.wait("@submit")

           cy.contains("Thanks!").should("be.visible")
           cy.contains(/done/i).click()
        })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to complete with a checkbox answer with images", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `What is 1 + 1?`

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-multiple-choice").click({ force: true })
      cy.getByTestId(`choicerow-checkbox-1`).getByTestId(`choicerow-checkbox-input-1`).click().type("1")
      cy.getByTestId(`choicerow-checkbox-2`).getByTestId(`choicerow-checkbox-input-2`).click().type("2")
      cy.getByTestId(`choicerow-checkbox-3`).getByTestId(`choicerow-checkbox-input-3`).click().type("3")

      cy.getByTestId('multiplechoice-thumbnail').click({ force: true })

      cy.server()
      cy.route("POST", "**/async-upload.php").as("upload")
      cy.getByTestId("choicerow-checkbox-thumbnail-1").getByTestId("import-file-input").attachFile("reddit.png")

      cy.wait("@upload")
        .its("response.body.data.url")
        .then(() => {
          cy.get("No image").should("not.exist")
          cy.get(".alert-success").should("exist")
          cy.server()
          cy.route("POST", "**/async-upload.php").as("upload")
          cy.getByTestId("choicerow-checkbox-thumbnail-2").getByTestId("import-file-input").attachFile("reddit.png")
          
            cy.wait("@upload")
               .its("response.body.data.url")
               .then(() => {
                  cy.get("No image").should("not.exist")
                  cy.get(".alert-success").should("exist")
                  cy.server()
                  cy.route("POST", "**/async-upload.php").as("upload")
                  cy.getByTestId("choicerow-checkbox-thumbnail-3").getByTestId("import-file-input").attachFile("reddit.png")
    
                  cy.wait("@upload")
                  .its("response.body.data.url")
                  .then(() => {  
                    
                    cy.get("No image").should("not.exist")
                    cy.get(".alert-success").should("exist")
                    cy.submitModal()
                    cy.openLightbox(node.id)

                    cy.route("POST", "**/quiz*").as("submit")

                    cy.lightbox().within(() => {
                    cy.getByTestId('user-choicerow-checkbox-thumbnail-1').should("be.visible")
                    cy.getByTestId(`invalid-feedback`).should("exist")
                    cy.getByTestId(`user-choicerow-checkbox-2`).getByTestId(`user-choicerow-checkbox-checked-2`).click({ force: true })

                    cy.contains(/submit/i).click()
                    cy.contains(/submitting/i).should("be.visible")

                    cy.wait("@submit")

                    cy.contains("Thanks!").should("be.visible")
                    cy.contains(/done/i).click()
                    })
                    cy.lightbox().should("not.exist")

                   })          
               })
          })
        })
    })
  
    it("should be able to complete with a radio answer with images", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `What is 5 + 5?`

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-multiple-choice").click({ force: true })
      cy.getByTestId("question-answer-multipleChoice-single").click({ force: true })
      cy.getByTestId(`choicerow-radio-50`).getByTestId(`choicerow-radio-input-50`).click().type("4")
      cy.getByTestId(`choicerow-radio-51`).getByTestId(`choicerow-radio-input-51`).click().type("8")
      cy.getByTestId(`choicerow-radio-52`).getByTestId(`choicerow-radio-input-52`).click().type("10")

      cy.getByTestId('multiplechoice-thumbnail').click({ force: true })

      cy.server()
      cy.route("POST", "**/async-upload.php").as("upload")
      cy.getByTestId("choicerow-radio-thumbnail-50").getByTestId("import-file-input").attachFile("reddit.png")

      cy.wait("@upload")
        .its("response.body.data.url")
        .then(() => {
          cy.get("No image").should("not.exist")
          cy.get(".alert-success").should("exist")
          cy.server()
          cy.route("POST", "**/async-upload.php").as("upload")
          cy.getByTestId("choicerow-radio-thumbnail-51").getByTestId("import-file-input").attachFile("reddit.png")
          
            cy.wait("@upload")
               .its("response.body.data.url")
               .then(() => {
                  cy.get("No image").should("not.exist")
                  cy.get(".alert-success").should("exist")
                  cy.server()
                  cy.route("POST", "**/async-upload.php").as("upload")
                  cy.getByTestId("choicerow-radio-thumbnail-52").getByTestId("import-file-input").attachFile("reddit.png")
    
                  cy.wait("@upload")
                  .its("response.body.data.url")
                  .then(() => {  
                    
                    cy.get("No image").should("not.exist")
                    cy.get(".alert-success").should("exist")
                    cy.submitModal()
                    cy.openLightbox(node.id)

                    cy.route("POST", "**/quiz*").as("submit")

                    cy.lightbox().within(() => {
                    cy.getByTestId('user-choicerow-radio-thumbnail-50').should("be.visible")
                    cy.getByTestId(`invalid-feedback`).should("exist")
                    cy.getByTestId(`user-choicerow-radio-52`).getByTestId(`user-choicerow-radio-checked-52`).click({ force: true })

                    cy.contains(/submit/i).click()
                    cy.contains(/submitting/i).should("be.visible")

                    cy.wait("@submit")

                    cy.contains("Thanks!").should("be.visible")
                    cy.contains(/done/i).click()
                    })
                    cy.lightbox().should("not.exist")

                   })          
               })
          })
        })
    })

  it("should be able to complete with a text-based answer", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `What's your name?`
      const placeholder = "placeholder"
      const answer = "Tapestry"

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.getByTestId("question-answer-text").click({ force: true })
      cy.getByTestId("question-answer-text-single").click({ force: true })
      cy.getByTestId("question-answer-text-single-placeholder").type(placeholder)

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.route("POST", "**/quiz*").as("submit")

      cy.lightbox().within(() => {
        cy.get(`[placeholder="${placeholder}"]`).should("be.visible")
        cy.get("input").type(answer)

        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

  it("should be able to complete with an audio-based answer", () => {
    cy.setup("@oneNode")

    cy.getSelectedNode().then(node => {
      cy.openModal("edit", node.id)
      cy.changeMediaType("question")

      const question = `What's your name?`

      cy.contains(/question text/i).click()
      cy.focused().type(question)
      cy.contains(/audio/i).click()

      cy.submitModal()
      cy.openLightbox(node.id)

      cy.contains(/microphone access/i, { timeout: 10000 }).should("not.exist")

      cy.clock()

      cy.getByTestId("record").click()

      cy.tick(5 * 1000) // move forward by 5 seconds
      cy.contains("0:05").should("be.visible")

      cy.getByTestId("record").click() // pause
      cy.tick(5 * 1000)
      cy.contains("0:05").should("be.visible")

      cy.getByTestId("record").click() // resume

      cy.tick(3600 * 1000) // move forward by 1 hour
      cy.contains("1:00:05").should("be.visible")

      cy.route("POST", "**/quiz*").as("submit")

      cy.contains(/done/i).click()
      cy.lightbox().within(() => {
        cy.get("audio").should("be.visible")
        cy.contains(/submit/i).click()
        cy.contains(/submitting/i).should("be.visible")

        cy.wait("@submit")

        cy.contains("Thanks!").should("be.visible")
        cy.contains(/done/i).click()
      })
      cy.lightbox().should("not.exist")
    })
  })

})
