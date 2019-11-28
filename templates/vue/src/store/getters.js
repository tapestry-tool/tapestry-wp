export function logs(state) {
  debugger
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
