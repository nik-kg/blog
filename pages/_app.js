import '@/styles/globals.css'
import '@automattic/isolated-block-editor/build-browser/core.css'
import '@automattic/isolated-block-editor/build-browser/isolated-block-editor.css'
import { SessionProvider } from 'next-auth/react'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
