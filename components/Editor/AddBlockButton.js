import { useState, useRef, useEffect } from 'react'
import styles from './AddBlockButton.module.css'

export default function AddBlockButton({ editor, getPos }) {
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

  const insertBlock = (command) => {
    const pos = getPos()
    if (pos === undefined) return

    // Устанавливаем курсор в конец текущего блока
    const nodeSize = editor.state.doc.nodeAt(pos)?.nodeSize || 0
    const insertPos = pos + nodeSize

    editor.chain().focus().setTextSelection(insertPos)

    // Выполняем команду
    command()
    setShowMenu(false)
  }

  return (
    <div className={styles.addBlockButton}>
      <button
        className={styles.addButton}
        onClick={() => setShowMenu(!showMenu)}
        title="Добавить блок"
      >
        +
      </button>

      {showMenu && (
        <div ref={menuRef} className={styles.menu}>
          <div className={styles.menuSection}>
            <div className={styles.menuLabel}>Основное</div>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().insertContent({ type: 'paragraph' }).run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>📝</span>
              <div>
                <div className={styles.itemTitle}>Текст</div>
                <div className={styles.itemDesc}>Обычный параграф</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().insertContent({ type: 'heading', attrs: { level: 1 } }).run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>H1</span>
              <div>
                <div className={styles.itemTitle}>Заголовок 1</div>
                <div className={styles.itemDesc}>Большой заголовок</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().insertContent({ type: 'heading', attrs: { level: 2 } }).run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>H2</span>
              <div>
                <div className={styles.itemTitle}>Заголовок 2</div>
                <div className={styles.itemDesc}>Средний заголовок</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().insertContent({ type: 'heading', attrs: { level: 3 } }).run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>H3</span>
              <div>
                <div className={styles.itemTitle}>Заголовок 3</div>
                <div className={styles.itemDesc}>Маленький заголовок</div>
              </div>
            </button>
          </div>

          <div className={styles.menuDivider} />

          <div className={styles.menuSection}>
            <div className={styles.menuLabel}>Списки</div>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().toggleBulletList().run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>•</span>
              <div>
                <div className={styles.itemTitle}>Маркированный список</div>
                <div className={styles.itemDesc}>Создать список с точками</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().toggleOrderedList().run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>1.</span>
              <div>
                <div className={styles.itemTitle}>Нумерованный список</div>
                <div className={styles.itemDesc}>Создать нумерованный список</div>
              </div>
            </button>
          </div>

          <div className={styles.menuDivider} />

          <div className={styles.menuSection}>
            <div className={styles.menuLabel}>Блоки контента</div>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().toggleBlockquote().run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>&ldquo;</span>
              <div>
                <div className={styles.itemTitle}>Цитата</div>
                <div className={styles.itemDesc}>Выделить цитату</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                const url = prompt('URL изображения:')
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run()
                }
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>🖼️</span>
              <div>
                <div className={styles.itemTitle}>Изображение</div>
                <div className={styles.itemDesc}>Вставить картинку</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>📊</span>
              <div>
                <div className={styles.itemTitle}>Таблица</div>
                <div className={styles.itemDesc}>Вставить таблицу 3×3</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().setHorizontalRule().run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>─</span>
              <div>
                <div className={styles.itemTitle}>Разделитель</div>
                <div className={styles.itemDesc}>Горизонтальная линия</div>
              </div>
            </button>
          </div>

          <div className={styles.menuDivider} />

          <div className={styles.menuSection}>
            <div className={styles.menuLabel}>Callout блоки</div>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().setCallout('info').run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>💡</span>
              <div>
                <div className={styles.itemTitle}>Инфо</div>
                <div className={styles.itemDesc}>Информационный блок</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().setCallout('warning').run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>⚠️</span>
              <div>
                <div className={styles.itemTitle}>Предупреждение</div>
                <div className={styles.itemDesc}>Важное уведомление</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().setCallout('success').run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>✅</span>
              <div>
                <div className={styles.itemTitle}>Успех</div>
                <div className={styles.itemDesc}>Положительная информация</div>
              </div>
            </button>
            <button
              onClick={() => insertBlock(() => {
                editor.chain().focus().setCallout('danger').run()
              })}
              className={styles.menuItem}
            >
              <span className={styles.icon}>❌</span>
              <div>
                <div className={styles.itemTitle}>Ошибка</div>
                <div className={styles.itemDesc}>Критическая информация</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
