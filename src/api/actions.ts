import type {Asana} from 'types'
import {HttpMethod, request} from './request'

export interface CreateAsanaRequest {
  name: string
  description: string
  image: File
}

export const getAsanasList = request.bind<null, string, [], Promise<Asana[]>>(
  null,
  HttpMethod.GET,
  process.env.API_PREFIX
)
