import React from 'react'

import {getSequence} from 'api'
import {EditSequence} from './edit-sequence'
import {cookies} from 'next/headers'

interface EditSequenceProps {
  params: {
    id: string
  }
}

const EditSequencePage: React.FC<EditSequenceProps> = async ({
  params: {id}
}) => {
  const sequence = await getSequence(id, {cookies: cookies().toString()})

  if (!sequence || sequence.isFound === false) {
    return <div>Не найдено</div>
  }

  return <EditSequence sequence={sequence} />
}

export default EditSequencePage
