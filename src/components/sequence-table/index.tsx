import React, {useMemo, useState} from 'react'

import {Badge, Button, Popconfirm, Table, Tooltip} from 'antd'

import type {ColumnsType, TableLocale} from 'antd/es/table/interface'
import type {Sequence} from 'types'

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'

import styles from './styles.module.css'

interface SequenceTableProps {
  items: Sequence[]
  source: 'my' | 'public'
  onDelete?: (id: number) => Promise<void>
  onEdit?: (id: number) => void
  onShow?: (id: number) => void
}

export const SequenceTable: React.FC<SequenceTableProps> = ({
  items,
  onDelete,
  onEdit,
  onShow,
  source
}) => {
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  const locale = useMemo<TableLocale>(
    () => ({
      emptyText: 'Список пуст'
    }),
    []
  )

  const columns = useMemo(() => {
    return [
      {title: 'Название', dataIndex: 'title', key: 'title'},
      {title: 'Описание', dataIndex: 'description', key: 'description'},
      {
        title: (
          <span>
            Открытый доступ
            <Tooltip
              className={styles.tooltip}
              title="Последовательность доступна для просмотра другим пользователям">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        ),
        hidden: source === 'public',
        dataIndex: 'isPublic',
        key: 'isPublic',
        render: (isPublic: boolean) => (
          <Badge status={isPublic ? 'success' : 'error'} />
        ),
        align: 'center',
        width: 170
      },
      {
        title: '',
        dataIndex: 'actions',
        key: 'actions',
        align: 'center',
        render: ({id, title}: {id: number; title: string}) => (
          <div className={styles.buttons}>
            {typeof onDelete === 'function' && (
              <Popconfirm
                title="Удалить последовательность"
                onConfirm={async () => {
                  setIsConfirmLoading(true)

                  try {
                    await onDelete(id)
                  } catch {
                  } finally {
                    setIsConfirmLoading(false)
                  }
                }}
                okText="Удалить"
                cancelText="Отменить"
                okButtonProps={{loading: isConfirmLoading}}
                description={`Вы действительно хотите удалить последовательность ${
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
            )}
            {typeof onEdit === 'function' && (
              <Button
                type="primary"
                disabled={isConfirmLoading}
                size="small"
                onClick={() => onEdit(id)}>
                <EditOutlined />
              </Button>
            )}
            {typeof onShow === 'function' && (
              <Button
                type="primary"
                disabled={isConfirmLoading}
                size="small"
                onClick={() => onShow(id)}>
                <EyeOutlined />
              </Button>
            )}
          </div>
        )
      }
    ].filter((item) => !item.hidden)
  }, [source, onDelete, isConfirmLoading, onEdit, onShow])

  const dataSource = useMemo(
    () =>
      items.map(
        ({isPublic, title, description, id}: Sequence, index: number) => ({
          isPublic,
          title,
          description,
          key: index,
          actions: {id, title}
        })
      ),
    [items]
  )

  return (
    <Table
      columns={columns as ColumnsType<any>}
      dataSource={dataSource}
      className={styles.table}
      locale={locale}
      size="small"
    />
  )
}
