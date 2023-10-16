import React from 'react'

import {Urls} from 'lib/urls'

import type {PageProps} from 'types/page-props'
import {redirect} from 'next/navigation'

const RootPage: React.FC<PageProps> = () => {
  redirect(Urls.CREATE_SEQUENCE)
}

export default RootPage
