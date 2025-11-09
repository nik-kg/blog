import Head from 'next/head'
import styles from '@/styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Next.js Blog</title>
        <meta name="description" content="Blog created with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Next.js Blog
        </h1>
        <p className={styles.description}>
          Blog with CRUD operations and TipTap editor
        </p>
      </main>
    </>
  )
}
