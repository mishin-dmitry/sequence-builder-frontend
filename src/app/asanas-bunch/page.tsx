'use client'

import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {Button, Popconfirm, Table, Tooltip} from 'antd'
import {DeleteOutlined, EditOutlined} from '@ant-design/icons'
import {useRouter} from 'next/navigation'
import {useAsanaBunch} from './hooks'
import {Urls} from 'lib/urls'
import {iconsMap} from 'icons'
import {useAsanasBunches} from 'context/asanas-bunches'
import {useUser} from 'context/user'
import {useSettings} from 'context/settings'

import type {ColumnsType, TableLocale} from 'antd/es/table/interface'
import type {Asana, AsanaBunch} from 'types'

import styles from './styles.module.css'

const AsanasBunchPage: React.FC = () => {
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  const {asanasBunches, updateAsanasBunches} = useAsanasBunches()
  const {deleteAsanasBunch} = useAsanaBunch()
  const {isDarkTheme} = useSettings()
  const {isAuthorized} = useUser()

  const router = useRouter()

  useEffect(() => {
    if (!isAuthorized) {
      router.push(Urls.LOGIN)
    }
  }, [isAuthorized, router])

  const locale = useMemo<TableLocale>(
    () => ({
      emptyText: 'Список пуст'
    }),
    []
  )

  const onDeleteBunch = useCallback(
    async (id: string) => {
      await deleteAsanasBunch(id)
      await updateAsanasBunches()
    },
    [deleteAsanasBunch, updateAsanasBunches]
  )

  const onEdit = useCallback(
    (id: string) => router.push(`${Urls.EDIT_ASANAS_BUNCH}/${id}`),
    [router]
  )

  const columns = useMemo(() => {
    return [
      {title: 'Название', dataIndex: 'title', key: 'title'},
      {
        title: 'Связки асан',
        dataIndex: 'bunch',
        actions: 'bunch',
        align: 'left',
        render: ({asanas = []}: {asanas: Asana[]}) => (
          <div className={styles.imagesWrapper}>
            {asanas.map(
              ({alias}, index) =>
                iconsMap[alias] && (
                  <div className={styles.imageContainer} key={index}>
                    <img
                      alt="Изображение асаны"
                      loading="lazy"
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(
                        iconsMap[alias].replaceAll(
                          '$COLOR',
                          isDarkTheme
                            ? 'rgba(255, 255, 255, 0.85)'
                            : 'rgba(0, 0, 0, 0.88)'
                        )
                      )}`}
                    />
                  </div>
                )
            )}
          </div>
        )
      },
      {
        title: '',
        dataIndex: 'actions',
        key: 'actions',
        align: 'right',
        render: ({id, title}: {id: string; title: string}) => (
          <div className={styles.buttons}>
            <Tooltip title="Удалить">
              <Popconfirm
                title="Удалить связку асан"
                onConfirm={async () => {
                  setIsConfirmLoading(true)

                  try {
                    await onDeleteBunch(id)
                  } catch {
                  } finally {
                    setIsConfirmLoading(false)
                  }
                }}
                okText="Удалить"
                cancelText="Отменить"
                okButtonProps={{loading: isConfirmLoading}}
                description={`Вы действительно хотите удалить связку асан ${
                  title ?? ''
                }?`}>
                <Button
                  danger
                  type="primary"
                  size="small"
                  disabled={isConfirmLoading}>
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            </Tooltip>
            <Tooltip title="Редактировать">
              <Button
                type="primary"
                disabled={isConfirmLoading}
                size="small"
                onClick={() => onEdit(id)}>
                <EditOutlined />
              </Button>
            </Tooltip>
          </div>
        )
      }
    ]
  }, [isConfirmLoading, isDarkTheme, onDeleteBunch, onEdit])

  const dataSource = useMemo(
    () =>
      asanasBunches.map(({title, id, asanas}: AsanaBunch, index: number) => ({
        title,
        key: index,
        actions: {id, title},
        bunch: {asanas}
      })),
    [asanasBunches]
  )

  const onCreateAsanasBunch = useCallback(() => {
    router.push(Urls.CREATE_ASANAS_BUNCH)
  }, [router])

  return (
    <div className={styles.pageWrapper}>
      <Table
        columns={columns as ColumnsType<any>}
        dataSource={dataSource}
        className={styles.table}
        locale={locale}
        size="small"
        scroll={{x: 'max-content'}}
      />
      <Button
        type="primary"
        className={!asanasBunches.length ? styles.withTopMargin : undefined}
        block
        onClick={onCreateAsanasBunch}>
        Создать связку асан
      </Button>
    </div>
  )
}

export default AsanasBunchPage
