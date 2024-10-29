// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type {AsanaGroupCategory} from 'types'
import {HttpMethod, request} from './request'

export const getAsanaGroupsCategoriesList = request.bind<
  null,
  string,
  [],
  Promise<AsanaGroupCategory[]>
>(null, HttpMethod.GET, 'api/asana-group-categories/getAll')
