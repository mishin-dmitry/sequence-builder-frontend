import React from 'react'

import {cookies} from 'next/headers'
import {EditAsanasBunch} from './edit-asanas-bunch'
import {getAsanasBunch} from 'api'

interface EditAsanasBunchProps {
  params: {
    id: string
  }
}

const EditAsanasBunchPage: React.FC<EditAsanasBunchProps> = async ({
  params: {id}
}) => {
  const asanasBunch = await getAsanasBunch(id, {cookies: cookies().toString()})

  if (!asanasBunch || asanasBunch.isFound === false) {
    return <div>Не найдено</div>
  }

  return <EditAsanasBunch asanasBunch={asanasBunch} />
}

export default EditAsanasBunchPage
