import React from 'react'

import {getPublicSequences} from 'api/'
import {cookies} from 'next/headers'
import {PublicSequences} from './public-sequences'

const PublicSequencesPage: React.FC = async () => {
  const sequences = await getPublicSequences({cookies: cookies().toString()})

  return <PublicSequences sequences={sequences} />
}

export default PublicSequencesPage
