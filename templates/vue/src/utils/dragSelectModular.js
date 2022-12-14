import DragSelect from "dragselect"
import Helpers from "@/utils/Helpers"
import * as wp from "@/services/wp"

export default class DragSelectModular {
  app
  nodes
  dragSelect = null
  onDragStart
  onDragEnd

  static initialize(onDragStart, onDragEnd) {
    this.onDragStart = onDragStart
    this.onDragEnd = onDragEnd
  }

  static initializeDragSelect(area, app, nodes) {
    this.app = app
    this.nodes = nodes
    this.dragSelect = new DragSelect({
      selectables: document.querySelectorAll(".node.selectable"),
      area: area,
    })
    this.dragSelect.subscribe("dragstart", callbackObj => {
      const { event } = callbackObj
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        return
      }
      app.clearSelection()
      if (this.onDragStart) {
        this.onDragStart(callbackObj)
      }
    })
    this.dragSelect.subscribe("callback", ({ callbackObj }) => {
      if (this.onDragEnd) {
        this.onDragEnd(callbackObj)
      }
    })
    this.dragSelect.subscribe("elementselect", ({ item }) =>
      app.select(item.dataset.id)
    )
    this.dragSelect.subscribe("elementunselect", ({ item }) =>
      app.unselect(item.dataset.id)
    )

    this.addDragSelectListener()
  }

  static disableDragSelect() {
    if (DragSelectModular.dragSelect) {
      DragSelectModular.removeDragSelectListener()
      DragSelectModular.dragSelect.clearSelection()
      DragSelectModular.dragSelect.stop()
      DragSelectModular.dragSelect = null
    }
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
      // Clear current selectables set before adding up-to-date node elements
      DragSelectModular.dragSelect.removeSelectables(
        DragSelectModular.dragSelect.getSelectables()
      )
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
