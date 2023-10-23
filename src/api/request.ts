// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete'
}

export const request = async <T = void>(
  httpMethod: HttpMethod,
  endpoint: string,
  params: Record<string, any>
): Promise<T> => {
  const response = await fetch(`${process.env.API_ORIGIN}${endpoint}/`, {
    method: httpMethod,
    body: JSON.stringify(params),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const parsedResponse = await response.json()

  if (parsedResponse.error) {
    throw new Error(parsedResponse.error)
  }

  return parsedResponse
}
