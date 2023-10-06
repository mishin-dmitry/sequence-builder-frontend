// NOTE https://github.com/diegomura/react-pdf/issues/1234
import {Text, Svg, Rect, G, ClipPath, Defs, Path} from '@react-pdf/renderer'
import {parse, RootNode} from 'svg-parser'

// https://dev.to/qausim/convert-html-inline-styles-to-a-style-object-for-react-components-2cbi
const formatStringToCamelCase = (str: string): string => {
  const splitted = str.split('-')

  if (splitted.length === 1) return splitted[0]

  return (
    splitted[0] +
    splitted
      .slice(1)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join('')
  )
}

export const getStyleObjectFromString = (
  str?: string
): Record<string, string> => {
  const style: any = {}

  if (!str) return {}

  str.split(';').forEach((el) => {
    const [property, value] = el.split(':')

    if (!property) return

    const formattedProperty = formatStringToCamelCase(property.trim())

    style[formattedProperty] = value.trim()
  })

  return style
}

function parseIntAttributes(attr?: string | number): number | string {
  if (!attr) return ''

  if (typeof attr === 'number') return attr

  if (attr.includes('px')) return attr

  return Number(attr)
}

export const svgToComponent = (node: any): any => {
  const render = (node: any): any => {
    let Component: any
    let componentProps = {}

    if (!node.tagName) {
      throw new Error(`tagName is doesn't exist`)
    }

    const hasWidth = !!node.properties?.width

    switch (node.tagName.toUpperCase()) {
      case 'SVG':
        Component = Svg
        componentProps = {
          viewBox: node.properties?.viewBox,
          height: parseIntAttributes(node.properties?.height) || 64,
          width: hasWidth ? parseIntAttributes(node.properties?.width) : 64,
          style: {
            fontSize: '12px',
            margin: 5
          }
        }
        break

      case 'RECT':
        Component = Rect
        componentProps = {
          x: parseIntAttributes(node.properties?.x),
          y: parseIntAttributes(node.properties?.y),
          fill: node.properties?.fill,
          width: parseIntAttributes(node.properties?.width),
          height: parseIntAttributes(node.properties?.height),
          rx: parseIntAttributes(node.properties?.rx),
          ry: parseIntAttributes(node.properties?.ry)
        }
        break

      case 'CLIPPATH':
        Component = ClipPath
        break

      case 'DEFS':
        Component = Defs
        break

      case 'G':
        Component = G
        componentProps = {
          'data-z-index': node.properties?.dataZIndex,
          opacity: node.properties?.opacity,
          transform: node.properties?.transform,
          'clip-path': node.properties?.clipPath,
          visibility: node.properties?.visibility,
          style: getStyleObjectFromString(node.properties?.style as string)
        }
        break

      case 'TEXT':
        Component = Text

        componentProps = {
          x: parseIntAttributes(node.properties?.x),
          'text-anchor': node.properties?.textAnchor,
          'data-z-index': node.properties?.dataZIndex,
          style: getStyleObjectFromString(node.properties?.style as string),
          y: parseIntAttributes(node.properties?.y)
        }
        break

      case 'PATH':
        Component = Path
        componentProps = {
          d: node.properties?.d,
          fill: node.properties?.fill ?? '#000000',
          style: getStyleObjectFromString(node.properties?.style as string)
        }
        break

      default:
        throw new Error(`unsupported type ${node.tagName}`)
    }

    if (node.children) {
      return (
        <Component {...componentProps} key={node.tagName}>
          {Array.from(node.children).map(render)}
        </Component>
      )
    }

    return <Component {...componentProps} />
  }

  return render(node)
}

export const createSVGPdfRendererComponent = (
  svgString: string
): React.ReactNode => {
  if (!svgString || svgString === '') return null

  const svg = svgString.replaceAll('px', 'pt')

  const parsed: RootNode = parse(svg)

  return svgToComponent(parsed.children[0])
}
