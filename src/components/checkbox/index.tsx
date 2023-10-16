import React from 'react'
import {Checkbox as AntdCheckbox, CheckboxProps} from 'antd'

import dynamic from 'next/dynamic'

const Checkbox: React.FC<CheckboxProps> = ({children, ...props}) => (
  <AntdCheckbox {...props}>{children}</AntdCheckbox>
)

export default dynamic(() => Promise.resolve(Checkbox), {
  ssr: false
})
