import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import '@wordpress/format-library'
import styles from './BlockEditor.module.css'

// Динамический импорт IBE для избежания SSR проблем
// Используем build версию (не build-module) для избежания SCSS и "use client" ошибок
const IsolatedBlockEditor = dynamic(
  () => import('@automattic/isolated-block-editor/build').then(mod => mod.IsolatedBlockEditor),
  { ssr: false }
)

export default function BlockEditor({ content = '', onChange, placeholder = 'Начните писать...' }) {
  const [blocks, setBlocks] = useState([])
  const [isReady, setIsReady] = useState(false)
  const editorRef = useRef(null)

  // Инициализация WordPress блоков
  useEffect(() => {
    // Регистрируем все блоки WordPress
    const initializeBlocks = async () => {
      const { registerCoreBlocks } = await import('@wordpress/block-library')
      registerCoreBlocks()
      setIsReady(true)
    }

    initializeBlocks()
  }, [])

  // Конвертация HTML в блоки при первой загрузке
  useEffect(() => {
    if (isReady && content) {
      const parseHTMLToBlocks = async () => {
        const { parse } = await import('@wordpress/blocks')
        const parsedBlocks = parse(content)
        setBlocks(parsedBlocks)
      }
      parseHTMLToBlocks()
    }
  }, [content, isReady])

  // Обработка изменений
  const handleChange = async (newBlocks) => {
    setBlocks(newBlocks)

    if (onChange) {
      // Конвертируем блоки в HTML для сохранения
      const { serialize } = await import('@wordpress/blocks')
      const html = serialize(newBlocks)
      onChange(html)
    }
  }

  if (!isReady) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка редактора...</p>
      </div>
    )
  }

  return (
    <div className={styles.editorWrapper} ref={editorRef}>
      <IsolatedBlockEditor
        settings={{
          hasFixedToolbar: false,
          focusMode: false,
          isPreviewMode: false,
          isRTL: false,
          bodyPlaceholder: placeholder,
        }}
        onInput={handleChange}
        blocks={blocks}
      />
    </div>
  )
}
