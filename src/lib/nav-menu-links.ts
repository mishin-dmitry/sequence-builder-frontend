import {Urls} from './urls'

interface NavMenuLink {
  title: string
  href: string
}

export const NAV_MENU_LINKS: NavMenuLink[] = [
  {title: 'Создать последовательность', href: Urls.CREATE_SEQUENCE},
  {title: 'Учить асаны', href: Urls.QUIZ}
]
