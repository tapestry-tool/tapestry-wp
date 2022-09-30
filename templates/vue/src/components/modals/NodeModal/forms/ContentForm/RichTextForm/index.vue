<template>
  <div class="editor">
    <editor-menu-bar v-slot="{ commands, isActive }" :editor="editor">
      <div
        class="menubar"
        role="toolbar"
        aria-label="Rich text formatting"
        @keydown="handleMenuKey"
      >
        <button
          v-for="(item, idx) in menubarItems"
          :key="idx"
          ref="menuItem"
          class="menubar__button"
          :class="{
            'is-active': isActive[item.command]
              ? isActive[item.command](item.args)
              : false,
          }"
          :style="item.style"
          :tabindex="focusedMenuItem === idx ? 0 : -1"
          :aria-label="
            (item.label ? item.label : item.command) +
              (isActive[item.command] && isActive[item.command](item.args)
                ? ', active'
                : '')
          "
          @click="handleMenuClick(idx, item, commands[item.command])"
        >
          <template v-if="item.text">
            {{ item.text }}
          </template>
          <icon v-else :name="item.icon ? item.icon : item.command" />
        </button>
      </div>
    </editor-menu-bar>
    <editor-content class="editor__content" :editor="editor" />
    <span
      v-if="maxLength"
      class="editor__char_count mt-1 mb-n3 text-muted small float-right"
    >
      <span :class="{ 'text-danger': contentLength > maxLength }">
        {{ contentLength }}
      </span>
      / {{ maxLength }}
    </span>
  </div>
</template>

<script>
import Icon from "./Icon"
import { Editor, EditorContent, EditorMenuBar } from "tiptap"
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
  Placeholder,
} from "tiptap-extensions"

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    Icon,
  },
  props: {
    value: {
      type: String,
      required: false,
      default: "",
    },
    placeholder: {
      type: String,
      required: true,
    },
    maxLength: {
      type: Number,
      default: null,
    },
    autofocus: {
      type: [String, Number, Boolean],
      required: false,
      default: false,
    },
  },
  data() {
    return {
      editor: null,
      linkUrl: null,
      linkMenuIsActive: false,
      editorChange: false,
      menubarItems: [
        { command: "bold" },
        { command: "italic" },
        { command: "strike", label: "strikethrough" },
        { command: "underline" },
        { command: "code" },
        { command: "link", label: "add link", clickHandler: this.setUrl },
        {
          command: "heading",
          label: "heading level 1",
          style: { marginLeft: "1em" },
          args: { level: 2 },
          text: "H1",
        },
        {
          command: "heading",
          label: "heading level 2",
          args: { level: 3 },
          text: "H2",
        },
        {
          command: "heading",
          label: "heading level 3",
          style: { marginRight: "1em" },
          args: { level: 4 },
          text: "H3",
        },
        { command: "bullet_list", label: "bulleted list", icon: "ul" },
        { command: "ordered_list", label: "ordered list", icon: "ol" },
        { command: "blockquote", icon: "quote" },
        { command: "horizontal_rule", label: "insert horizontal rule", text: "—" },
        { command: "undo", style: { marginLeft: "auto" } },
        { command: "redo" },
      ],
      focusedMenuItem: 0,
    }
  },
  computed: {
    contentLength() {
      const strippedHtml = this.value.replace(/<[^>]+>/g, "")
      const decodedStrippedHtml = strippedHtml.replace(/&#(\d+);/g, function(
        match,
        dec
      ) {
        return String.fromCharCode(dec)
      })
      return decodedStrippedHtml.length
    },
  },
  watch: {
    value(val) {
      // so cursor doesn't jump to start on typing
      if (this.editor && !this.editorChange) {
        this.editor.setContent(val, true)
      }
      this.editorChange = false
    },
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        new Blockquote(),
        new BulletList(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ levels: [2, 3, 4] }),
        new HorizontalRule(),
        new ListItem(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new Link(),
        new Bold(),
        new Code(),
        new Italic(),
        new Strike(),
        new Underline(),
        new History(),
        new Placeholder({
          emptyEditorClass: "is-editor-empty",
          emptyNodeClass: "is-empty",
          emptyNodeText: this.placeholder,
          showOnlyWhenEditable: true,
          showOnlyCurrent: true,
        }),
      ],
      content: this.value,
      onUpdate: ({ getHTML }) => {
        this.editorChange = true
        this.$emit("input", getHTML())
      },
      autoFocus: this.autofocus,
    })

    this.editor.setContent(this.value)
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  methods: {
    handleMenuClick(index, item, command) {
      this.focusedMenuItem = index
      this.$nextTick(() => {
        this.$refs.menuItem[index].focus()
      })
      if (item.clickHandler) {
        item.clickHandler(command)
      } else if (item.args !== null) {
        command(item.args)
      } else {
        command()
      }
    },
    handleMenuKey(evt) {
      const { code } = evt
      if (code === "ArrowRight" || code === "ArrowDown") {
        evt.preventDefault()
        if (++this.focusedMenuItem >= this.menubarItems.length) {
          this.focusedMenuItem = 0
        }
        this.$nextTick(() => {
          this.$refs.menuItem[this.focusedMenuItem].focus()
        })
      } else if (code === "ArrowLeft" || code === "ArrowUp") {
        evt.preventDefault()
        if (--this.focusedMenuItem < 0) {
          this.focusedMenuItem = this.menubarItems.length - 1
        }
        this.$nextTick(() => {
          this.$refs.menuItem[this.focusedMenuItem].focus()
        })
      }
    },
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href
      this.linkMenuIsActive = true
      this.$nextTick(() => {
        this.$refs.linkInput.focus()
      })
    },
    hideLinkMenu() {
      this.linkUrl = null
      this.linkMenuIsActive = false
    },
    setLinkUrl(command, url) {
      command({ href: url })
      this.hideLinkMenu()
    },
    setUrl(command) {
      const state = this.editor.state

      // get marks, if any from selected area
      const { from, to } = state.selection
      let marks = []
      state.doc.nodesBetween(from, to, node => {
        marks = [...marks, ...node.marks]
      })

      const mark = marks.find(markItem => markItem.type.name === "link")

      let urlSetting = ""

      if (mark && mark.attrs.href) {
        const presetURL = mark.attrs.href
        urlSetting = prompt("Please update url:", presetURL) // let a user see the previously set URL
      } else {
        urlSetting = prompt("Please add url:", "") // a clean prompt, has had no anchor
      }

      command({ href: urlSetting })
    },
  },
}
</script>

