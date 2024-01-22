import React, {useMemo, useState} from 'react'

import {Button, Popconfirm, Table, Tooltip} from 'antd'

import type {ColumnsType, TableLocale} from 'antd/es/table/interface'
import type {Sequence} from 'types'

import {DeleteOutlined, EditOutlined, EyeOutlined} from '@ant-design/icons'

import styles from './styles.module.css'

interface SequenceTableProps {
  items: Sequence[]
  onDelete?: (id: number) => Promise<void>
  onEdit?: (id: number) => void
  onShow?: (id: number) => void
}

export const SequenceTable: React.FC<SequenceTableProps> = ({
  items,
  onDelete,
  onEdit,
  onShow
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
      {
        title: 'Описание',
        dataIndex: 'description',
        key: 'description',
        width: 400
      },
      {
        title: '',
        dataIndex: 'actions',
        key: 'actions',
        align: 'center',
        render: ({id, title}: {id: number; title: string}) => (
          <div className={styles.buttons}>
            {typeof onDelete === 'function' && (
              <Tooltip title="Удалить">
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
              </Tooltip>
            )}
            {typeof onEdit === 'function' && (
              <Tooltip title="Редактировать">
                <Button
                  type="primary"
                  disabled={isConfirmLoading}
                  size="small"
                  onClick={() => onEdit(id)}>
                  <EditOutlined />
                </Button>
              </Tooltip>
            )}
            {typeof onShow === 'function' && (
              <Tooltip title="Посмотреть">
                <Button
                  type="primary"
                  disabled={isConfirmLoading}
                  size="small"
                  onClick={() => onShow(id)}>
                  <EyeOutlined />
                </Button>
              </Tooltip>
            )}
          </div>
        )
      }
    ]
  }, [onDelete, isConfirmLoading, onEdit, onShow])

  const dataSource = useMemo(
    () =>
      items.map(({title, description, id}: Sequence, index: number) => ({
        title,
        description,
        key: index,
        actions: {id, title}
      })),
    [items]
  )

  return (
    <Table
      columns={columns as ColumnsType<any>}
      dataSource={dataSource}
      className={styles.table}
      locale={locale}
      size="small"
      scroll={{x: 'max-content'}}
    />
  )
}
