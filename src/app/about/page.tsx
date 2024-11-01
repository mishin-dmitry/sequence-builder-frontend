'use client'

import React from 'react'

import styles from './styles.module.css'

import {Button} from 'antd'
import {useSettings} from 'context/settings'
import {ExternalUrls} from 'lib/urls'

const EMBED_ID = 'KGqeZA_r660'

const AboutPage: React.FC = () => {
  const {isMobile} = useSettings()

  return (
    <div className={styles.page}>
      <div className={styles.iframeWrapper}>
        <iframe
          width="853"
          height="480"
          src={`https://www.youtube.com/embed/${EMBED_ID}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Обзор платформы"
        />
      </div>
      <Button
        href={ExternalUrls.CLOUD_TIPS}
        size={isMobile ? 'middle' : 'large'}
        target="_blank"
        className={styles.button}
        type="primary">
        Поддержать проект
      </Button>
    </div>
  )
}

export default AboutPage
