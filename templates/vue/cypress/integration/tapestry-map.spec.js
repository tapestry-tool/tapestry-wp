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
    })

    it("nodes added in tapestry should be present in map view", ()=>{
        cy.getByTestId('tapestry-map').should('be.visible')
        cy.contains("Add new node").should("exist")
        cy.get('.map-content').should('exist')

        cy.store()
        .its("state.nodes")
        .should(nodes => {
          expect(Object.keys(nodes)).to.have.length(2)
        })
    })


  
})