# TODO: Next.js Blog with CRUD and TipTap Editor

## Phase 1: Initial Setup and Project Structure

- [ ] Initialize Next.js project with Pages Router
  ```bash
  npx create-next-app@latest . --use-npm
  # Select: Pages Router, TypeScript (optional), CSS
  ```

- [ ] Install core dependencies
  ```bash
  npm install pg @prisma/client
  npm install -D prisma
  npm install next-auth
  npm install bcryptjs
  npm install -D @types/bcryptjs
  ```

- [ ] Setup Prisma ORM
  - [ ] Initialize Prisma: `npx prisma init`
  - [ ] Configure `.env` with PostgreSQL connection string
  - [ ] Create initial database schema in `prisma/schema.prisma`

- [ ] Create project structure
  ```
  /pages
    /api
      /auth
      /posts
    /posts
    /admin
  /components
    /Layout
    /PostCard
    /PostForm
  /lib
    /prisma.js
    /auth.js
  /styles
  /public
  ```

---

## Phase 2: Database Schema and Models

- [ ] Define Prisma schema with models:
  - [ ] User model (id, email, password, name, createdAt)
  - [ ] Post model (id, title, content, excerpt, authorId, status, createdAt, updatedAt, publishedAt)
  - [ ] Category model (id, name, slug)
  - [ ] Tag model (id, name, slug)
  - [ ] PostCategory relation (many-to-many)
  - [ ] PostTag relation (many-to-many)
  - [ ] Image model (id, url, postId, createdAt)

- [ ] Run migrations
  - [ ] `npx prisma migrate dev --name init`
  - [ ] `npx prisma generate`

- [ ] Create seed data (optional)
  - [ ] Create `prisma/seed.js` with sample data
  - [ ] Add test user and posts

---

## Phase 3: Authentication System

- [ ] Setup NextAuth.js
  - [ ] Create `/pages/api/auth/[...nextauth].js`
  - [ ] Configure Credentials provider
  - [ ] Add session strategy and JWT configuration
  - [ ] Create password hashing utilities

- [ ] Create authentication pages
  - [ ] `/pages/auth/login.js` - Login form
  - [ ] `/pages/auth/register.js` - Registration form (optional)
  - [ ] Add CSS styling for auth forms

- [ ] Create auth utilities
  - [ ] `/lib/auth.js` - Helper functions for password hashing
  - [ ] `/lib/withAuth.js` - HOC for protected routes

- [ ] Test authentication flow
  - [ ] Login/logout functionality
  - [ ] Session persistence
  - [ ] Protected route access

---

## Phase 4: CRUD API Endpoints

### Posts API

- [ ] Create `/pages/api/posts/index.js`
  - [ ] GET - List all posts (with pagination, filters)
  - [ ] POST - Create new post (protected)

- [ ] Create `/pages/api/posts/[id].js`
  - [ ] GET - Get single post by ID
  - [ ] PUT - Update post (protected)
  - [ ] DELETE - Delete post (protected)

- [ ] Create `/pages/api/posts/search.js`
  - [ ] GET - Search posts by title/content/tags

### Categories API

- [ ] Create `/pages/api/categories/index.js`
  - [ ] GET - List all categories
  - [ ] POST - Create category (protected)

- [ ] Create `/pages/api/categories/[id].js`
  - [ ] GET - Get category with posts
  - [ ] PUT - Update category (protected)
  - [ ] DELETE - Delete category (protected)

### Tags API

- [ ] Create `/pages/api/tags/index.js`
  - [ ] GET - List all tags
  - [ ] POST - Create tag (protected)

- [ ] Create `/pages/api/tags/[id].js`
  - [ ] GET - Get tag with posts
  - [ ] PUT - Update tag (protected)
  - [ ] DELETE - Delete tag (protected)

### Images API

- [ ] Create `/pages/api/images/upload.js`
  - [ ] POST - Upload image (protected)
  - [ ] Configure file storage (local or cloud)

- [ ] Create `/pages/api/images/[id].js`
  - [ ] DELETE - Delete image (protected)

---

## Phase 5: Frontend Pages (Basic CRUD UI)

### Public Pages

