import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

/**
 * Higher-order component to protect pages that require authentication
 * @param {Component} Component - Component to protect
 * @param {Object} options - Options for the HOC
 * @returns {Component} Protected component
 */
export function withAuth(Component, options = {}) {
  const {
    redirectTo = '/auth/login',
    loadingComponent = null
  } = options

  return function ProtectedRoute(props) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const loading = status === 'loading'

    useEffect(() => {
      if (!loading && !session) {
        router.push(redirectTo)
      }
    }, [loading, session, router])

    if (loading) {
      return loadingComponent || (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Загрузка...
        </div>
      )
    }

    if (!session) {
      return null
    }

    return <Component {...props} session={session} />
  }
}

/**
 * Check if user is authenticated on server side (for getServerSideProps)
 * @param {Object} context - Next.js context
 * @returns {Object} Props or redirect
 */
export async function requireAuthServerSide(context) {
  const { getSession } = require('next-auth/react')
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false
      }
    }
  }

  return {
    props: {
      session
    }
  }
}
