import { useState, useRef, useEffect } from 'react'
import styles from './BlockHandle.module.css'

export default function BlockHandle({ editor, getPos }) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleDelete = () => {
    const pos = getPos()
    if (pos !== undefined) {
      editor.chain().focus().deleteRange({ from: pos, to: pos + editor.state.doc.nodeAt(pos).nodeSize }).run()
    }
    setShowMenu(false)
  }

  const handleDuplicate = () => {
    const pos = getPos()
    if (pos !== undefined) {
      const node = editor.state.doc.nodeAt(pos)
      editor.chain().focus().insertContentAt(pos + node.nodeSize, node.toJSON()).run()
    }
    setShowMenu(false)
  }

  const handleTurnInto = (type, level = null) => {
    const pos = getPos()
    if (pos === undefined) return

    editor.chain().focus().setTextSelection({ from: pos, to: pos + 1 })

    if (type === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else if (type === 'heading') {
      editor.chain().focus().setHeading({ level }).run()
    } else if (type === 'blockquote') {
      editor.chain().focus().toggleBlockquote().run()
    } else if (type.startsWith('callout-')) {
      const calloutType = type.replace('callout-', '')
      editor.chain().focus().setCallout(calloutType).run()
    }

    setShowMenu(false)
  }

  return (
    <div className={styles.blockHandle}>
      <button
        className={styles.handleButton}
        onClick={() => setShowMenu(!showMenu)}
        title="Меню блока"
      >
        ⋮⋮
      </button>

      {showMenu && (
        <div ref={menuRef} className={styles.menu}>
          <div className={styles.menuSection}>
            <div className={styles.menuLabel}>Действия</div>
            <button onClick={handleDelete} className={styles.menuItem}>
              🗑️ Удалить
            </button>
            <button onClick={handleDuplicate} className={styles.menuItem}>
              📄 Дублировать
            </button>
          </div>

          <div className={styles.menuDivider} />

          <div className={styles.menuSection}>
            <div className={styles.menuLabel}>Превратить в</div>
            <button onClick={() => handleTurnInto('paragraph')} className={styles.menuItem}>
              📝 Параграф
            </button>
            <button onClick={() => handleTurnInto('heading', 1)} className={styles.menuItem}>
              <strong>H1</strong> Заголовок 1
            </button>
            <button onClick={() => handleTurnInto('heading', 2)} className={styles.menuItem}>
              <strong>H2</strong> Заголовок 2
            </button>
            <button onClick={() => handleTurnInto('heading', 3)} className={styles.menuItem}>
              <strong>H3</strong> Заголовок 3
            </button>
            <button onClick={() => handleTurnInto('blockquote')} className={styles.menuItem}>
              &ldquo; Цитата
            </button>
          </div>

          <div className={styles.menuDivider} />

          <div className={styles.menuSection}>
            <div className={styles.menuLabel}>Блоки</div>
            <button onClick={() => handleTurnInto('callout-info')} className={styles.menuItem}>
              💡 Инфо
            </button>
            <button onClick={() => handleTurnInto('callout-warning')} className={styles.menuItem}>
              ⚠️ Предупреждение
            </button>
            <button onClick={() => handleTurnInto('callout-success')} className={styles.menuItem}>
              ✅ Успех
            </button>
            <button onClick={() => handleTurnInto('callout-danger')} className={styles.menuItem}>
              ❌ Ошибка
            </button>
            <button onClick={() => handleTurnInto('callout-quote')} className={styles.menuItem}>
              💬 Цитата-блок
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
