import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export const slashCommandsList = [
  {
    title: 'Заголовок 1',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run()
    },
    aliases: ['h1', 'heading1'],
  },
  {
    title: 'Заголовок 2',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run()
    },
    aliases: ['h2', 'heading2'],
  },
  {
    title: 'Заголовок 3',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run()
    },
    aliases: ['h3', 'heading3'],
  },
  {
    title: '💡 Инфо блок',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout('info')
        .run()
    },
    aliases: ['info', 'инфо'],
  },
  {
    title: '⚠️ Предупреждение',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout('warning')
        .run()
    },
    aliases: ['warning', 'предупреждение', 'warn'],
  },
  {
    title: '✅ Успех',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout('success')
        .run()
    },
    aliases: ['success', 'успех'],
  },
  {
    title: '❌ Ошибка',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout('danger')
        .run()
    },
    aliases: ['danger', 'error', 'ошибка'],
  },
  {
    title: '💬 Цитата',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout('quote')
        .run()
    },
    aliases: ['quote', 'цитата'],
  },
  {
    title: '📷 Изображение',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .run()
      // Trigger image dialog
      const event = new CustomEvent('openImageDialog')
      window.dispatchEvent(event)
    },
    aliases: ['image', 'img', 'изображение'],
  },
  {
    title: '📹 Видео (YouTube)',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .run()
      // Trigger video dialog
      const event = new CustomEvent('openVideoDialog')
      window.dispatchEvent(event)
    },
    aliases: ['video', 'youtube', 'видео'],
  },
  {
    title: '📊 Таблица',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    },
    aliases: ['table', 'таблица'],
  },
  {
    title: '➖ Разделитель',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHorizontalRule()
        .run()
    },
    aliases: ['hr', 'divider', 'разделитель'],
  },
]
