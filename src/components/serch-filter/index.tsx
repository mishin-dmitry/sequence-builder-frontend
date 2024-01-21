import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {FilterOutlined} from '@ant-design/icons'
import {Button, Dropdown, Checkbox, AutoComplete} from 'antd'

import type {Asana, AsanaGroup} from 'types'
import type {CheckboxChangeEvent} from 'antd/es/checkbox'

import debounce from 'lodash.debounce'
import styles from './styles.module.css'

interface SearchFilterProps {
  onSearchAsana: (value: string) => void
  onFilterAsanaByGroups: (groups: AsanaGroup[]) => void
  filterItems: AsanaGroup[]
  searchItems: Asana[]
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearchAsana,
  onFilterAsanaByGroups,
  filterItems,
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

  const toggleDropdown = useCallback(
    () => setIsFilterDropdownOpen((prevState) => !prevState),
    []
  )

  useEffect(() => {
    onFilterAsanaByGroups(chosenFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenFilters])

  const hideDropdown = useCallback(() => setIsFilterDropdownOpen(false), [])

  useEffect(() => {
    const node = document.querySelector(`.${styles.menu}`)

    const onMouseMove = debounce((event: MouseEvent): void => {
      if (!node) return

      if (
        !node.contains(event.target as HTMLElement) &&
        !buttonRef.current?.contains(event.target as HTMLElement)
      ) {
        hideDropdown()
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
      filterItems.map(({id, name}) => {
        const onChange = (event: CheckboxChangeEvent): void => {
          if (event.target.checked) {
            setChosenFilters((prevData) => [...prevData, {id, name}])
          } else {
            setChosenFilters((prevData) =>
              prevData.filter((item) => item.id !== id)
            )
          }
        }

        const isChosen = chosenFilters.some((item) => item.id === id)

        return {
          key: id,
          label: (
            <Checkbox
              key={id}
              title={name}
              checked={isChosen}
              className={styles.checkbox}
              onChange={onChange}>
              {name}
            </Checkbox>
          )
        }
      }),
    [chosenFilters, filterItems]
  )

  const resetFilter = useCallback(() => setChosenFilters([]), [])

  const dropdownMenu = useMemo(
    () => ({
      items: [
        ...filterItemCheckboxes,
        {
          key: 'reset',
          label: (
            <Button key="reset" block onClick={resetFilter}>
              Сбросить
            </Button>
          )
        }
      ],
      multiple: true,
      className: styles.menu
    }),
    [filterItemCheckboxes, resetFilter]
  )

  const onFilterOption = useCallback(
    (value: string, option: any) =>
      option.value.toUpperCase().indexOf(value.toUpperCase()) !== -1,
    []
  )

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
            onClick={toggleDropdown}
            ref={buttonRef}
          />
        </Dropdown>
      </div>
    </>
  )
}
