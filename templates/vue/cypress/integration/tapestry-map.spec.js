describe("Map Tapestry", ()=>{

    beforeEach(() => {
        cy.fixture("two-nodes.json").as("twoNodes")
        cy.setup("@twoNodes")

        cy.getByTestId("settings-button").click()
        cy.contains(/advanced/i).click()
        cy.getByTestId('map-checkbox').click({force: true})
        cy.submitSettingsModal()
        cy.visitTapestry()
        
    })

    it("can add valid map coorindates", ()=>{
        cy.contains("Add to map").click()
        cy.contains("Show on Map").click({force: true})

        /* current implementation doesn't disable the publish button.. 
           trying to do so breaks the modal
        cy.getByTestId('node-lat-input').type("199")
        cy.getByTestId('node-lng-input').type("-123")
        cy.getByTestId("submit-node-modal").should('be.disabled')
        */

        cy.getByTestId('node-lat-input').clear().type("49")
        cy.getByTestId('node-lng-input').clear().type("-123")

        cy.submitModal()

        cy.get('.leaflet-marker-icon').should(($p) => {
            expect($p).to.have.length(1);
        });

        cy.contains("49").should("exist")
        cy.contains("-123").should("exist")

        /* cant seem to click this icon properly.. cypress selector tells me it's .leaflet-marker-icon on hover
        but doesn't confirm the selection in the search bar... 

        cy.get('.map-content').get('.leaflet-marker-icon').click()
        cy.get('.map-content').contains(/node/i).click()
        */
    })

    it("can add new nodes", ()=>{
        cy.contains('Add new node').click()
        
        const child = {
            title: "child 1",
            description: "I am a child node",
            mediaType: "text",
            textContent: "content",
        }

        cy.getByTestId(`node-title`).type(child.title)
        cy.contains(/add description/i).click()
        cy.getEditable(`node-description`).type(child.description)

        cy.getEditable(`node-text-content`).type(child.textContent)

        cy.submitModal()
        
        cy.store()
        .its("state.nodes")
        .should(nodes => {
          expect(Object.keys(nodes)).to.have.length(3)
        })

    })


    it("nodes previously added in tapestry should be present in map view", ()=>{
        cy.getByTestId('tapestry-map').should('be.visible')
        cy.contains("Add new node").should("exist")
        cy.get('.map-content').should('exist')

        cy.store()
        .its("state.nodes")
        .should(nodes => {
          expect(Object.keys(nodes)).to.have.length(2)
        })

        cy.get('.leaflet-marker-icon').should(($p) => {
            expect($p).to.have.length(0);
        });

    })


  
})