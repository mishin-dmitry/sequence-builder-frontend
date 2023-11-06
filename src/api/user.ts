// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {User} from 'types'
import {HttpMethod, request} from './request'

export const getUser = (headers): Promise<User> =>
  request(HttpMethod.GET, 'api/user/getUser', undefined, headers)
