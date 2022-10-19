export default class CommandHistory {
  history
  position
  static maxLength = 3

  constructor() {
    this.history = []
    this.position = -1
  }

  async doCommand(command) {
    if (command.replace === "next") {
      this.history.splice(this.position + 1, 1, command)
    } else if (command.replace === "previous") {
      this.history.splice(this.position, 1, command)
    } else {
      if (this.position < this.history.length - 1) {
        this.history.splice(this.position + 1)
      }
      if (this.position === CommandHistory.maxLength - 1) {
        this.history.shift()
        this.position--
      }

      this.history.push(command)
      this.position++

      return command.execute()
    }
  }

  async undo() {
    if (this.position === -1) {
      return false
    }
    const command = this.history[this.position--]
    await command.undo()
    return `Undo ${command.name}`
  }

  async redo() {
    if (this.position === this.history.length - 1) {
      return false
    }
    const command = this.history[++this.position]
    await command.execute()
    return `Redo ${command.name}`
  }
}
