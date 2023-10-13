import {Asana, AsanaGroup} from 'types'

export interface PageProps {
  isMobile: boolean
  asanas: Asana[]
  asanaMap: Record<string, Asana>
  asanaGroups: AsanaGroup[]
}
