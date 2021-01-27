describe("TYDE", () => {
  const cockpitBackgroundImage =
    "https://m.media-amazon.com/images/I/51h5kRXyipL._AC_.jpg"

  const icons = {
    notEarned:
      "https://cdn.imgbin.com/11/2/4/imgbin-cyanide-happiness-satire-iran" +
      "-cyanide-and-happiness-PRxa77GZR5WSHJzh85PDGEESy.jpg",
    earned:
      "https://img.favpng.com/13/0/15/cyanide-happiness-character-drawing" +
      "-png-favpng-pnWdvwDziWgdHuQjEjgtWjXEv.jpg",
    cockpit: {
      notEarned:
        "https://lh3.googleusercontent.com/proxy/EfGXb_q2dzJt5VBgQuXuNjJG" +
        "wLWO0tlSdVz5gTalgRNzkiso3HtplzRhGOpyYsaS4-4kZuda4SUewK0UcnhJPfYm" +
        "uDzIp1Ohyg",
      earned:
        "https://www.clipartmax.com/png/middle/29-292956_world-globe-clip" +
        "-art-clipart-2-wikiclipart-wikiclipart-transparent-background-ea" +
        "rth-clipart.png",
      hover:
        "https://www.clipartmax.com/png/middle/29-292956_world-globe-clip" +
        "-art-clipart-2-wikiclipart-wikiclipart-transparent-background-ea" +
        "rth-clipart.png",
    },
  }

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
        cy.getByTestId(`tyde-planet-not-earned-icon`).type(icons.notEarned)
        cy.getByTestId(`tyde-planet-earned-icon`).type(icons.earned)
        cy.submitModal()
        cy.getBySrc(icons.earned).should("exist")
        cy.getBySrc(icons.notEarned).should("not.exist")
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
        cy.getBySrc(icons.earned).should("exist")
        cy.getBySrc(icons.notEarned).should("not.exist")
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
        cy.getBySrc(icons.earned).should("not.exist")
        cy.getBySrc(icons.notEarned).should("exist")
      })
    })

    it("Should allow creation of a regular node (subtopic) from a question set", () => {
      cy.fixture("tyde/one-question-set.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.getNodeByTitle("Question Set 1").then(node => {
        cy.getNodeById(node.id).click()
        cy.openModal("add", node.id)
        cy.getByTestId(`node-title`).type("Question 1")
        cy.getByTestId(`node-media-type`).select("text")
        cy.getByTestId(`tyde-node-type`).select("Regular")
        cy.getEditable(`node-text-content`).type("This is an example of a question.")
        cy.submitModal()
        cy.getBySrc(icons.earned).should("not.exist")
        cy.getBySrc(icons.notEarned).should("exist")
      })
    })
  })

  describe("Progress and Completion", () => {
    it("Should update show module earned part when all question sets are complete", () => {
      cy.fixture("tyde/one-question-set.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.getBySrc(icons.earned).should("not.exist")
      cy.getBySrc(icons.notEarned).should("exist")
      cy.getNodeByTitle("Question Set 1").then(node => {
        // Use viewing the question set as a proxy for node completion
        cy.getNodeById(node.id).click()
        cy.openLightbox(node.id)
        cy.getBySrc(icons.earned).should("exist")
        cy.getBySrc(icons.notEarned).should("not.exist")
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
        cy.getBySrc(icons.notEarned).should("be.visible")
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
      cy.openTydeMenu()
      cy.closeTydeMenu()
      cy.openTydeMenu()
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
        cy.getByTestId(`tyde-cockpit-not-earned-icon`).type(icons.cockpit.notEarned)
        cy.getByTestId(`tyde-cockpit-earned-icon`).type(icons.cockpit.earned)
        cy.getByTestId(`tyde-cockpit-hover-icon`).type(icons.cockpit.hover)
        cy.getByTestId("node-spaceship-part-x").type("40")
        cy.getByTestId("node-spaceship-part-y").type("40")
        cy.getByTestId("node-spaceship-part-width").type("20")
        cy.getByTestId("node-spaceship-part-height").type("20")
        cy.submitModal()
        cy.openTydeMenu()
        cy.getByBackground(icons.cockpit.notEarned).should("be.visible")
      })
    })

    it("Should show favourite items in the cockpit and allow removal", () => {
      cy.fixture("tyde/one-question-set.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.openTydeMenu()
      cy.getByTestId("tyde-favourites-button").click()
      cy.contains(/You have not added any items to your favourites./i).should(
        "exist"
      )
      cy.closeTydeMenu()
      cy.getNodeByTitle("Question Set 1").then(node => {
        cy.getNodeById(node.id).click()
        cy.openLightbox(node.id)
        cy.getByTestId("favourite-button").click()
        cy.closeLightbox()
        cy.openTydeMenu()
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
      cy.openTydeMenu()
      cy.getByTestId("tyde-help-button").click()
      cy.contains(/ask@tyde.ca/i).should("exist")
    })

    it("Should navigate to the summary view when clicking a completed module", () => {
      cy.fixture("tyde/one-question-set-part-images.json").as("oneQuestionSet")
      cy.setup("@oneQuestionSet")
      cy.getNodeByTitle("Question Set 1").then(node => {
        cy.getNodeById(node.id).click()
        cy.openLightbox(node.id)
        cy.getByTestId("favourite-button").click()
        cy.closeLightbox()
      })
      cy.openTydeMenu()
      cy.getByBackground(icons.cockpit.earned).click()
      cy.getBySrc(icons.earned).should("exist")
      cy.contains(/Module 1/i).should("be.visible")
      cy.contains(/Stage 1/i).should("be.visible")
      cy.contains(/Question Set 1/i).should("be.visible")
      cy.contains(/Activities/i).click()
      cy.contains(/Favourites/i).click()
      cy.contains(/Question Set 1/).should("be.visible")
    })

    // [CI FAIL]
    // Fails due to problems described here:
    // https://app.asana.com/0/1126491658233864/1199568177338630
    it.skip("Should show completed profile activities in the menu", () => {
      cy.fixture("tyde/activities.json").as("activities")
      cy.setup("@activities")
      //cy.openModal("settings")
      // Must force here due to the menu icon covering the settings icon
      cy.getByTestId("settings-button").click({ force: true })
      cy.getByTestId("settings-modal")
        .contains(/profile/i)
        .click()
      cy.contains(/add activity/i).click()
      cy.getByTestId("profile-activity-combo").click()
      cy.contains("What's your name?").click()
      cy.submitSettingsModal()
      cy.openTydeMenu()
      cy.getByTestId("tyde-menu-profile-button").click()
      cy.contains("What's your name?").should("not.exist")
      cy.closeTydeMenu()
      cy.getNodeByTitle("Activity 1").then(node => {
        cy.getNodeById(node.id).click()
        cy.openLightbox(node.id)
        cy.getByTestId("record").click()
        cy.contains(/done/i).click()
        cy.contains(/submit/i).click()
        cy.contains("Your response has been recorded.").should("be.visible")
        cy.closeLightbox()
      })
      cy.login("admin").visitTapestry()
      cy.openTydeMenu()
      cy.getByTestId("tyde-menu-profile-button").click()
      cy.contains("What's your name?").should("exist")
      cy.contains("Your teen answered").should("exist")
      cy.closeTydeMenu()
    })

    it("Should show a set background image in the cockpit", () => {
      cy.fixture("one-node.json").as("oneNode")
      cy.setup("@oneNode")
      cy.getByTestId("settings-button").click({ force: true })
      cy.contains("TYDE").click()
      cy.getByTestId(`tyde-background-image`).type(cockpitBackgroundImage)
      cy.submitSettingsModal()
      cy.openTydeMenu()
      cy.getByBackground(cockpitBackgroundImage).should("be.visible")
    })
  })
})
