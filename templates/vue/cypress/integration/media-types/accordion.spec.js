describe("Accordion", () => {
  it(`
    Given: A Tapestry node
    When: It's edited to an accordion and opened
    Then: An accordion lightbox should appear
  `)

  it(`
    Given: An accordion
    When: Child nodes are added and the accordion opened
    Then: Rows should appear and be clickable
  `)

  it(`
    Given: A non-empty accordion
    When: Its rows are locked
    Then: Only the first row should be clickable until completed
  `)

  it(`
    Given: A non-empty accordion
    When: Its rows are reordered
    Then: The lightbox should reflect the new order
  `)

  it(`
    Given: An accordion row
    When: A child node is added to it
    Then: The row should appear as a subaccordion
  `)
})
