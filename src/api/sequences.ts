// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {Sequence} from 'types'
import {HttpMethod, request} from './request'

export const createSequence = request.bind<
  null,
  string,
  [Sequence],
  Promise<Sequence>
>(null, HttpMethod.POST, 'api/sequences/create')

export const updateSequence = request.bind<
  null,
  string,
  [Sequence],
  Promise<Sequence>
>(null, HttpMethod.PUT, 'api/sequences/update')

export const deleteSequence = request.bind<
  null,
  string,
  [{id: number}],
  Promise<void>
>(null, HttpMethod.DELETE, 'api/sequences/delete')

export const getSequence = request.bind<
  null,
  string,
  [{id: number}],
  Promise<Sequence>
>(null, HttpMethod.GET, 'api/sequences/get')

export const getUserSequence = request.bind<
  null,
  string,
  [],
  Promise<Sequence[]>
>(null, HttpMethod.GET, 'api/sequences/getUserSequences')

export const getGlobalSequence = request.bind<
  null,
  string,
  [],
  Promise<Sequence[]>
>(null, HttpMethod.GET, 'api/sequences/getGlobalSequences')
