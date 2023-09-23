import React from 'react'

import {Spin} from 'antd'

import styles from './styles.module.css'

export const Spinner: React.FC = () => {
  return (
    <div className={styles.spinner}>
      <Spin size="large" />
    </div>
  )
}
