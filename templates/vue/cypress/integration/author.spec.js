describe("Author side", () => {
  describe("General", () => {
    it("Should be able to add a root node", () => {})
    it("Should be able to add multiple child nodes", () => {})
    it("New nodes should be draggable and viewable", () => {})
    it("Should be able to delete a leaf node", () => {})
    it("Should be able to delete a link if the nodes its connected to have at least one other link connected to it", () => {})
  })

  describe("Node content", () => {
    it("Should be able to edit content fields and see the changes applied", () => {})
  })

  describe("Node appearance", () => {
    it("Should show a thumbnail if a thumbnail url is passed", () => {})
    it("Should hide node title if its input is checked", () => {})
    it("Should hide progress bar if its input is checked", () => {})
    it("Should hide media button if its input is checked", () => {})
  })

  describe("Node permissions", () => {
    it("Should hide node and associated links if user does not have read access", () => {})
    it("Should hide edit button if user does not have write access", () => {})
    it("Should hide add button if user does not have add access", () => {})
  })
})
