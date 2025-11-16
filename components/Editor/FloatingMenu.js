import { useEffect, useState, useRef } from 'react'
import ColorPicker from './ColorPicker'
import styles from './FloatingMenu.module.css'

export default function FloatingMenu({ editor }) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    const updatePosition = () => {
      const { state } = editor
      const { selection } = state
      const { from, to } = selection

      // Проверяем, есть ли выделение
      if (from === to) {
        setIsVisible(false)
        return
      }

      // Получаем координаты выделения
      const start = editor.view.coordsAtPos(from)
      const end = editor.view.coordsAtPos(to)

      // Вычисляем позицию меню
      const top = start.top - 50 // Над выделением
      const left = (start.left + end.left) / 2

      setPosition({ top, left })
      setIsVisible(true)
    }

    // Слушаем изменения селекции
    const { view } = editor
    const handleUpdate = () => {
      setTimeout(updatePosition, 10)
    }

    view.dom.addEventListener('mouseup', handleUpdate)
    view.dom.addEventListener('keyup', handleUpdate)

    return () => {
      view.dom.removeEventListener('mouseup', handleUpdate)
      view.dom.removeEventListener('keyup', handleUpdate)
    }
  }, [editor])

  const handleSetLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkDialog(false)
    }
  }

  if (!isVisible) return null

  return (
    <div
      ref={menuRef}
      className={styles.floatingMenu}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className={styles.menuButtons}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? styles.active : ''}
          title="Жирный (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? styles.active : ''}
          title="Курсив (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? styles.active : ''}
          title="Подчеркнутый (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? styles.active : ''}
          title="Зачеркнутый"
        >
          <s>S</s>
        </button>

        <div className={styles.divider} />

        <button
          onClick={() => setShowLinkDialog(!showLinkDialog)}
          className={editor.isActive('link') ? styles.active : ''}
          title="Ссылка"
        >
          🔗
        </button>

        <div className={styles.divider} />

        <ColorPicker
          color={editor.getAttributes('textStyle').color}
          onChange={(color) => editor.chain().focus().setColor(color).run()}
          type="text"
        />

        <ColorPicker
          color={editor.getAttributes('highlight').color}
          onChange={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
          type="background"
        />
      </div>

      {showLinkDialog && (
        <div className={styles.linkDialog}>
          <input
            type="url"
            placeholder="Вставьте ссылку..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSetLink()
              } else if (e.key === 'Escape') {
                setShowLinkDialog(false)
                setLinkUrl('')
              }
            }}
            autoFocus
          />
          <button onClick={handleSetLink}>✓</button>
          <button onClick={() => { setShowLinkDialog(false); setLinkUrl('') }}>✕</button>
        </div>
      )}
    </div>
  )
}
