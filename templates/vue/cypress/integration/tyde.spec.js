describe("TYDE", () => {
  const notEarnedIcon =
    "https://cdn.imgbin.com/11/2/4/imgbin-cyanide-happiness-satire-iran" +
    "-cyanide-and-happiness-PRxa77GZR5WSHJzh85PDGEESy.jpg"

  const earnedIcon =
    "https://img.favpng.com/13/0/15/cyanide-happiness-character-drawing" +
    "-png-favpng-pnWdvwDziWgdHuQjEjgtWjXEv.jpg"

  const notEarnedCockpitIcon =
    "https://lh3.googleusercontent.com/proxy/EfGXb_q2dzJt5VBgQuXuNjJGwLWO0tlSdVz5gTalgRNzkiso3HtplzRhGOpyYsaS4-4kZuda4SUewK0UcnhJPfYmuDzIp1Ohyg"

  const earnedCockpitIcon =
    "https://www.clipartmax.com/png/middle/29-292956_world-globe-clip-art-clipart-2-wikiclipart-wikiclipart-transparent-background-earth-clipart.png"

  const hoverCockpitIcon =
    "https://www.clipartmax.com/png/middle/29-292956_world-globe-clip-art-clipart-2-wikiclipart-wikiclipart-transparent-background-earth-clipart.png"

  describe("Module Creation", () => {
    it("Should allow creation of a Module from the root node", () => {
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

    it("Should allow creation of a Stage node from a module", () => {
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

    it("Should allow creation of a Question Set from a stage", () => {
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

    it("Should allow creation of a regular node (subtopic) from a question set", () => {
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

  describe("Progress and Completion", () => {
    it("Should update show module earned part when all question sets are complete", () => {
      cy.fixture("tyde/one-question-set.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.getBySrc(earnedIcon).should("not.exist")
      cy.getBySrc(notEarnedIcon).should("exist")
      cy.getNodeByTitle("Question Set 1").then(node => {
        // Use viewing the question set as a proxy for node completion
        cy.getNodeById(node.id).click()
        cy.openLightbox(node.id)
        cy.getBySrc(earnedIcon).should("exist")
        cy.getBySrc(notEarnedIcon).should("not.exist")
      })
    })

    it("Should show stage progress in the module content", () => {
      cy.fixture("tyde/two-stages.json").as("mixedProgress")
      cy.setup("@mixedProgress")

      cy.getNodeByTitle("Module 1").then(module => {
        // Should show when a single stage is completed
        cy.getNodeByTitle("Stage 1").then(stage1 =>
          cy.getNodeById(stage1.id).click()
        )
        cy.getNodeByTitle("Question Set 1").then(node => {
          cy.getNodeById(node.id).click()
          cy.openLightbox(node.id)
          cy.closeLightbox()
          cy.getByTestId(`open-node-${module.id}`).click()
          cy.getByTestId("tyde-stage-star").should("exist")

          // Next button should go to next stage
          cy.getByTestId("tyde-stage-next-button").click()
          cy.contains(/Stage 2/i).should("be.visible")
          cy.contains(/Question Set 2/i).should("be.visible")
          cy.contains(/Question Set 3/i).should("be.visible")
          cy.contains(/0\/2/i).should("exist")

          // Prev button should go to the previous stage
          cy.getByTestId("tyde-stage-prev-button").click()
          cy.contains(/Stage 1/i).should("be.visible")
          cy.getByTestId("tyde-stage-close-button").click()

          // Next button should progress past stage 2 once it's complete
          cy.getNodeByTitle("Stage 2").then(stage2 => {
            cy.getNodeById(stage2.id).scrollIntoView()
            cy.getNodeById(stage2.id).click()
            cy.getNodeByTitle("Question Set 2").then(node => {
              cy.getNodeById(node.id).click()
              cy.openLightbox(node.id)
              cy.closeLightbox()
              cy.getNodeByTitle("Question Set 3").then(node => {
                cy.getNodeById(node.id).click()
                cy.openLightbox(node.id)
                cy.closeLightbox()
                cy.getNodeById(node.id).click()
                cy.getByTestId(`open-node-${module.id}`).click()
                cy.getByTestId("tyde-stage-next-button").click()
                cy.getByTestId("tyde-stage-next-button").click()
                cy.getNodeById(node.id).should("be.visible")
              })
            })
          })
        })
      })
    })

    it("Should show correct progress for an uncompleted stage", () => {
      cy.fixture("tyde/two-stages.json").as("mixedProgress")
      cy.setup("@mixedProgress")
      cy.getNodeByTitle("Module 1").then(module => {
        cy.getNodeById(module.id).click()
        cy.getByTestId(`open-node-${module.id}`).click()
        cy.getBySrc(notEarnedIcon).should("be.visible")
        cy.contains(/Stage 1/i).should("be.visible")
        cy.contains(/Question Set 1/i).should("be.visible")
        cy.contains(/0\/1/i).should("exist")
        cy.getByTestId("tyde-stage-close-button").click()
      })
    })
  })

  describe("Spaceship/Cockpit", () => {
    it("Should navigate from map to spaceship and back", () => {
      cy.fixture("one-node.json").as("oneNode")
      cy.setup("@oneNode")
      cy.openSpaceship()
      cy.closeSpaceship()
      cy.openSpaceship()
    })

    it("Should use the escape key for navigation", () => {
      cy.fixture("one-node.json").as("oneNode")
      cy.setup("@oneNode")
      cy.get("[id=tyde]").trigger("keydown", { code: "Escape" })
      cy.getByTestId("tyde-map-button").should("be.visible")
      cy.get("[id=tyde]").trigger("keydown", { code: "Escape" })
      cy.getByTestId("tyde-map-button").should("not.be.visible")
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
        cy.getByBackground(notEarnedCockpitIcon).should("be.visible")
      })
    })

    it("Should show favourite items in the cockpit and allow removal", () => {
      cy.fixture("tyde/one-question-set.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.openSpaceship()
      cy.getByTestId("tyde-favourites-button").click()
      cy.contains(/You have not added any items to your favourites./i).should(
        "exist"
      )
      cy.closeSpaceship()
      cy.getNodeByTitle("Question Set 1").then(node => {
        cy.getNodeById(node.id).click()
        cy.openLightbox(node.id)
        cy.getByTestId("favourite-button").click()
        cy.closeLightbox()
        cy.openSpaceship()
        cy.getByTestId("tyde-favourites-button").click()
        cy.contains(/Question Set 1/i).should("exist")
        cy.getByTestId("tyde-unfavourite").click()
        cy.contains(/Yes/i).click()
        cy.contains(/You have not added any items to your favourites/i).should(
          "exist"
        )
      })
    })

    it("Should show help info in the cockpit", () => {
      cy.fixture("one-node.json").as("oneNode")
      cy.setup("@oneNode")
      cy.openSpaceship()
      cy.getByTestId("tyde-help-button").click()
      cy.contains(/ask@tyde.ca/i).should("exist")
    })

    it.only("Should navigate to the summary view when clicking a completed module", () => {
      cy.fixture("tyde/one-question-set-part-images.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.getNodeByTitle("Question Set 1").then(node => {
        cy.getNodeById(node.id).click()
        cy.openLightbox(node.id)
        cy.getByTestId("favourite-button").click()
        cy.closeLightbox()
      })
      cy.openSpaceship()
      cy.getByBackground(earnedCockpitIcon).click()
      cy.getBySrc(earnedIcon).should("exist")
      cy.contains(/Module 1/i).should("be.visible")
      cy.contains(/Stage 1/i).should("be.visible")
      cy.contains(/Question Set 1/i).should("be.visible")
      cy.contains(/Activities/i).click()
      // TODO: fix activity add bug and test for activities
      cy.contains(/Favourites/i).click()
      cy.contains(/Question Set 1/).should("be.visible")
    })
  })
})
