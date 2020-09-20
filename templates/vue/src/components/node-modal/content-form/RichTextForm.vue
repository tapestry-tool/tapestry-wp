<template>
  <div class="editor">
    <editor-menu-bar v-slot="{ commands, isActive }" :editor="editor">
      <div class="menubar">
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.bold() }"
          @click="commands.bold"
        >
          <icon name="bold" />
        </button>
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic"
        >
          <icon name="italic" />
        </button>
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.strike() }"
          @click="commands.strike"
        >
          <icon name="strike" />
        </button>
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.underline() }"
          @click="commands.underline"
        >
          <icon name="underline" />
        </button>
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.code() }"
          @click="commands.code"
        >
          <icon name="code" />
        </button>
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.link() }"
          @click="setUrl(commands.link)"
        >
          <icon name="link" />
        </button>
        <button
          :style="gapLeft"
          class="menubar__button"
          :class="{ 'is-active': isActive.heading({ level: 2 }) }"
          @click="commands.heading({ level: 2 })"
        >
          H1
        </button>
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.heading({ level: 3 }) }"
          @click="commands.heading({ level: 3 })"
        >
          H2
        </button>
        <button
          :style="gapRight"
          class="menubar__button"
          :class="{ 'is-active': isActive.heading({ level: 4 }) }"
          @click="commands.heading({ level: 4 })"
        >
          H3
        </button>
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.bullet_list() }"
          @click="commands.bullet_list"
        >
          <icon name="ul" />
        </button>
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.ordered_list() }"
          @click="commands.ordered_list"
        >
          <icon name="ol" />
        </button>
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.blockquote() }"
          @click="commands.blockquote"
        >
          <icon name="quote" />
        </button>
        <button class="menubar__button" @click="commands.horizontal_rule">
          —
        </button>
        <button
          style="margin-left: auto;"
          class="menubar__button"
          @click="commands.undo"
        >
          <icon name="undo" />
        </button>
        <button class="menubar__button" @click="commands.redo">
          <icon name="redo" />
        </button>
      </div>
    </editor-menu-bar>
    <editor-content
      class="editor__content"
      :editor="editor"
      :value="value"
      @input="$emit('input', $event.target.value)"
    />
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
  },
  data() {
    return {
      editor: null,
      linkUrl: null,
      linkMenuIsActive: false,
      gapLeft: {
        marginLeft: "1em",
      },
      gapRight: {
        marginRight: "1em",
      },
    }
  },
  watch: {
    value(val) {
      // so cursor doesn't jump to start on typing
      if (this.editor && val !== this.value) {
        this.editor.setContent(val, true)
      }
    },
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        new Blockquote(),
        new BulletList(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ levels: [1, 2, 3] }),
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
        this.$emit("input", getHTML())
      },
    })

    this.editor.setContent(this.value)
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  methods: {
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
        prompt("Please update url:", presetURL) // let a user see the previously set URL
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
      outline: unset;
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
