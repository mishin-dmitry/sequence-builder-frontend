import React from 'react'
import {createCache, extractStyle, StyleProvider} from '@ant-design/cssinjs'
import Document, {Head, Html, Main, NextScript} from 'next/document'
import type {DocumentContext} from 'next/document'

const MyDocument = ({theme}): React.ReactNode => {
  return (
    <Html lang="ru">
      <Head />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `const theme = localStorage.getItem('themePreference');

        if (theme === '"dark"') {
          document.documentElement.setAttribute("data-theme", "dark");
        }`
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

if (MyDocument) {
  MyDocument.getInitialProps = async (ctx: DocumentContext) => {
    const cache = createCache()
    const originalRenderPage = ctx.renderPage

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => (
          <StyleProvider cache={cache}>
            <App {...props} />
          </StyleProvider>
        )
      })

    const initialProps = await Document.getInitialProps(ctx)
    const style = extractStyle(cache, true)

    const theme = (ctx.req as any)?.cookies?.seq_theme ?? 'light'

    return {
      ...initialProps,
      theme,
      styles: (
        <>
          {initialProps.styles}
          <style dangerouslySetInnerHTML={{__html: style}} />
        </>
      )
    }
  }
}

export default MyDocument
