const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@blog.com' },
    update: {},
    create: {
      email: 'admin@blog.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  })
  console.log('Created user:', user.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: { name: 'Technology', slug: 'technology' },
    }),
    prisma.category.upsert({
      where: { slug: 'programming' },
      update: {},
      create: { name: 'Programming', slug: 'programming' },
    }),
    prisma.category.upsert({
      where: { slug: 'tutorials' },
      update: {},
      create: { name: 'Tutorials', slug: 'tutorials' },
    }),
  ])
  console.log('Created categories:', categories.length)

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'javascript' },
      update: {},
      create: { name: 'JavaScript', slug: 'javascript' },
    }),
    prisma.tag.upsert({
      where: { slug: 'react' },
      update: {},
      create: { name: 'React', slug: 'react' },
    }),
    prisma.tag.upsert({
      where: { slug: 'nextjs' },
      update: {},
      create: { name: 'Next.js', slug: 'nextjs' },
    }),
    prisma.tag.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: { name: 'Web Development', slug: 'web-development' },
    }),
  ])
  console.log('Created tags:', tags.length)

  // Create sample posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Next.js',
      excerpt: 'Learn the basics of Next.js and build your first application.',
      content: '<h2>Introduction to Next.js</h2><p>Next.js is a powerful React framework that enables you to build full-stack web applications.</p><h3>Key Features</h3><ul><li>Server-side rendering</li><li>Static site generation</li><li>API routes</li><li>File-based routing</li></ul>',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: user.id,
      categories: {
        create: [
          { categoryId: categories[0].id },
          { categoryId: categories[1].id },
        ],
      },
      tags: {
        create: [
          { tagId: tags[2].id },
          { tagId: tags[3].id },
        ],
      },
    },
  })
  console.log('Created post:', post1.title)

  const post2 = await prisma.post.create({
    data: {
      title: 'Building a Blog with TipTap Editor',
      excerpt: 'Step-by-step guide to integrate TipTap rich text editor in your Next.js blog.',
      content: '<h2>Why TipTap?</h2><p>TipTap is a headless editor framework that gives you full control over your editing experience.</p><h3>Installation</h3><p>Install the required packages:</p><pre>npm install @tiptap/react @tiptap/starter-kit</pre>',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: user.id,
      categories: {
        create: [{ categoryId: categories[2].id }],
      },
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[1].id },
        ],
      },
    },
  })
  console.log('Created post:', post2.title)

  const post3 = await prisma.post.create({
    data: {
      title: 'Draft Post: Upcoming Features',
      excerpt: 'This is a draft post showcasing the draft functionality.',
      content: '<p>This post is in draft status and should not be visible to public users.</p>',
      status: 'DRAFT',
      authorId: user.id,
      categories: {
        create: [{ categoryId: categories[1].id }],
      },
      tags: {
        create: [{ tagId: tags[2].id }],
      },
    },
  })
  console.log('Created draft post:', post3.title)

  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
