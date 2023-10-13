import {FilterOutlined} from '@ant-design/icons'
import {Button, Checkbox, Dropdown} from 'antd'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {Input} from 'components/input'

import styles from './styles.module.css'
import type {AsanaGroup} from 'types'
import type {CheckboxChangeEvent} from 'antd/es/checkbox'
import debounce from 'lodash.debounce'

interface SearchFilterProps {
  onSearchAsana: (event: React.ChangeEvent<HTMLInputElement>) => void
  onFilterAsanas: (groups: AsanaGroup[]) => void
  filterItems: AsanaGroup[]
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearchAsana,
  onFilterAsanas,
  filterItems
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [chosenFilters, setChosenFilters] = useState<AsanaGroup[]>([])

  const toggleDropdown = useCallback(
    () => setIsFilterDropdownOpen((prevState) => !prevState),
    []
  )

  useEffect(() => {
    onFilterAsanas(chosenFilters)
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
              value={isChosen}
              className={styles.checkbox}
              onChange={onChange}>
              {name}
            </Checkbox>
          )
        }
      }),
    [chosenFilters, filterItems]
  )

  const dropdownMenu = useMemo(
    () => ({
      items: filterItemCheckboxes,
      multiple: true,
      className: styles.menu
    }),
    [filterItemCheckboxes]
  )

  return (
    <>
      <div className={styles.searchWrapper}>
        <Input
          name="search"
          placeholder="Найти асану..."
          allowClear
          onChange={onSearchAsana}
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
