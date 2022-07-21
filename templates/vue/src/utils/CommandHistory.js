export default class CommandHistory {
  history
  position
  static maxLength = 3

  constructor() {
    this.history = []
    this.position = -1
  }

  async doCommand(command) {
    if (this.position < this.history.length - 1) {
      this.history.splice(this.position + 1)
    }
    if (this.position === CommandHistory.maxLength - 1) {
      this.history.shift()
      this.position--
    }

    this.history.push(command)
    this.position++

    await command.do()
  }

  async undo() {
    if (this.position === -1) {
      return
    }
    await this.history[this.position--].undo()
  }

  async redo() {
    if (this.position === this.history.length - 1) {
      return
    }
    await this.history[++this.position].do()
  }
}
