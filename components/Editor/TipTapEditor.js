import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Youtube from '@tiptap/extension-youtube'
import { useState, useEffect, useRef } from 'react'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { Callout } from './extensions/Callout'
import { SlashCommands, slashCommandsList } from './extensions/SlashCommands'
import SlashMenu from './SlashMenu'
import FloatingMenu from './FloatingMenu'
import styles from './Editor.module.css'

export default function TipTapEditor({
  content,
  onChange,
  placeholder = '📝 Нажмите "/" для команд или просто начните писать...'
}) {
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef(null)

  // Обработка drag & drop для изображений
  const handleDrop = (view, event, slice, moved) => {
    if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0]

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const { schema } = view.state
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

          const node = schema.nodes.image.create({ src: e.target.result })
          const transaction = view.state.tr.insert(coordinates.pos, node)
          view.dispatch(transaction)
        }
        reader.readAsDataURL(file)
        return true
      }
    }
    return false
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        },
        code: false,
        codeBlock: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Highlight.configure({
        multicolor: true
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'editor-youtube',
        },
      }),
      Callout,
      SlashCommands.configure({
        suggestion: {
          items: ({ query }) => {
            return slashCommandsList
              .filter(item => {
                const searchText = query.toLowerCase()
                return (
                  item.title.toLowerCase().includes(searchText) ||
                  item.aliases?.some(alias => alias.toLowerCase().includes(searchText))
                )
              })
              .slice(0, 10)
          },
          render: () => {
            let component
            let popup

            return {
              onStart: props => {
                component = new ReactRenderer(SlashMenu, {
                  props,
                  editor: props.editor,
                })

                if (!props.clientRect) {
                  return
                }

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },

              onUpdate(props) {
                component.updateProps(props)

                if (!props.clientRect) {
                  return
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },

              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide()
                  return true
                }

                return component.ref?.onKeyDown(props)
              },

              onExit() {
                popup[0].destroy()
                component.destroy()
              },
            }
          },
        },
      }),
    ],
    content,
    editorProps: {
      handleDrop,
      attributes: {
        class: styles.proseEditor,
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!editor || !mounted) {
    return (
      <div className={styles.editorWrapper}>
        <div className={styles.loading}>Загрузка редактора...</div>
      </div>
    )
  }

  return (
    <div className={styles.blockEditor}>
      {/* Floating Menu for text selection */}
      {editor && <FloatingMenu editor={editor} />}

      {/* Main Editor Content */}
      <div className={styles.editorContainer}>
        <EditorContent editor={editor} className={styles.editorContent} />
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const src = event.target?.result
              if (src && typeof src === 'string') {
                editor.chain().focus().setImage({ src }).run()
              }
            }
            reader.readAsDataURL(file)
          }
        }}
      />
    </div>
  )
}
