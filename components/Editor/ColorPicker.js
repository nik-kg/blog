import { useState } from 'react'
import styles from './ColorPicker.module.css'

const colors = [
  // Основные цвета
  { name: 'Черный', value: '#000000' },
  { name: 'Темно-серый', value: '#4A4A4A' },
  { name: 'Серый', value: '#9B9B9B' },
  { name: 'Светло-серый', value: '#D3D3D3' },
  { name: 'Белый', value: '#FFFFFF' },

  // Красные
  { name: 'Темно-красный', value: '#8B0000' },
  { name: 'Красный', value: '#DC143C' },
  { name: 'Светло-красный', value: '#FF6B6B' },
  { name: 'Розовый', value: '#FFB6C1' },

  // Оранжевые
  { name: 'Темно-оранжевый', value: '#FF8C00' },
  { name: 'Оранжевый', value: '#FFA500' },
  { name: 'Светло-оранжевый', value: '#FFB347' },
  { name: 'Персиковый', value: '#FFDAB9' },

  // Желтые
  { name: 'Золотой', value: '#FFD700' },
  { name: 'Желтый', value: '#FFFF00' },
  { name: 'Светло-желтый', value: '#FFFFE0' },
  { name: 'Кремовый', value: '#FFFACD' },

  // Зеленые
  { name: 'Темно-зеленый', value: '#006400' },
  { name: 'Зеленый', value: '#28A745' },
  { name: 'Светло-зеленый', value: '#90EE90' },
  { name: 'Мятный', value: '#98FB98' },

  // Синие
  { name: 'Темно-синий', value: '#00008B' },
  { name: 'Синий', value: '#0066FF' },
  { name: 'Светло-синий', value: '#87CEEB' },
  { name: 'Голубой', value: '#ADD8E6' },

  // Фиолетовые
  { name: 'Темно-фиолетовый', value: '#4B0082' },
  { name: 'Фиолетовый', value: '#8B5CF6' },
  { name: 'Светло-фиолетовый', value: '#DDA0DD' },
  { name: 'Лавандовый', value: '#E6E6FA' },
]

const backgroundColors = [
  { name: 'Прозрачный', value: 'transparent' },
  { name: 'Желтый выделитель', value: '#FFF59D' },
  { name: 'Зеленый выделитель', value: '#C5E1A5' },
  { name: 'Синий выделитель', value: '#BBDEFB' },
  { name: 'Красный выделитель', value: '#FFCDD2' },
  { name: 'Оранжевый выделитель', value: '#FFE0B2' },
  { name: 'Фиолетовый выделитель', value: '#E1BEE7' },
  { name: 'Серый фон', value: '#F5F5F5' },
]

export default function ColorPicker({ type = 'text', onSelect, currentColor }) {
  const [isOpen, setIsOpen] = useState(false)
  const colorList = type === 'background' ? backgroundColors : colors

  const handleColorSelect = (color) => {
    onSelect(color)
    setIsOpen(false)
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        title={type === 'text' ? 'Цвет текста' : 'Цвет фона'}
      >
        {type === 'text' ? '🎨' : '🖍️'}
        <span
          className={styles.colorPreview}
          style={{ backgroundColor: type === 'text' ? currentColor : currentColor, color: type === 'text' ? currentColor : 'transparent' }}
        >
          A
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.picker}>
            <div className={styles.header}>
              {type === 'text' ? 'Цвет текста' : 'Цвет фона'}
            </div>
            <div className={styles.grid}>
              {colorList.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.colorButton} ${currentColor === color.value ? styles.selected : ''}`}
                  style={{ backgroundColor: color.value, border: color.value === '#FFFFFF' || color.value === 'transparent' ? '1px solid #ddd' : 'none' }}
                  onClick={() => handleColorSelect(color.value)}
                  title={color.name}
                />
              ))}
            </div>
            {type === 'text' && (
              <button
                type="button"
                className={styles.resetButton}
                onClick={() => handleColorSelect(null)}
              >
                Сбросить цвет
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
