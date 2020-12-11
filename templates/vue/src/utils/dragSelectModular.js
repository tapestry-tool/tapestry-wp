import DragSelect from "dragselect"
import Helpers from "@/utils/Helpers"
import * as wp from "@/services/wp"

export default class DragSelectModular {
  app
  nodes
  dragSelect

  static initializeDragSelect(area, app, nodes) {
    this.addDragSelectListener()
    this.app = app
    this.nodes = nodes
    this.dragSelect = new DragSelect({
      selectables: document.querySelectorAll(".node.selectable"),
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
    if (DragSelectModular.app) {
      if (evt.key === "Escape") {
        DragSelectModular.app.clearSelection()
      }

      if (evt.key === "a" && (evt.metaKey || evt.ctrlKey || evt.shiftKey)) {
        evt.preventDefault()
        Object.values(DragSelectModular.nodes).forEach(node => {
          if (wp.isLoggedIn() && Helpers.hasPermission(node, "edit")) {
            DragSelectModular.app.select(node.id)
          }
        })
      }
    }
  }

  static addDragSelectListener() {
    document.addEventListener("keydown", this.dragSelectListener)
  }

  static removeDragSelectListener() {
    document.removeEventListener("keydown", this.dragSelectListener)
  }

  static updateSelectableNodes() {
    if (DragSelectModular.dragSelect) {
      DragSelectModular.dragSelect.addSelectables(
        document.querySelectorAll(".node.selectable")
      )
    }
  }

  static pauseDragSelect() {
    if (DragSelectModular.dragSelect) {
      DragSelectModular.dragSelect.break()
    }
  }
}
