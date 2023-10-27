// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {Sequence} from 'types'
import {HttpMethod, request} from './request'

export const createSequence = request.bind<
  null,
  string,
  [Sequence],
  Promise<void>
>(null, HttpMethod.POST, 'api/sequences/create')
