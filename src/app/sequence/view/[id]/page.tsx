import React from 'react'

// import {getSequence} from 'api'
import {ViewSequence} from './view-sequence'
// import {cookies} from 'next/headers'

import styles from './styles.module.css'

interface ViewSequenceProps {
  params: {
    id: string
  }
}

const ViewSequencePage: React.FC<ViewSequenceProps> = async () => {
  // const sequence = await getSequence(id, {cookies: cookies().toString()})

  // if (!sequence || sequence.isFound === false) {
  //   return <div>Не найдено</div>
  // }

  return (
    <div className={styles.root}>
      <ViewSequence />
    </div>
  )
}

export default ViewSequencePage
