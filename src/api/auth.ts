// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {User} from 'types'
import {HttpMethod, request} from './request'

export interface RegisterUserRequest {
  email: string
  password: string
}

export interface UpdatePasswordRequest {
  token: string
  id: string
  password: string
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

export const logout = request.bind<null, string, [], Promise<void>>(
  null,
  HttpMethod.POST,
  'api/auth/logout'
)

export const getRecoveryLink = request.bind<
  null,
  string,
  [{email: string}],
  Promise<void>
>(null, HttpMethod.POST, 'api/auth/request-reset-password')

export const updatePassword = request.bind<
  null,
  string,
  [UpdatePasswordRequest],
  Promise<void>
>(null, HttpMethod.POST, 'api/auth/reset-password')
