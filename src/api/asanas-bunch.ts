// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {AsanaBunch} from 'types'
import {HttpMethod, request} from './request'

export interface AsanasBunchRequest {
  title: string
  asanas: number[]
}

export const createAsanasBunch = request.bind<
  null,
  string,
  [AsanasBunchRequest],
  Promise<AsanaBunch>
>(null, HttpMethod.POST, 'api/asanas-bunch/create')

export const updateAsanasBunch = (
  id: string,
  data: AsanasBunchRequest
): Promise<AsanaBunch> =>
  request(HttpMethod.PUT, `api/asanas-bunch/${id}`, data)

export const deleteAsanasBunch = (id: string): Promise<void> =>
  request(HttpMethod.DELETE, `api/asanas-bunch/${id}`)

export const getAsanasBunch = (
  id: string,
  headers?: Record<string, string>
): Promise<AsanaBunch> =>
  request(HttpMethod.GET, `api/asanas-bunch/${id}`, undefined, headers)

export const getUserAsanasBunches = (
  headers?: Record<string, string>
): Promise<AsanaBunch[]> =>
  request(HttpMethod.GET, 'api/asanas-bunch/my', undefined, headers)
