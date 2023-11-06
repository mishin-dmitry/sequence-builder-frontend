import React from 'react'

import {MySequences} from './my-sequences'
import {getUserSequences} from 'api'
import {cookies} from 'next/headers'

const MySequencesPage: React.FC = async () => {
  const sequences = await getUserSequences({cookies: cookies().toString()})

  return <MySequences sequences={sequences} />
}

export default MySequencesPage
