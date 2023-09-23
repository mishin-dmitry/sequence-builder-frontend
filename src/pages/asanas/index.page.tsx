import React from 'react'

import {AsanaCardsList} from 'components/asanas-cards-list'
import {useAsana} from 'context/asanas'
import {Spinner} from 'components/spinner'
import {Typography} from 'antd'

const AsanaListPage: React.FC = () => {
  const {isFetching, asanas} = useAsana()

  if (isFetching) {
    return <Spinner />
  }

  return (
    <div>
      {!asanas.length ? (
        <Typography.Title level={1}>Список пуст</Typography.Title>
      ) : (
        <AsanaCardsList asanas={asanas} />
      )}
    </div>
  )
}

export default AsanaListPage
