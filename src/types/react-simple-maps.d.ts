declare module 'react-simple-maps' {
  import { ReactNode, SVGProps, MouseEvent } from 'react'

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: { scale?: number; center?: [number, number]; rotate?: [number, number, number] }
    width?: number
    height?: number
    style?: React.CSSProperties
    children?: ReactNode
  }
  export function ComposableMap(props: ComposableMapProps): JSX.Element

  export interface ZoomableGroupProps {
    zoom?: number
    center?: [number, number]
    onMoveEnd?: (pos: { zoom: number; coordinates: [number, number] }) => void
    children?: ReactNode
  }
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element

  export interface GeographiesProps {
    geography: string | object
    children: (args: { geographies: any[] }) => ReactNode
  }
  export function Geographies(props: GeographiesProps): JSX.Element

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: any
    style?: { default?: object; hover?: object; pressed?: object }
  }
  export function Geography(props: GeographyProps): JSX.Element

  export interface MarkerProps {
    coordinates: [number, number]
    children?: ReactNode
  }
  export function Marker(props: MarkerProps): JSX.Element

  export interface LineProps {
    from: [number, number]
    to: [number, number]
    stroke?: string
    strokeWidth?: number
    strokeLinecap?: string
  }
  export function Line(props: LineProps): JSX.Element
}
