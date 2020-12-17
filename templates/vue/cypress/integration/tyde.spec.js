describe("TYDE", () => {
  describe("Modules, Stages and Question Sets", () => {
    const notEarnedIcon =
      "https://cdn.imgbin.com/11/2/4/imgbin-cyanide-happiness-satire-iran" +
      "-cyanide-and-happiness-PRxa77GZR5WSHJzh85PDGEESy.jpg"

    const earnedIcon =
      "https://img.favpng.com/13/0/15/cyanide-happiness-character-drawing" +
      "-png-favpng-pnWdvwDziWgdHuQjEjgtWjXEv.jpg"

    it("Should allow creation of a module from the root node", () => {
      cy.fixture("one-node.json").as("oneNode")
      cy.setup("@oneNode")
      cy.getSelectedNode().then(node => {
        cy.openModal("add", node.id)
        cy.getByTestId(`node-title`).type("Module 1")
        cy.getByTestId(`node-media-type`).select("text")
        cy.getByTestId(`tyde-node-type`).select("Module")
        cy.getEditable(`node-text-content`).type("This is the main module.")
        cy.contains(/spaceship part/i).click()
        cy.getByTestId(`tyde-planet-not-earned-icon`).type(notEarnedIcon)
        cy.getByTestId(`tyde-planet-earned-icon`).type(earnedIcon)
        cy.submitModal()
        cy.getBySrc(earnedIcon).should("exist")
        cy.getBySrc(notEarnedIcon).should("not.exist")
      })
    })

    it("Should allow creation of a stage node from a module", () => {
      cy.fixture("tyde/one-module.json").as("oneModule")
      cy.setup("@oneModule")
      cy.getNodeByTitle("Module 1").then(node => {
        cy.openModal("add", node.id)
        cy.getByTestId(`node-title`).type("Stage 1")
        cy.getByTestId(`node-media-type`).select("text")
        cy.getByTestId(`tyde-node-type`).select("Stage")
        cy.getEditable(`node-text-content`).type(
          "This is the first stage for module 1."
        )
        cy.submitModal()
        cy.getBySrc(earnedIcon).should("exist")
        cy.getBySrc(notEarnedIcon).should("not.exist")
      })
    })

    it("Should allow creation of a question set from a stage", () => {
      cy.fixture("tyde/one-stage.json").as("oneStage")
      cy.setup("@oneStage")
      cy.getNodeByTitle("Stage 1").then(node => {
        cy.openModal("add", node.id)
        cy.getByTestId(`node-title`).type("Question Set 1")
        cy.getByTestId(`node-media-type`).select("text")
        cy.getByTestId(`tyde-node-type`).select("Question set")
        cy.getEditable(`node-text-content`).type(
          "This is the first question set for module 1 stage 1."
        )
        cy.submitModal()
        cy.getBySrc(earnedIcon).should("not.exist")
        cy.getBySrc(notEarnedIcon).should("exist")
      })
    })

    it("Should update show module earned part when all question sets are complete", () => {
      cy.fixture("tyde/one-question-set.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.getNodeByTitle("Question Set 1").then(node => {
        // Use viewing the question set as a proxy for node completion
        cy.getNodeById(node.id).click()
        cy.openLightbox(node.id)
        cy.getBySrc(earnedIcon).should("exist")
        cy.getBySrc(notEarnedIcon).should("not.exist")
      })
    })

    it("Should allow creation of a regular node from a question set", () => {
      cy.fixture("tyde/one-question-set.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.getSelectedNode().then(node => {
        cy.openModal("add", node.id)
        cy.getByTestId(`node-title`).type("Question 1")
        cy.getByTestId(`node-media-type`).select("text")
        cy.getByTestId(`tyde-node-type`).select("Regular")
        cy.getEditable(`node-text-content`).type("This is an example of a question.")
        cy.submitModal()
        cy.getBySrc(earnedIcon).should("not.exist")
        cy.getBySrc(notEarnedIcon).should("exist")
      })
    })
  })

  const notEarnedCockpitIcon =
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.clipartmax.com%2Fpng%2Fmiddle%2F10-106819_question-mark-pics-blue-question-mark-clip-art.png"

  const earnedCockpitIcon =
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.favpng.com%2F0%2F2%2F17%2Fgold-star-clip-art-png-favpng-HUwn8a7HfgvBr4pkhzq1vz64M.jpg"

  const hoverCockpitIcon =
    "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fclipartix.com%2Fwp-content%2Fuploads%2F2017%2F12%2FWorld-map-clip-art-at-vector-clip-art.png"

  describe("Spaceship", () => {
    it("Should navigate from map to spaceship and back", () => {
      cy.openSpaceship()
      cy.closeSpaceship()
      cy.openSpaceship()
      // Close using the escape key
      // FIXME
      //cy.window().trigger("keydown", { keycode: 27 })
      //cy.getByTestId("tyde-map-button").should("not.be.visible")
    })

    it("Should show spaceship parts in the cockpit", () => {
      cy.fixture("tyde/one-question-set.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.getNodeByTitle("Module 1").then(node => {
        cy.openModal("edit", node.id)
        cy.contains(/spaceship part/i).click()
        cy.getByTestId(`tyde-cockpit-not-earned-icon`).type(notEarnedCockpitIcon)
        cy.getByTestId(`tyde-cockpit-earned-icon`).type(earnedCockpitIcon)
        cy.getByTestId(`tyde-cockpit-hover-icon`).type(hoverCockpitIcon)
        cy.getByTestId("node-spaceship-part-x").type("40")
        cy.getByTestId("node-spaceship-part-y").type("40")
        cy.getByTestId("node-spaceship-part-width").type("20")
        cy.getByTestId("node-spaceship-part-height").type("20")
        cy.submitModal()
        cy.openSpaceship()
        cy.getByTestId("tyde-spaceship-part").should("be.visible")
      })
    })
  })
})
