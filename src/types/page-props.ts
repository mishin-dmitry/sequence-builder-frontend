import {Asana, AsanaGroup} from 'types'

export interface PageProps {
  isMobile: boolean
  asanas: Asana[]
  asanaGroups: AsanaGroup[]
}
