import { useSession, signOut } from 'next-auth/react'
import { withAuth } from '@/lib/withAuth'
import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Admin.module.css'

function AdminDashboard() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <>
      <Head>
        <title>Админ панель - Next.js Blog</title>
        <meta name="description" content="Панель управления блогом" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Админ панель</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {session?.user?.name || session?.user?.email}
            </span>
            <button onClick={handleSignOut} className={styles.logoutButton}>
              Выйти
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.welcome}>
            <h2>Добро пожаловать!</h2>
            <p>Вы успешно вошли в систему.</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>Посты</h3>
              <p>Управление постами блога</p>
              <div className={styles.cardActions}>
                <Link href="/admin/posts/new" className={styles.button}>
                  Создать пост
                </Link>
                <Link href="/admin/posts" className={styles.buttonSecondary}>
                  Все посты
                </Link>
              </div>
            </div>

            <div className={styles.card}>
              <h3>Категории</h3>
              <p>Управление категориями</p>
              <div className={styles.cardActions}>
                <Link href="/admin/categories" className={styles.button}>
                  Управление
                </Link>
              </div>
            </div>

            <div className={styles.card}>
              <h3>Теги</h3>
              <p>Управление тегами</p>
              <div className={styles.cardActions}>
                <Link href="/admin/tags" className={styles.button}>
                  Управление
                </Link>
              </div>
            </div>

            <div className={styles.card}>
              <h3>Изображения</h3>
              <p>Управление изображениями</p>
              <div className={styles.cardActions}>
                <Link href="/admin/images" className={styles.button}>
                  Управление
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.backLink}>
            <Link href="/">← Вернуться на главную</Link>
          </div>
        </main>
      </div>
    </>
  )
}

export default withAuth(AdminDashboard)
