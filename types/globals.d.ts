declare module '*css' {
  interface Styles {
    [key: string]: string
  }
  const styles: Styles
  export default styles
}
