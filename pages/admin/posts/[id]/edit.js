import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { withAuth } from '@/lib/withAuth'
import BlockEditor from '@/components/Editor/BlockEditor'
import prisma from '@/lib/prisma'
import styles from '@/styles/PostForm.module.css'

function EditPost({ post: initialPost }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: initialPost?.title || '',
    excerpt: initialPost?.excerpt || '',
    content: initialPost?.content || '',
    status: initialPost?.status || 'DRAFT'
  })
  const [selectedCategories, setSelectedCategories] = useState(
    initialPost?.categories?.map(c => c.id) || []
  )
  const [selectedTags, setSelectedTags] = useState(
    initialPost?.tags?.map(t => t.id) || []
  )
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load categories and tags
  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags')
        ])

        if (categoriesRes.ok) {
          const { data } = await categoriesRes.json()
          setCategories(data.categories)
        }

        if (tagsRes.ok) {
          const { data } = await tagsRes.json()
          setTags(data.tags)
        }
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }

    loadData()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/posts/${initialPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          categoryIds: selectedCategories,
          tagIds: selectedTags
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || 'Ошибка при обновлении поста')
        setLoading(false)
        return
      }

      alert('Пост успешно обновлен!')
      router.push('/admin/posts')
    } catch (err) {
      console.error('Submit error:', err)
      setError('Ошибка при обновлении поста')
      setLoading(false)
    }
  }

  if (!initialPost) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error}>
            Пост не найден
          </div>
          <Link href="/admin/posts">← Вернуться к постам</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Редактировать пост - Админ панель</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Редактировать пост</h1>
          <Link href="/admin/posts" className={styles.backLink}>
            ← Назад к постам
          </Link>
        </header>

        <main className={styles.main}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Заголовок *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Введите заголовок поста"
                required
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="excerpt" className={styles.label}>
                Краткое описание
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Краткое описание поста (необязательно)"
                rows="3"
                className={styles.textarea}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="content" className={styles.label}>
                Содержание *
              </label>
              <BlockEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="Содержание поста..."
              />
            </div>

            <div className={styles.row}>
              {categories.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Категории</label>
                  <div className={styles.checkboxGroup}>
                    {categories.map(cat => (
                      <label key={cat.id} className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => handleCategoryToggle(cat.id)}
                          disabled={loading}
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Теги</label>
                  <div className={styles.checkboxGroup}>
                    {tags.map(tag => (
                      <label key={tag.id} className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => handleTagToggle(tag.id)}
                          disabled={loading}
                        />
                        <span>#{tag.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.label}>
                Статус
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
                disabled={loading}
              >
                <option value="DRAFT">Черновик</option>
                <option value="PUBLISHED">Опубликовано</option>
              </select>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
              <Link href="/admin/posts" className={styles.cancelButton}>
                Отмена
              </Link>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}

export default withAuth(EditPost)

export async function getServerSideProps({ params }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!post) {
      return {
        props: {
          post: null
        }
      }
    }

    return {
      props: {
        post: {
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          publishedAt: post.publishedAt?.toISOString() || null,
          categories: post.categories.map(pc => pc.category),
          tags: post.tags.map(pt => pt.tag)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return {
      props: {
        post: null
      }
    }
  }
}