- [ ] Create `/pages/index.js`
  - [ ] Display list of published posts
  - [ ] Add pagination
  - [ ] Add filters by category/tag
  - [ ] Add search functionality

- [ ] Create `/pages/posts/[id].js`
  - [ ] Display single post
  - [ ] Show categories and tags
  - [ ] Format content properly
  - [ ] Add "Back to posts" navigation

- [ ] Create `/pages/categories/[slug].js`
  - [ ] List posts by category

- [ ] Create `/pages/tags/[slug].js`
  - [ ] List posts by tag

### Admin Pages (Protected)

- [ ] Create `/pages/admin/index.js`
  - [ ] Dashboard with posts list (all statuses)
  - [ ] Quick actions (edit, delete, publish/draft)
  - [ ] Statistics (total posts, drafts, published)

- [ ] Create `/pages/admin/posts/new.js`
  - [ ] Form to create new post (basic textarea for now)
  - [ ] Title, excerpt, content fields
  - [ ] Category and tag selection
  - [ ] Draft/Publish toggle
  - [ ] Submit button

- [ ] Create `/pages/admin/posts/[id]/edit.js`
  - [ ] Pre-filled form to edit existing post
  - [ ] Same fields as create form

- [ ] Create `/pages/admin/categories.js`
  - [ ] Manage categories (CRUD)

- [ ] Create `/pages/admin/tags.js`
  - [ ] Manage tags (CRUD)

---

## Phase 6: Basic Components and Styling

- [ ] Create reusable components
  - [ ] `/components/Layout.js` - Main layout with header/footer
  - [ ] `/components/PostCard.js` - Post preview card
  - [ ] `/components/PostList.js` - List of post cards
  - [ ] `/components/Pagination.js` - Pagination component
  - [ ] `/components/CategoryBadge.js` - Category display
  - [ ] `/components/TagBadge.js` - Tag display
  - [ ] `/components/SearchBar.js` - Search input
  - [ ] `/components/Navigation.js` - Main navigation
  - [ ] `/components/AdminNav.js` - Admin sidebar/navigation

- [ ] Create CSS files
  - [ ] `/styles/globals.css` - Global styles and CSS variables
  - [ ] `/styles/Home.module.css` - Homepage styles
  - [ ] `/styles/Post.module.css` - Post page styles
  - [ ] `/styles/Admin.module.css` - Admin pages styles
  - [ ] `/styles/Auth.module.css` - Auth pages styles
  - [ ] Component-specific CSS modules

- [ ] Add responsive design
  - [ ] Mobile-friendly navigation
  - [ ] Responsive grid for post cards
  - [ ] Mobile forms optimization

---

## Phase 7: TipTap Editor Integration

- [ ] Install TipTap and extensions
  ```bash
  npm install @tiptap/react @tiptap/starter-kit
  npm install @tiptap/extension-image @tiptap/extension-link
  npm install @tiptap/extension-text-align @tiptap/extension-highlight
  npm install @tiptap/extension-underline @tiptap/extension-placeholder
  ```

- [ ] Create TipTap Editor component
  - [ ] `/components/Editor/TipTapEditor.js`
  - [ ] Configure basic extensions (heading, bold, italic, lists, etc.)
  - [ ] Add toolbar with formatting buttons
  - [ ] Add image upload integration
  - [ ] Add link handling

- [ ] Create editor styles
  - [ ] `/styles/Editor.module.css`
  - [ ] Style toolbar buttons
  - [ ] Style editor content area
  - [ ] Add focus states and hover effects

- [ ] Integrate editor into forms
  - [ ] Replace textarea in `/pages/admin/posts/new.js`
  - [ ] Replace textarea in `/pages/admin/posts/[id]/edit.js`
  - [ ] Handle content serialization (HTML or JSON)

- [ ] Create content renderer component
  - [ ] `/components/PostContent.js`
  - [ ] Render TipTap content on public post pages
  - [ ] Apply proper styling to rendered content

- [ ] Test editor functionality
  - [ ] Create post with rich formatting
  - [ ] Upload images in content
  - [ ] Add links
  - [ ] Save and display formatted content
  - [ ] Edit existing posts

---

## Phase 8: Enhanced Features

### Image Upload System

