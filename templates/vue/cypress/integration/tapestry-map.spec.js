const { marker } = require("leaflet")

describe("Map Tapestry", ()=>{

    beforeEach(() => {
        cy.fixture("two-nodes.json").as("twoNodes")
        cy.setup("@twoNodes")

        cy.getByTestId("settings-button").click()
        cy.contains(/advanced/i).click()
        cy.getByTestId('map-checkbox').click({force: true})
        cy.submitSettingsModal()
        
    })

    it("if logged in as non-admin, should NOT see list of nodes", ()=>{
        cy.logout().visitTapestry()
        cy.get(".nodes-list").should("not.be.visible")
        cy.get('.vue2leaflet-map').should('be.visible')
    })

    it('if logged in as non-admin, should see map markers', ()=>{
        cy.get('.card-body').eq(1).contains('Add to map').click()
        cy.contains("Show on Map").click({force: true})
        
        cy.getByTestId('node-lat-input').clear().type("49")
        cy.getByTestId('node-lng-input').clear().type("-123")
        cy.getByTestId("submit-node-modal").should('not.be.disabled')
        cy.submitModal()

        cy.logout().visitTapestry()
        cy.get('.leaflet-marker-icon').should('be.visible')
        cy.get('.leaflet-marker-icon').click()
        cy.get('.vue2leaflet-map').get('.btn > h6').click({force:true})
        cy.lightbox().should("be.visible")
        cy.closeLightbox()
    })

    it("admin can add to map, view from marker, and delete from sidebar", ()=>{
     
        cy.get('.card-body').eq(1).contains('Add to map').click()
        cy.contains("Show on Map").click({force: true})
        
        // prevents invalid submission
        cy.getByTestId('node-lat-input').type("199")
        cy.getByTestId("submit-node-modal").should('be.disabled')
        cy.getByTestId('node-lng-input').type("-123")
        cy.getByTestId("submit-node-modal").should('be.disabled')

        cy.getByTestId('node-lat-input').clear().type("49")
        cy.getByTestId('node-lng-input').clear().type("-123")
        cy.getByTestId("submit-node-modal").should('not.be.disabled')
        cy.submitModal()

        cy.get('.leaflet-marker-icon').should(($p) => {
            expect($p).to.have.length(1);
        });

        cy.contains("49").should("exist")
        cy.contains("-123").should("exist")
        
        // users can view the marker
        cy.get('.leaflet-marker-icon').click({force: true})
        cy.get('.vue2leaflet-map').get('.btn > h6').click({force:true})
        cy.lightbox().should("be.visible")
        cy.closeLightbox()

        cy.store()
            .its("state.nodes")
            .then(nodes => {
                const listofnodes = Object.values(nodes)
                listofnodes.forEach(child => {
                    if(child.mapCoordinates && child.mapCoordinates.lat != ""){
                        cy.getByTestId(`marker-${child.id}`).invoke('attr', 'style', 'display: block !important')
                        cy.getByTestId(`marker-${child.id}`).should('be.visible')
                        cy.getByTestId(`marker-${child.id}`).click()
                    }
                }
            )           
        })

        // can delete
        cy.get('.card-body').eq(1).contains('Edit').click()
        cy.contains('Delete Node').click()

        cy.get('.leaflet-marker-icon').should(($p) => {
            expect($p).to.have.length(0);
        });

        cy.store()
        .its("state.nodes")
        .should(nodes => {
          expect(Object.keys(nodes)).to.have.length(1)
        })
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

        cy.get('.nodes-list').contains(child.title).should("be.visible")
    })
})