// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {Asana} from 'types'
import {HttpMethod, request} from './request'

export const getAsanasList = request.bind<null, string, [], Promise<Asana[]>>(
  null,
  HttpMethod.GET,
  'api/asanas/getAll'
)
