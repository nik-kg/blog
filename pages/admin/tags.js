import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { withAuth } from '@/lib/withAuth'
import prisma from '@/lib/prisma'
import styles from '@/styles/AdminTaxonomy.module.css'

function AdminTags({ initialTags }) {
  const [tags, setTags] = useState(initialTags)
  const [formData, setFormData] = useState({ name: '', slug: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = editingId ? `/api/tags/${editingId}` : '/api/tags'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || 'Ошибка при сохранении тега')
        setLoading(false)
        return
      }

      if (editingId) {
        setTags(tags.map(t => t.id === editingId ? data.data.tag : t))
        alert('Тег успешно обновлен')
      } else {
        setTags([...tags, data.data.tag])
        alert('Тег успешно создан')
      }

      setFormData({ name: '', slug: '' })
      setEditingId(null)
      setLoading(false)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Ошибка при сохранении тега')
      setLoading(false)
    }
  }

  const handleEdit = (tag) => {
    setFormData({ name: tag.name, slug: tag.slug })
    setEditingId(tag.id)
    setError('')
  }

  const handleCancelEdit = () => {
    setFormData({ name: '', slug: '' })
    setEditingId(null)
    setError('')
  }

  const handleDelete = async (tagId) => {
    if (!confirm('Вы уверены, что хотите удалить этот тег? Он будет удален из всех постов.')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTags(tags.filter(t => t.id !== tagId))
        alert('Тег успешно удален')
      } else {
        const data = await response.json()
        alert(data.error?.message || 'Ошибка при удалении тега')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении тега')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Управление тегами - Админ панель</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Управление тегами</h1>
          <Link href="/admin" className={styles.backLink}>
            ← Назад к панели
          </Link>
        </header>

        <main className={styles.main}>
          <div className={styles.grid}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                {editingId ? 'Редактировать тег' : 'Создать тег'}
              </h2>

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Название *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="JavaScript"
                    required
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="slug" className={styles.label}>
                    Slug
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="javascript (опционально, создастся автоматически)"
                    className={styles.input}
                    disabled={loading}
                  />
                  <p className={styles.hint}>
                    Slug используется в URL. Оставьте пустым для автоматической генерации.
                  </p>
                </div>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? 'Сохранение...' : (editingId ? 'Обновить' : 'Создать')}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={styles.cancelButton}
                      disabled={loading}
                    >
                      Отмена
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className={styles.listSection}>
              <h2 className={styles.sectionTitle}>
                Все теги ({tags.length})
              </h2>

              {tags.length === 0 ? (
                <div className={styles.empty}>
                  <p>Нет тегов</p>
                </div>
              ) : (
                <div className={styles.list}>
                  {tags.map(tag => (
                    <div key={tag.id} className={styles.item}>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemName}>#{tag.name}</h3>
                        <p className={styles.itemSlug}>/{tag.slug}</p>
                        {tag._count && (
                          <p className={styles.itemCount}>
                            {tag._count.posts} {pluralize(tag._count.posts, 'пост', 'поста', 'постов')}
                          </p>
                        )}
                      </div>
                      <div className={styles.itemActions}>
                        <button
                          onClick={() => handleEdit(tag)}
                          className={styles.editButton}
                          disabled={loading}
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className={styles.deleteButton}
                          disabled={loading}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default withAuth(AdminTags)

export async function getServerSideProps() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return {
      props: {
        initialTags: tags
      }
    }
  } catch (error) {
    console.error('Error fetching tags:', error)
    return {
      props: {
        initialTags: []
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
