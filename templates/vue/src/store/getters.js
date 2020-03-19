export function getActivities(state) {
  return (options = {}) => {
    const { exclude = [] } = options
    return state.nodes
      .filter(node => !exclude.includes(node.id) && Boolean(node.quiz))
      .flatMap(node => node.quiz)
  }
}
