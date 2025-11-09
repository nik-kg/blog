import styles from '@/styles/PostContent.module.css'

export default function PostContent({ content }) {
  return (
    <div
      className={styles.content}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
