import React from 'react'

import Head from 'next/head'

interface MetaProps {
  title: string
  description: string
  keywords: string
}

export const Meta: React.FC<MetaProps> = ({title, description, keywords}) => (
  <Head>
    <meta name="description" content={description} />
    <meta name="title" content={title} />
    <meta name="keywords" content={keywords} />
    <meta name="yandex-verification" content="6abcd5e5b74293d6" />
    <title>{title}</title>
  </Head>
)
