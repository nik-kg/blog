import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/date'
import PostContent from '@/components/PostContent'
import styles from '@/styles/Post.module.css'

export default function Post({ post }) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Загрузка...</div>
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Пост не найден</h1>
          <Link href="/">Вернуться на главную</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{post.title} - Next.js Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Head>

      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          ← Вернуться к списку статей
        </Link>

        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>

            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <span className={styles.author}>
                  Автор: {post.author.name || post.author.email}
                </span>
                <span className={styles.date}>
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              {(post.categories.length > 0 || post.tags.length > 0) && (
                <div className={styles.taxonomy}>
                  {post.categories.length > 0 && (
                    <div className={styles.categories}>
                      <span className={styles.label}>Категории:</span>
                      {post.categories.map(cat => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          className={styles.categoryBadge}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {post.tags.length > 0 && (
                    <div className={styles.tags}>
                      <span className={styles.label}>Теги:</span>
                      {post.tags.map(tag => (
                        <Link
                          key={tag.id}
                          href={`/tags/${tag.slug}`}
                          className={styles.tagBadge}
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {post.excerpt && (
            <div className={styles.excerpt}>
              <p>{post.excerpt}</p>
            </div>
          )}

          <PostContent content={post.content} />
        </article>
      </div>
    </>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
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
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!post || post.status !== 'PUBLISHED') {
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
