<template>
  <div class="editor">
    <editor-menu-bar v-slot="{ commands, isActive }" :editor="editor">
      <div class="menubar">
        <button
          v-for="icon of icons_first_group"
          :key="icon.vclass"
          class="menubar__button"
          :class="icon.vclass"
          @click="icon.click"
        >
          <icon v-if="icon.name" :name="icon.name" />
          {{ icon.text }}
        </button>

        <button
          v-for="icon of icons_second_group"
          :key="icon.name"
          class="menubar__button"
          @click="icon.click"
        >
          <icon :name="icon.name" />
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
      required: true,
    },
    placeholder: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      editor: null,
      icons_first_group: [
        {
          vclass: "{ 'is-active': isActive.bold() }",
          click: "commands.bold",
          name: "bold",
          text: "",
        },
        {
          vclass: "{ 'is-active': isActive.italic() }",
          click: "commands.italic",
          name: "italic",
          text: "",
        },
        {
          vclass: "{ 'is-active': isActive.strike() }",
          click: "commands.strike",
          name: "strike",
          text: "",
        },
        {
          vclass: "{ 'is-active': isActive.underline() }",
          click: "commands.underline",
          name: "underline",
          text: "",
        },
        {
          vclass: "{ 'is-active': isActive.code() }",
          click: "commands.code",
          name: "code",
          text: "",
        },
        {
          vclass: "{ 'is-active': isActive.paragraph() }",
          click: "commands.paragraph",
          name: "paragraph",
          text: "",
        },
        {
          vclass: "{ 'is-active': isActive.heading({ level: 2 }) }",
          click: "commands.heading({ level: 2 })",
          name: false,
          text: "H1",
        },
        {
          vclass: "{ 'is-active': isActive.heading({ level: 3 }) }",
          click: "commands.heading({ level: 3 })",
          name: false,
          text: "H2",
        },
        {
          vclass: "{ 'is-active': isActive.heading({ level: 4 }) }",
          click: "commands.heading({ level: 4 })",
          name: false,
          text: "H3",
        },
        {
          vclass: "{ 'is-active': isActive.bullet_list() }",
          click: "commands.bullet_list",
          name: "ul",
          text: "",
        },
        {
          vclass: "{ 'is-active': isActive.ordered_list() }",
          click: "commands.ordered_list",
          name: "ol",
          text: "",
        },
        {
          vclass: "{ 'is-active': isActive.blockquote() }",
          click: "commands.blockquote",
          name: "quote",
          text: "",
        },
      ],
      icons_second_group: [
        {
          click: "commands.horizontal_rule",
          name: "hr",
        },
        {
          click: "commands.undo",
          name: "undo",
        },
        {
          click: "commands.redo",
          name: "redo",
        },
      ],
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
}
</script>

<style lang="scss">
$color-black: #000000;
$color-white: #ffffff;
$color-grey: #dddddd;

.editor {
  border: 1px solid #ccc;
}

.menubar {
  display: flex;
  margin-bottom: 1rem;
  transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;

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
