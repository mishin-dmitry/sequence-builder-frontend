import React, {PropsWithChildren} from 'react'

import {Typography} from 'antd'

import styles from './styles.module.css'

export const FormCard: React.FC<PropsWithChildren & {title: string}> = ({
  children,
  title
}) => (
  <div className={styles.pageWrapper}>
    <div className={styles.card}>
      <Typography.Title level={1} className={styles.title}>
        {title}
      </Typography.Title>
      {children}
    </div>
  </div>
)
