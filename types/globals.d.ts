declare module '*css' {
  interface Styles {
    [key: string]: string
  }
  const styles: Styles
  export default styles
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string
    API_ORIGIN: string
    CDN_ORIGIN: string
    API_PREFIX: string
  }
}
