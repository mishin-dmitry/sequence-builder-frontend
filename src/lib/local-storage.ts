export const getItem = <T>(key: string): T => {
  let item

  try {
    const value = window.localStorage.getItem(key)

    item = JSON.parse(value ?? '')
  } catch {}

  return item ?? null
}

export const setItem = <T>(key: string, value: T): void => {
  try {
    const resultValue = JSON.stringify(value)

    window.localStorage.setItem(key, resultValue)
  } catch {}
}

export const removeItem = (key: string): void => {
  try {
    window.localStorage.removeItem(key)
  } catch {}
}
