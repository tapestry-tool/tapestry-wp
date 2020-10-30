describe("Locked Nodes", () => {
  it(`
    Given: A Tapestry node
    When: A complete condition is added
    Then: It should be inaccessible if the node it relies on is not completed
  `)

  it(`
    Given: A Tapestry node
    When: A time-based condition is added
    Then: It should be inaccessible if the condition is not fulfilled
  `)

  it(`
    Given: A locked node
    When: A user tries to open it
    Then: It should only open if the user is an admin or its author
  `)
})
