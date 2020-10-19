import DragSelect from "dragselect"

export default class DragSelectModular {
  app
  nodes
  dragSelect

  static initializeDragSelect(area, app, nodes) {
    this.addDragSelectListener()
    this.app = app
    this.nodes = nodes
    this.dragSelect = new DragSelect({
      selectables: document.querySelectorAll(".node"),
      area: area,
      onDragStart: evt => {
        if (evt.ctrlKey || evt.metaKey || evt.shiftKey) {
          return
        }
        app.clearSelection()
      },
      onElementSelect: el => app.select(el.dataset.id),
      onElementUnselect: el => app.unselect(el.dataset.id),
    })
  }

  static dragSelectListener(evt) {
    if (evt.key === "Escape") {
      DragSelectModular.app.clearSelection()
    }

    if (evt.key === "a" && (evt.metaKey || evt.ctrlKey || evt.shiftKey)) {
      evt.preventDefault()
      Object.values(DragSelectModular.nodes).forEach(node =>
        DragSelectModular.app.select(node.id)
      )
    }
  }

  static addDragSelectListener() {
    document.addEventListener("keydown", this.dragSelectListener)
  }

  static removeDragSelectListener() {
    document.removeEventListener("keydown", this.dragSelectListener)
  }

  static updateSelectableNodes() {
    DragSelectModular.dragSelect.addSelectables(document.querySelectorAll(".node"))
  }

  static pauseDragSelect() {
    DragSelectModular.dragSelect.break()
  }

  static initializeDragSelectZone(mainElementId) {
    let allowedArea = document.getElementById(mainElementId)
    document.body.addEventListener("mousedown", function(event) {
      if (!allowedArea.contains(event.target)) {
        DragSelectModular.pauseDragSelect()
      }
    })
  }
}
