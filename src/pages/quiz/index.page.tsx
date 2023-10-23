import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {getAsanasList} from 'api'
import {getRandomItem} from 'lib/get-random-item'
import {PageProps} from 'types/page-props'
import {Spinner} from 'components/spinner'
import {AsanaCard} from 'components/asana-card'
import {Button} from 'antd'
import {Meta} from 'components/meta'

import type {Asana} from 'types'
import type {GetServerSideProps} from 'next'

import styles from './styles.module.css'
import sampleSize from 'lodash.samplesize'
import shuffle from 'lodash.shuffle'
import clsx from 'clsx'

const VARIATIONS_LENGTH = 4

const QuizPage: React.FC<PageProps> = ({asanas, isMobile}) => {
  const [rightAnswer, setRightAnswer] = useState<Asana | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<Asana | null>(null)
  const [showedAnswer, setShowedAnswer] = useState<Asana | null>(null)
  const [quizVariations, setQuizVariations] = useState<Asana[]>([])

  const prepareVariations = useCallback(() => {
    const variations = sampleSize(asanas, VARIATIONS_LENGTH)
    const rightAnswer = getRandomItem(variations)

    setRightAnswer(rightAnswer)
    setQuizVariations(shuffle(variations))
  }, [asanas])

  useEffect(() => {
    prepareVariations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const variations = useMemo(
    () =>
      quizVariations.map((variation) => {
        const isWrongAnswer =
          selectedAnswer?.id === variation.id &&
          rightAnswer?.id !== selectedAnswer?.id

        const isRightAnswer =
          (selectedAnswer?.id === rightAnswer?.id &&
            variation.id === selectedAnswer?.id) ||
          showedAnswer?.id === variation.id

        return (
          <Button
            type={isWrongAnswer ? 'primary' : 'default'}
            key={variation.id}
            danger={isWrongAnswer}
            block
            className={clsx(
              styles.variation,
              isRightAnswer && styles.success,
              isWrongAnswer && styles.danger,
              !!selectedAnswer && styles.readonly
            )}
            onClick={() => {
              setSelectedAnswer(variation)
            }}
            size="large">
            {variation.name}
          </Button>
        )
      }),
    [quizVariations, rightAnswer?.id, selectedAnswer, showedAnswer?.id]
  )

  const onNextClick = useCallback(() => {
    setSelectedAnswer(null)
    setShowedAnswer(null)
    window.setTimeout(prepareVariations, 0)
  }, [prepareVariations])

  const showRightAnswer = useCallback(() => {
    setShowedAnswer(rightAnswer)
  }, [rightAnswer])

  if (!rightAnswer) return <Spinner />

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <div className={styles.pageWrapper}>
        <AsanaCard
          isMobile={isMobile}
          data={rightAnswer}
          hideText
          isButton={false}
          className={styles.card}
        />

        <div className={styles.variationsWrapper}>{variations}</div>
        <Button
          type="primary"
          size="large"
          block
          onClick={onNextClick}
          className={styles.bottomButton}>
          Далее
        </Button>
        <Button
          type="default"
          size="large"
          block
          onClick={showRightAnswer}
          className={styles.bottomButton}>
          Показать правильный ответ
        </Button>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent']

  const isMobile = Boolean(
    UA?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  )

  const asanas = await getAsanasList()

  asanas.sort((a, b) => (a.name > b.name ? 1 : -1))

  return {props: {isMobile, asanas}}
}

export default QuizPage
