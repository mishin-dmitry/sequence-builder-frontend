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
    <title>{title}</title>
  </Head>
)
