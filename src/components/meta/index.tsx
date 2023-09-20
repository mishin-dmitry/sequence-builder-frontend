import React from 'react'

import Head from 'next/head'

interface MetaProps {
  title: string
  description: string
}

export const Meta: React.FC<MetaProps> = ({title, description}) => (
  <Head>
    <meta name="description" content={description} />
    <meta name="title" content={title} />
    <title>{title}</title>
  </Head>
)
