// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {User} from 'types'
import {HttpMethod, request} from './request'

export const getUser = request.bind<
  null,
  string,
  [],
  Promise<User & {isFound: boolean}>
>(null, HttpMethod.GET, 'api/user/getUser')
