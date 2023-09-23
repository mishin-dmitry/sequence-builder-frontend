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
  try {
    const response = await fetch(`${process.env.API_ORIGIN}${endpoint}/`, {
      method: httpMethod,
      body: params,
      // body: JSON.stringify(params),
      headers: {
        // 'Content-Type': 'multipart/form-data'gd
        // 'Content-Length': '473',
        // 'Access-Control-Allow-Origin': '*'
        // 'Content-Type': 'application/json'
      }
    })

    return response.json()
  } catch (error) {
    console.error(error)

    throw error
  }
}
