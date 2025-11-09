import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/date'
import styles from '@/styles/Home.module.css'

export default function Home({ initialPosts, totalPosts }) {
  const [posts] = useState(initialPosts)

  return (
    <>
      <Head>
        <title>Next.js Blog</title>
        <meta name="description" content="Blog created with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.logo}>Next.js Blog</h1>
          <nav className={styles.nav}>
            <Link href="/">Главная</Link>
            <Link href="/admin">Админ</Link>
          </nav>
        </header>

        <main className={styles.main}>
          <div className={styles.hero}>
            <h2 className={styles.title}>Добро пожаловать в блог</h2>
            <p className={styles.subtitle}>
              {totalPosts} {pluralize(totalPosts, 'статья', 'статьи', 'статей')} опубликовано
            </p>
          </div>

          {posts.length === 0 ? (
            <div className={styles.empty}>
              <p>Пока нет опубликованных статей</p>
              <Link href="/admin/posts/new" className={styles.button}>
                Создать первую статью
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {posts.map(post => (
                <article key={post.id} className={styles.card}>
                  <Link href={`/posts/${post.id}`} className={styles.cardLink}>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    {post.excerpt && (
                      <p className={styles.cardExcerpt}>{post.excerpt}</p>
                    )}
                    <div className={styles.cardMeta}>
                      <span className={styles.cardDate}>
                        {formatDate(post.publishedAt)}
                      </span>
                      {post.categories.length > 0 && (
                        <div className={styles.cardCategories}>
                          {post.categories.map(cat => (
                            <span key={cat.id} className={styles.badge}>
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>

        <footer className={styles.footer}>
          <p>© 2024 Next.js Blog. Все права защищены.</p>
        </footer>
      </div>
    </>
  )
}

export async function getServerSideProps() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED'
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 12,
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

    const totalPosts = await prisma.post.count({
      where: { status: 'PUBLISHED' }
    })

    const formattedPosts = posts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() || null,
      categories: post.categories.map(pc => pc.category)
    }))

    return {
      props: {
        initialPosts: formattedPosts,
        totalPosts
      }
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return {
      props: {
        initialPosts: [],
        totalPosts: 0
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
