// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {User} from 'types'
import {HttpMethod, request} from './request'

export interface RegisterUserRequest {
  email: string
  password: string
  token: string
}

export const registerUser = request.bind<
  null,
  string,
  [RegisterUserRequest],
  Promise<User>
>(null, HttpMethod.POST, 'api/auth/signup')

export const login = request.bind<
  null,
  string,
  [RegisterUserRequest],
  Promise<User>
>(null, HttpMethod.POST, 'api/auth/login')
