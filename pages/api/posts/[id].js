import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendError, sendSuccess, handlePrismaError } from '@/lib/api-error'
import { validatePost } from '@/lib/validation'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    return handleGetPost(req, res, id)
  }

  if (req.method === 'PUT') {
    return handleUpdatePost(req, res, id)
  }

  if (req.method === 'DELETE') {
    return handleDeletePost(req, res, id)
  }

  return sendError(res, 405, 'Метод не поддерживается')
}

// GET /api/posts/[id] - Get single post
async function handleGetPost(req, res, id) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
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
        },
        images: true
      }
    })

    if (!post) {
      return sendError(res, 404, 'Пост не найден')
    }

    // Format response
    const formattedPost = {
      ...post,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag)
    }

    return sendSuccess(res, { post: formattedPost })

  } catch (error) {
    console.error('Get post error:', error)
    return sendError(res, 500, 'Ошибка при получении поста')
  }
}

// PUT /api/posts/[id] - Update post
async function handleUpdatePost(req, res, id) {
  const session = await requireAuth(req, res)
  if (!session) return

  try {
    const { title, content, excerpt, status, categoryIds, tagIds } = req.body

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return sendError(res, 404, 'Пост не найден')
    }

    // Check ownership
    if (existingPost.authorId !== session.user.id) {
      return sendError(res, 403, 'Нет прав для редактирования этого поста')
    }

    // Validate post data
    const validation = validatePost({ title, content, excerpt, status })
    if (!validation.isValid) {
      return sendError(res, 400, 'Ошибка валидации', { errors: validation.errors })
    }

    // Prepare update data
    const updateData = {
      title: title?.trim(),
      content,
      excerpt: excerpt?.trim() || null,
      status
    }

    // Update publishedAt if status changed to PUBLISHED
    if (status === 'PUBLISHED' && existingPost.status === 'DRAFT') {
      updateData.publishedAt = new Date()
    }

    // If status changed to DRAFT, clear publishedAt
    if (status === 'DRAFT' && existingPost.status === 'PUBLISHED') {
      updateData.publishedAt = null
    }

    // Update categories if provided
    if (categoryIds !== undefined) {
      // Delete existing relations
      await prisma.postCategory.deleteMany({
        where: { postId: id }
      })

      // Create new relations
      if (categoryIds.length > 0) {
        await prisma.postCategory.createMany({
          data: categoryIds.map(categoryId => ({
            postId: id,
            categoryId
          }))
        })
      }
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      // Delete existing relations
      await prisma.postTag.deleteMany({
        where: { postId: id }
      })

      // Create new relations
      if (tagIds.length > 0) {
        await prisma.postTag.createMany({
          data: tagIds.map(tagId => ({
            postId: id,
            tagId
          }))
        })
      }
    }

    // Update post
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
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

    // Format response
    const formattedPost = {
      ...post,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag)
    }

    return sendSuccess(res, { post: formattedPost })

  } catch (error) {
    console.error('Update post error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при обновлении поста')
  }
}

// DELETE /api/posts/[id] - Delete post
async function handleDeletePost(req, res, id) {
  const session = await requireAuth(req, res)
  if (!session) return

  try {
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return sendError(res, 404, 'Пост не найден')
    }

    // Check ownership
    if (existingPost.authorId !== session.user.id) {
      return sendError(res, 403, 'Нет прав для удаления этого поста')
    }

    // Delete post (cascade will handle relations)
    await prisma.post.delete({
      where: { id }
    })

    return sendSuccess(res, { message: 'Пост успешно удален' })

  } catch (error) {
    console.error('Delete post error:', error)

    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      return sendError(res, prismaError.status, prismaError.message)
    }

    return sendError(res, 500, 'Ошибка при удалении поста')
  }
}
