export interface YandexMetrikaOption {
  key: number
  params?: {
    [key: string]: boolean
  }
}

const DEFAULT_YANDEX_METRICA_PARAMS = {
  clickmap: true,
  trackLinks: true,
  triggerEvent: true,
  accurateTrackBounce: true,
  trackHash: true,
  webvisor: true
}

const YANDEX_METRICS_KEY = 95190579

const waitForTarget = (
  getTarget: () => any,
  timeout = Infinity
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const limit = Date.now() + timeout

    function wait(): void {
      const target = getTarget()

      if (target) {
        resolve(target)

        return
      }

      if (Date.now() > limit) {
        reject(new Error('Waiting time is over'))

        return
      }

      setTimeout(() => {
        wait()
      }, 100)
    }

    wait()
  })
}

export const activateYandexMetrika = (): Promise<void> => {
  return new Promise((resolve) => {
    if (process.env.NODE_ENV === 'development') {
      resolve()

      return
    }
    /* eslint-disable */
    // prettier-ignore
    ;(function (m, e, t, r, i, k, a) {
      // @ts-ignore
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
      // @ts-ignore
      m[i].l = 1 * new Date(); k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, k.onload = () => resolve(), k.onerror = () => resolve(), a.parentNode.insertBefore(k, a)
    })
      (window, document, 'script', '//mc.yandex.ru/metrika/tag.js', 'ym')
    try {
      // @ts-ignore
      ym(YANDEX_METRICS_KEY, 'init', {
        ...DEFAULT_YANDEX_METRICA_PARAMS
      })
    } catch (e) {}
    /* eslint-enable */
  })
}

export const reachGoal = async (...args: any[]): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('yandexMetrikaReachGoal', args)

    return
  }

  try {
    const yaCounter = await waitForTarget(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      () => window.ym,
      1000
    )

    yaCounter(YANDEX_METRICS_KEY, 'reachGoal', args)
  } catch {}
}
