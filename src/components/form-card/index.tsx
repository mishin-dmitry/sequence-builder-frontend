import React, {PropsWithChildren} from 'react'

import {Typography} from 'antd'

import styles from './styles.module.css'

interface FormCardProps extends PropsWithChildren {
  title: string
  footer?: React.ReactNode
}

export const FormCard: React.FC<FormCardProps> = ({
  children,
  title,
  footer
}) => (
  <div className={styles.pageWrapper}>
    <div className={styles.card}>
      <div className={styles.main}>
        <Typography.Title level={1} className={styles.title}>
          {title}
        </Typography.Title>
        {children}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  </div>
)
