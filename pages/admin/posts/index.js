import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { withAuth } from '@/lib/withAuth'
import { formatRelativeTime } from '@/lib/date'
import styles from '@/styles/AdminPosts.module.css'

function AdminPostsList({ initialPosts }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)

  const handleDelete = async (postId) => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId))
        alert('Пост успешно удален')
      } else {
        const data = await response.json()
        alert(data.error?.message || 'Ошибка при удалении поста')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении поста')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (post) => {
    setLoading(true)

    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          status: newStatus
        })
      })

      if (response.ok) {
        const { data } = await response.json()
        setPosts(posts.map(p => p.id === post.id ? data.post : p))
        alert(`Пост ${newStatus === 'PUBLISHED' ? 'опубликован' : 'снят с публикации'}`)
      } else {
        const data = await response.json()
        alert(data.error?.message || 'Ошибка при обновлении статуса')
      }
    } catch (error) {
      console.error('Status toggle error:', error)
      alert('Ошибка при обновлении статуса')
    } finally {
      setLoading(false)
    }
  }

  const draftPosts = posts.filter(p => p.status === 'DRAFT')
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED')

  return (
    <>
      <Head>
        <title>Управление постами - Админ панель</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Управление постами</h1>
            <p className={styles.subtitle}>
              {posts.length} {pluralize(posts.length, 'пост', 'поста', 'постов')} всего
              ({publishedPosts.length} опубликовано, {draftPosts.length} черновиков)
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/admin" className={styles.buttonSecondary}>
              ← Назад к панели
            </Link>
            <Link href="/admin/posts/new" className={styles.button}>
              + Создать пост
            </Link>
          </div>
        </header>

        <main className={styles.main}>
          {posts.length === 0 ? (
            <div className={styles.empty}>
              <p>У вас пока нет постов</p>
              <Link href="/admin/posts/new" className={styles.button}>
                Создать первый пост
              </Link>
            </div>
          ) : (
            <div className={styles.table}>
              <table>
                <thead>
                  <tr>
                    <th>Заголовок</th>
                    <th>Статус</th>
                    <th>Категории</th>
                    <th>Обновлено</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>
                        <Link href={`/posts/${post.id}`} className={styles.postTitle}>
                          {post.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`${styles.status} ${styles[post.status.toLowerCase()]}`}>
                          {post.status === 'PUBLISHED' ? 'Опубликовано' : 'Черновик'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.categories}>
                          {post.categories.length > 0 ? (
                            post.categories.map(cat => (
                              <span key={cat.id} className={styles.categoryBadge}>
                                {cat.name}
                              </span>
                            ))
                          ) : (
                            <span className={styles.noData}>-</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.date}>
                        {formatRelativeTime(post.updatedAt)}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className={styles.editButton}
                            title="Редактировать"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleStatusToggle(post)}
                            disabled={loading}
                            className={styles.toggleButton}
                            title={post.status === 'PUBLISHED' ? 'Снять с публикации' : 'Опубликовать'}
                          >
                            {post.status === 'PUBLISHED' ? '👁️' : '📝'}
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={loading}
                            className={styles.deleteButton}
                            title="Удалить"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default withAuth(AdminPostsList)

export async function getServerSideProps() {
  const prisma = (await import('@/lib/prisma')).default

  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    })

    return {
      props: {
        initialPosts: posts.map(post => ({
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          publishedAt: post.publishedAt?.toISOString() || null,
          categories: post.categories.map(pc => pc.category)
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return {
      props: {
        initialPosts: []
      }
    }
  }
}

function pluralize(number, one, few, many) {
  const n = Math.abs(number) % 100
  const n1 = n % 10

  if (n > 10 && n < 20) return many
  if (n1 > 1 && n1 < 5) return few
  if (n1 === 1) return one
  return many
}
