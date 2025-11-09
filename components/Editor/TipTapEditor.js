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
import ColorPicker from './ColorPicker'
import styles from './Editor.module.css'

export default function TipTapEditor({ content, onChange, placeholder = 'Начните писать или нажмите "/" для команд...' }) {
  const [imageUrl, setImageUrl] = useState('')
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false)
  const [textColor, setTextColor] = useState(null)
  const [bgColor, setBgColor] = useState(null)
  const [showCalloutsMenu, setShowCalloutsMenu] = useState(false)
  const [showTableMenu, setShowTableMenu] = useState(false)
  const fileInputRef = useRef(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        },
        // Отключаем code и codeBlock
        code: false,
        codeBlock: false,
      }),
      Image.configure({
        inline: true,
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
        placeholder
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
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: styles.editorContent
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          event.preventDefault()
          const file = event.dataTransfer.files[0]

          if (file.type.startsWith('image/')) {
            handleImageUploadFile(file)
            return true
          }
        }
        return false
      },
    }
  })

  useEffect(() => {
    if (editor && textColor) {
      editor.chain().focus().setColor(textColor).run()
    }
  }, [textColor, editor])

  useEffect(() => {
    if (editor && bgColor) {
      editor.chain().focus().setHighlight({ color: bgColor }).run()
    }
  }, [bgColor, editor])

  // Listen to custom events from slash commands
  useEffect(() => {
    const handleOpenImageDialog = () => setShowImageDialog(true)
    const handleOpenVideoDialog = () => setShowYoutubeDialog(true)

    window.addEventListener('openImageDialog', handleOpenImageDialog)
    window.addEventListener('openVideoDialog', handleOpenVideoDialog)

    return () => {
      window.removeEventListener('openImageDialog', handleOpenImageDialog)
      window.removeEventListener('openVideoDialog', handleOpenVideoDialog)
    }
  }, [])

  if (!editor) {
    return <div className={styles.loading}>Загрузка редактора...</div>
  }

  const handleImageUploadFile = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const { data } = await response.json()
        editor.chain().focus().setImage({ src: data.image.url }).run()
      } else {
        alert('Ошибка при загрузке изображения')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Ошибка при загрузке изображения')
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUploadFile(file)
    }
  }

  const handleAddImageUrl = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageDialog(false)
    }
  }

  const handleSetLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkDialog(false)
    }
  }

  const handleAddYoutube = () => {
    if (youtubeUrl) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run()
      setYoutubeUrl('')
      setShowYoutubeDialog(false)
    }
  }

  return (
    <div className={styles.editorWrapper}>
      {/* Bubble Menu - commented out as BubbleMenu component not available in this TipTap version */}
      {/* {editor && (
        <div className={styles.bubbleMenu}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? styles.active : ''}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? styles.active : ''}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? styles.active : ''}
          >
            <u>U</u>
          </button>
          <button
            onClick={() => setShowLinkDialog(!showLinkDialog)}
            className={editor.isActive('link') ? styles.active : ''}
          >
            🔗
          </button>
        </div>
      )} */}

      <div className={styles.toolbar}>
        {/* Format Dropdown */}
        <div className={styles.toolbarGroup}>
          <select
            onChange={(e) => {
              const value = e.target.value
              if (value === 'p') {
                editor.chain().focus().setParagraph().run()
              } else if (value.startsWith('h')) {
                const level = parseInt(value.substring(1))
                editor.chain().focus().toggleHeading({ level }).run()
              }
            }}
            className={styles.formatSelect}
          >
            <option value="p">Параграф</option>
            <option value="h1">Заголовок 1</option>
            <option value="h2">Заголовок 2</option>
            <option value="h3">Заголовок 3</option>
            <option value="h4">Заголовок 4</option>
            <option value="h5">Заголовок 5</option>
            <option value="h6">Заголовок 6</option>
          </select>
        </div>

        {/* Text formatting */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? styles.active : ''}
            title="Жирный (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? styles.active : ''}
            title="Курсив (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? styles.active : ''}
            title="Подчеркнутый"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? styles.active : ''}
            title="Зачеркнутый"
          >
            <s>S</s>
          </button>
        </div>

        {/* Colors */}
        <div className={styles.toolbarGroup}>
          <ColorPicker
            type="text"
            currentColor={textColor}
            onSelect={(color) => {
              if (color) {
                editor.chain().focus().setColor(color).run()
              } else {
                editor.chain().focus().unsetColor().run()
              }
              setTextColor(color)
            }}
          />
          <ColorPicker
            type="background"
            currentColor={bgColor}
            onSelect={(color) => {
              if (color && color !== 'transparent') {
                editor.chain().focus().setHighlight({ color }).run()
              } else {
                editor.chain().focus().unsetHighlight().run()
              }
              setBgColor(color)
            }}
          />
        </div>

        {/* Lists */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? styles.active : ''}
            title="Маркированный список"
          >
            • Список
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? styles.active : ''}
            title="Нумерованный список"
          >
            1. Список
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? styles.active : ''}
            title="Цитата"
          >
            &ldquo; Цитата
          </button>
        </div>

        {/* Alignment */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? styles.active : ''}
            title="По левому краю"
          >
            ⬅️
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? styles.active : ''}
            title="По центру"
          >
            ↔️
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? styles.active : ''}
            title="По правому краю"
          >
            ➡️
          </button>
        </div>

        {/* Callout Blocks */}
        <div className={styles.toolbarGroup}>
          <div className={styles.dropdown}>
            <button
              type="button"
              className={styles.dropdownTrigger}
              onClick={() => setShowCalloutsMenu(!showCalloutsMenu)}
              title="Блоки"
            >
              ⚠️ Блоки ▼
            </button>
            {showCalloutsMenu && (
              <div className={styles.dropdownMenu}>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setCallout('info').run()
                    setShowCalloutsMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  💡 Инфо
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setCallout('warning').run()
                    setShowCalloutsMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  ⚠️ Предупреждение
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setCallout('success').run()
                    setShowCalloutsMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  ✅ Успех
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setCallout('danger').run()
                    setShowCalloutsMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  ❌ Ошибка
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setCallout('quote').run()
                    setShowCalloutsMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  💬 Цитата
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Insert */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => setShowLinkDialog(!showLinkDialog)}
            className={editor.isActive('link') ? styles.active : ''}
            title="Добавить ссылку"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => setShowImageDialog(!showImageDialog)}
            title="Добавить изображение (URL)"
          >
            🖼️
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Загрузить изображение"
          >
            📤
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => setShowYoutubeDialog(!showYoutubeDialog)}
            title="Вставить видео YouTube"
          >
            📹
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Горизонтальная линия"
          >
            ─
          </button>
        </div>

        {/* Table */}
        <div className={styles.toolbarGroup}>
          <div className={styles.dropdown}>
            <button
              type="button"
              className={styles.dropdownTrigger}
              onClick={() => setShowTableMenu(!showTableMenu)}
              title="Таблица"
            >
              📊 Таблица ▼
            </button>
            {showTableMenu && (
              <div className={styles.dropdownMenu}>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    setShowTableMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  Вставить таблицу
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addColumnBefore().run()
                    setShowTableMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  Добавить столбец слева
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addColumnAfter().run()
                    setShowTableMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  Добавить столбец справа
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteColumn().run()
                    setShowTableMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  Удалить столбец
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addRowBefore().run()
                    setShowTableMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  Добавить строку сверху
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addRowAfter().run()
                    setShowTableMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  Добавить строку снизу
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteRow().run()
                    setShowTableMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  Удалить строку
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteTable().run()
                    setShowTableMenu(false)
                  }}
                  className={styles.dropdownItem}
                >
                  Удалить таблицу
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Utils */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Отменить (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Повторить (Ctrl+Y)"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className={styles.dialog}>
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSetLink()}
            className={styles.dialogInput}
          />
          <div className={styles.dialogButtons}>
            <button type="button" onClick={handleSetLink} className={styles.dialogButtonPrimary}>
              Добавить
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkDialog(false)
                setLinkUrl('')
              }}
              className={styles.dialogButtonSecondary}
            >
              Отмена
            </button>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetLink().run()
                  setShowLinkDialog(false)
                }}
                className={styles.dialogButtonDanger}
              >
                Удалить ссылку
              </button>
            )}
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className={styles.dialog}>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
            className={styles.dialogInput}
          />
          <div className={styles.dialogButtons}>
            <button type="button" onClick={handleAddImageUrl} className={styles.dialogButtonPrimary}>
              Добавить
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImageDialog(false)
                setImageUrl('')
              }}
              className={styles.dialogButtonSecondary}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* YouTube Dialog */}
      {showYoutubeDialog && (
        <div className={styles.dialog}>
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddYoutube()}
            className={styles.dialogInput}
          />
          <div className={styles.dialogButtons}>
            <button type="button" onClick={handleAddYoutube} className={styles.dialogButtonPrimary}>
              Вставить
            </button>
            <button
              type="button"
              onClick={() => {
                setShowYoutubeDialog(false)
                setYoutubeUrl('')
              }}
              className={styles.dialogButtonSecondary}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}
