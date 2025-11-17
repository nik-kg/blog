import { useState } from 'react'
import dynamic from 'next/dynamic'
import styles from './BlockEditor.module.css'

// Динамический импорт IBE для избежания SSR проблем
// ВАЖНО: используем /build (не /build-module) чтобы избежать SCSS и конфликтов
const IsolatedBlockEditor = dynamic(
  () => import('@automattic/isolated-block-editor/build').then(mod => mod.IsolatedBlockEditor),
  { ssr: false }
)

export default function BlockEditor({ content = '', onChange, placeholder = 'Начните писать...' }) {
  const [initialContent] = useState(content || '')

  // Обработка изменений - IBE возвращает HTML напрямую
  const handleChange = (newContent) => {
    if (onChange) {
      onChange(newContent)
    }
  }

  return (
    <div className={styles.editorWrapper}>
      <IsolatedBlockEditor
        settings={{
          iso: {
            moreMenu: false,
            sidebar: {
              inspector: false,
            },
          },
          editor: {
            hasFixedToolbar: false,
          },
        }}
        onSave={(html) => handleChange(html)}
        initialContent={initialContent}
        placeholder={placeholder}
      />
    </div>
  )
}
