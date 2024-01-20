'use client'

import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {getRandomItem} from 'lib/get-random-item'
import {Spinner} from 'components/spinner'
import {AsanaCard} from 'components/asana-card'
import {Button} from 'antd'
import {useAsanas} from 'context/asanas'

import type {Asana} from 'types'

import styles from './styles.module.css'
import sampleSize from 'lodash.samplesize'
import shuffle from 'lodash.shuffle'
import clsx from 'clsx'

const VARIATIONS_LENGTH = 4

const QuizPage: React.FC = () => {
  const [rightAnswer, setRightAnswer] = useState<Asana | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<Asana | null>(null)
  const [showedAnswer, setShowedAnswer] = useState<Asana | null>(null)
  const [quizVariations, setQuizVariations] = useState<Asana[]>([])

  const {asanas: initialAsanas} = useAsanas()

  const asanas = useMemo<Asana[]>(
    () =>
      initialAsanas.filter(
        ({alias}) => alias !== 'separator' && alias !== 'empty'
      ),
    [initialAsanas]
  )

  const prepareVariations = useCallback(() => {
    const variations = sampleSize(asanas, VARIATIONS_LENGTH)
    const rightAnswer = getRandomItem(variations)

    setRightAnswer(rightAnswer)
    setQuizVariations(shuffle(variations))
  }, [asanas])

  useEffect(() => {
    if (asanas.length) {
      prepareVariations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asanas])

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
    <div className={styles.pageWrapper}>
      <AsanaCard
        data={rightAnswer}
        hideText
        hideAlignment
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
  )
}

export default QuizPage
