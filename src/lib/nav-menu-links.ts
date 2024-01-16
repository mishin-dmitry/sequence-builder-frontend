import {Urls} from './urls'

interface NavMenuLink {
  title: string
  href: string
  forAuthorized?: boolean
}

export const NAV_MENU_LINKS: NavMenuLink[] = [
  {title: 'О платформе', href: Urls.ABOUT},
  {title: 'Создать последовательность', href: Urls.CREATE_SEQUENCE},
  {
    title: 'Мои последовательности',
    href: Urls.MY_SEQUENCES,
    forAuthorized: true
  },
  {
    title: 'Библиотека последовательностей',
    href: Urls.PUBLIC_SEQUENCES,
    forAuthorized: true
  },
  {title: 'Учить асаны', href: Urls.QUIZ},
  {title: 'Обратная связь', href: Urls.FEEDBACK}
]