- [ ] Implement image upload handler
  - [ ] Configure multer or similar for file handling
  - [ ] Add file size and type validation
  - [ ] Store images in `/public/uploads`
  - [ ] Generate unique filenames

- [ ] Add image management
  - [ ] List uploaded images
  - [ ] Delete unused images
  - [ ] Image preview in editor

### Draft/Publish System

- [ ] Implement post status logic
  - [ ] Draft posts only visible to admin
  - [ ] Published posts visible to all
  - [ ] Set publishedAt timestamp on publish

- [ ] Add status toggle in admin UI
  - [ ] Quick publish/unpublish button
  - [ ] Status indicator badges

### Search Functionality

- [ ] Implement full-text search
  - [ ] Search by title and content
  - [ ] Search by tags and categories
  - [ ] Display search results

- [ ] Add search UI
  - [ ] Search bar in header
  - [ ] Search results page
  - [ ] "No results" state

### Filters and Sorting

- [ ] Add filter controls
  - [ ] Filter by category (dropdown)
  - [ ] Filter by tag (multi-select)
  - [ ] Filter by status (admin only)

- [ ] Add sorting options
  - [ ] Sort by date (newest/oldest)
  - [ ] Sort by title (A-Z)

---

## Phase 9: Polish and Optimization

- [ ] Add loading states
  - [ ] Skeleton loaders for posts
  - [ ] Loading spinners for forms
  - [ ] Disable buttons during submission

- [ ] Add error handling
  - [ ] Display API errors to users
  - [ ] 404 page for missing posts
  - [ ] Error boundaries for components

- [ ] Add form validation
  - [ ] Client-side validation for post forms
  - [ ] Required field indicators
  - [ ] Validation error messages

- [ ] Add confirmation dialogs
  - [ ] Confirm before deleting posts
  - [ ] Confirm before deleting categories/tags
  - [ ] Unsaved changes warning

- [ ] Improve accessibility
  - [ ] Add proper ARIA labels
  - [ ] Keyboard navigation support
  - [ ] Focus management in modals/forms

- [ ] Optimize performance
  - [ ] Add indexes to database queries
  - [ ] Implement query pagination limits
  - [ ] Optimize images (next/image)
  - [ ] Code splitting for admin pages

---

## Phase 10: Testing and Deployment

- [ ] Manual testing
  - [ ] Test all CRUD operations
  - [ ] Test authentication flow
  - [ ] Test editor functionality
  - [ ] Test on different browsers
  - [ ] Test responsive design

- [ ] Prepare for deployment
  - [ ] Set up production environment variables
  - [ ] Configure PostgreSQL for production
  - [ ] Add `.env.example` file
  - [ ] Update `.gitignore`

- [ ] Create deployment documentation
  - [ ] README.md with setup instructions
  - [ ] Database migration instructions
  - [ ] Environment variables documentation

- [ ] Deploy to server
  - [ ] Build production version: `npm run build`
  - [ ] Set up Node.js server (PM2 or similar)
  - [ ] Configure reverse proxy (Nginx)
  - [ ] Set up SSL certificate
  - [ ] Run database migrations on production

- [ ] Post-deployment verification
  - [ ] Test all features in production
  - [ ] Check logs for errors
  - [ ] Monitor performance

---

## Future Enhancements (Optional)

- [ ] Add comments system
- [ ] Add author profiles
- [ ] Add post views counter
- [ ] Add related posts
- [ ] Add RSS feed
- [ ] Add email notifications
- [ ] Add markdown support alongside TipTap
- [ ] Add post scheduling
- [ ] Add revision history
- [ ] Add multi-language support

---

## Notes

- **Database**: PostgreSQL with Prisma ORM
- **Editor**: TipTap for rich text editing
- **Auth**: NextAuth.js with credentials provider
- **Styling**: CSS Modules
- **Deployment**: Self-hosted server

## Estimated Timeline

- Phase 1-3: 1-2 days (Setup, DB, Auth)
- Phase 4-5: 2-3 days (API and basic UI)
- Phase 6: 1-2 days (Components and styling)
- Phase 7: 2-3 days (TipTap integration)
- Phase 8: 2-3 days (Enhanced features)
- Phase 9-10: 1-2 days (Polish and deployment)

**Total: ~10-15 days** (can vary based on experience and available time)
