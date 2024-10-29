'use client'

import React from 'react'

import type {AsanaBunch} from 'types'

import {MainPageEditor} from 'components/main-page-editor'

interface EditAsanasBunchPageProps {
  asanasBunch: AsanaBunch
}

export const EditAsanasBunch: React.FC<EditAsanasBunchPageProps> = ({
  asanasBunch: propAsanasBunch
}) => <MainPageEditor isBunchMode isEditMode asanasBunch={propAsanasBunch} />
