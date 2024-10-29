import React, {useEffect, useMemo, useRef, useState} from 'react'
import {FilterOutlined} from '@ant-design/icons'
import {Button, Dropdown, Checkbox, AutoComplete} from 'antd'

import type {Asana, AsanaGroup, AsanaGroupCategory} from 'types'
import type {CheckboxChangeEvent} from 'antd/es/checkbox'

import debounce from 'lodash.debounce'
import styles from './styles.module.css'

interface SearchFilterProps {
  onSearchAsana: (value: string) => void
  onFilterAsanaByGroups: (groups: AsanaGroup[]) => void
  groupsCategories: AsanaGroupCategory[]
  searchItems: Asana[]
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearchAsana,
  onFilterAsanaByGroups,
  groupsCategories,
  searchItems: propsSearchItems
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [chosenFilters, setChosenFilters] = useState<AsanaGroup[]>([])

  const searchItems = useMemo(
    () =>
      propsSearchItems.map(({name}) => ({
        value: name
      })),
    [propsSearchItems]
  )

  useEffect(() => {
    onFilterAsanaByGroups(chosenFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenFilters])

  useEffect(() => {
    const node = document.querySelector(`.${styles.menu}`)

    const onMouseMove = debounce((event: MouseEvent): void => {
      if (!node) return

      if (
        !node.contains(event.target as HTMLElement) &&
        !buttonRef.current?.contains(event.target as HTMLElement)
      ) {
        setIsFilterDropdownOpen(false)
      }
    }, 200)

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFilterDropdownOpen])

  const filterItemCheckboxes = useMemo(
    () =>
      groupsCategories.map(({id: categoryId, name: categoryName, groups}) => ({
        key: categoryId,
        type: 'group',
        label: categoryName,
        children: groups.map((group) => {
          const onChange = (event: CheckboxChangeEvent): void => {
            if (event.target.checked) {
              setChosenFilters((prevData) => [...prevData, group])
            } else {
              setChosenFilters((prevData) =>
                prevData.filter((item) => item.id !== group.id)
              )
            }
          }

          const isChosen = chosenFilters.some((item) => item.id === group.id)

          return {
            key: group.id,
            label: (
              <Checkbox
                key={group.id}
                title={group.name}
                checked={isChosen}
                className={styles.checkbox}
                onChange={onChange}>
                {group.name}
              </Checkbox>
            )
          }
        })
      })),
    [chosenFilters, groupsCategories]
  )

  const dropdownMenu = useMemo(
    () => ({
      items: [
        ...filterItemCheckboxes,
        {
          key: 'reset',
          label: (
            <Button key="reset" block onClick={() => setChosenFilters([])}>
              Сбросить
            </Button>
          )
        }
      ],
      multiple: true,
      className: styles.menu
    }),
    [filterItemCheckboxes]
  )

  const onFilterOption = (value: string, option: any): boolean =>
    option.value.toUpperCase().indexOf(value.toUpperCase()) !== -1

  return (
    <>
      <div className={styles.searchWrapper}>
        <AutoComplete
          placeholder="Найти асану..."
          allowClear
          filterOption={onFilterOption}
          options={searchItems}
          onChange={onSearchAsana}
          size="large"
          className={styles.input}
        />
        <Dropdown open={isFilterDropdownOpen} menu={dropdownMenu}>
          <Button
            icon={<FilterOutlined />}
            className={styles.filterIcon}
            size="large"
            onClick={() => setIsFilterDropdownOpen((prevState) => !prevState)}
            ref={buttonRef}
          />
        </Dropdown>
      </div>
    </>
  )
}
