import React from 'react'

import styles from './styles.module.css'

interface LabelProps {
  htmlFor: string
  children: React.ReactNode
}

export const Label: React.FC<LabelProps> = ({children, htmlFor}) => {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      {children}
    </label>
  )
}
