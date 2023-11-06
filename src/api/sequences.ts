// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {Sequence, SequenceRequest} from 'types'
import {HttpMethod, request} from './request'

export const createSequence = request.bind<
  null,
  string,
  [SequenceRequest],
  Promise<Sequence>
>(null, HttpMethod.POST, 'api/sequences/create')

export const updateSequence = (
  id: string,
  data: SequenceRequest
): Promise<Sequence> => request(HttpMethod.PUT, `api/sequences/${id}`, data)

export const deleteSequence = (id: number): Promise<void> =>
  request(HttpMethod.DELETE, `api/sequences/${id}`)

export const getSequence = (
  id: string,
  headers?: Record<string, string>
): Promise<Sequence> =>
  request(HttpMethod.GET, `api/sequences/${id}`, undefined, headers)

export const getUserSequences = (
  headers?: Record<string, string>
): Promise<Sequence[]> =>
  request(HttpMethod.GET, 'api/sequences-list/my', undefined, headers)

export const getPublicSequences = (
  headers?: Record<string, string>
): Promise<Sequence[]> =>
  request(HttpMethod.GET, 'api/sequences-list/public', undefined, headers)
