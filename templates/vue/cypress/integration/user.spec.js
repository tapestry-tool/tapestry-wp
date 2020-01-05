import {
  visitTapestry,
  getStore,
  getNode,
  getMediaButton,
  getLightbox,
} from "../support/utils"

const TEST_TAPESTRY_NAME = "testing-user"

describe("User side", () => {
  beforeEach(() => {
    visitTapestry(TEST_TAPESTRY_NAME)
  })

  describe.only("General", () => {
    it("Should be able to view and drag nodes", () => {
      getStore()
        .its("state.nodes")
        .then(nodes =>
          nodes.forEach(node => {
            getNode(node.id).should("be.visible")
          })
        )
    })
    it("Should be able to click on media icon to open lightbox", () => {
      getStore()
        .its("state.nodes.0.id")
        .then(id => {
          getMediaButton(id).click()
          getLightbox().should("be.visible")
        })
    })
    it("Should display lightbox in fullscreen if item is a fullscreen item", () => {
      getStore()
        .its("state.nodes")
        .then(nodes => {
          const node = nodes.find(node => node.fullscreen)
          getMediaButton(node.id).click()
          getLightbox()
            .find("#spotlight-content")
            .then(el => {
              const box = el[0].getBoundingClientRect()
              cy.window()
                .its("innerWidth")
                .should("equal", box.width)
            })
        })
    })
  })

  describe("Content types", () => {
    it("Should be able to view text node", () => {
      // check lightbox opens
      // check text content exists
    })
    it("Should be able to view video node", () => {
      // check video plays and that source matches node source
    })
    it("Should be able to view h5p node", () => {
      // check h5p plays and shows the correct h5p content
    })

    describe("External links", () => {
      it("Should show embedded webpage if external link is embedded", () => {
        // check iframe exists with correct src
      })
      it("Should show preview metadata if external link is not embedded", () => {
        // check link title, text and image exists and that the text links
        // to the external page
      })
    })
  })

  describe("Quiz", () => {
    it("Should be able to complete a gravity form quiz", () => {})
    it("Should be able to complete an h5p audio quiz", () => {})
  })
})
