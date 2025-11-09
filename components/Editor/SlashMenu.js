import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import styles from './SlashMenu.module.css'

const SlashMenu = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = index => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className={styles.menu}>
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`${styles.item} ${index === selectedIndex ? styles.selected : ''}`}
            key={index}
            onClick={() => selectItem(index)}
            type="button"
          >
            {item.title}
          </button>
        ))
      ) : (
        <div className={styles.item}>Ничего не найдено</div>
      )}
    </div>
  )
})

SlashMenu.displayName = 'SlashMenu'

export default SlashMenu