<style lang="scss">
$color-black: #000000;
$color-white: #ffffff;
$color-grey: #dddddd;

h2 {
  font-size: 1.5em;
}
h3 {
  font-size: 1.3em;
}
h4 {
  font-size: 1.1em;
}
h2,
h3,
h4 {
  font-weight: normal;
  font-style: normal;
}
h2:after {
  content: none !important;
}
h2:before {
  content: none !important;
}
.ProseMirror:focus {
  outline: none;
}
.editor {
  border: 1px solid #ccc;
}

.editor:not(:focus-within) .menubar {
  background: #fff;
  opacity: 0.5;
}

.menubar {
  display: flex;
  margin-bottom: 0.7rem;
  transition: all 0.3s;
  background-color: #eee;

  &.is-hidden {
    visibility: hidden;
    opacity: 0;
  }

  &.is-focused {
    visibility: visible;
    opacity: 1;
    transition: visibility 0.2s, opacity 0.2s;
  }

  &__button {
    position: relative;
    width: 1.8rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 0;
    color: $color-black;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    cursor: pointer;

    &:hover {
      background-color: rgba($color-black, 0.05);
      background: rgba($color-black, 0.05);
    }

    &.is-active {
      background-color: rgba($color-black, 0.1);
      background: rgba($color-black, 0.1);
    }

    &:focus {
      background-color: rgba($color-black, 0.2);
      background: rgba($color-black, 0.2);
    }
  }

  span#{&}__button {
    font-size: 13.3333px;
  }
}

.editor__content {
  padding: 0 1em;
}

.editor p.is-editor-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  color: #aaa;
  pointer-events: none;
  height: 0;
  font-style: italic;
}
</style>
