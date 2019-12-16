export function logs(state) {
  const completedContents = state.nodes
    .filter(node => node.completed)
    .map(node => ({
      type: "content",
      imageURL: node.imageURL,
      title: node.title,
      description: node.description,
    }))

  const completedActivities = state.nodes.reduce((activities, currentNode) => {
    if (currentNode.quiz) {
      const completedQuestions = currentNode.quiz.filter(q => q.completed).map(q => {
        const keys = Object.keys(q.answers)
        return keys.filter(key => q.answers[key]).map(key => {
          return {
            type: "activity",
            title: q.text,
            imageURL: currentNode.imageURL,
            nodeId: currentNode.id,
            [key]: q.answers[key],
          }
        })
      })
      return [...activities, ...completedQuestions.flat()]
    }
  }, [])

  return [...completedContents, ...completedActivities]
}

export function getParent(state) {
  return (id) => {
    const link = state.links.find(l => l.target == id || l.target.id == id)
    return link ? link.source : null
  }
}
