import { useState, useEffect, useRef } from 'react'

interface NumberCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

const NumberCounter = ({ value, duration = 1000, prefix = '', suffix = '', decimals = 0 }: NumberCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(0)
  const rafId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const diff = endValue - startValue

    if (diff === 0) {
      setDisplayValue(endValue)
      return
    }

    const animate = (timestamp: number) => {
      if (startTime.current === null) {
        startTime.current = timestamp
      }

      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + diff * easeProgress

      setDisplayValue(currentValue)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = endValue
        startTime.current = null
      }
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
      startTime.current = null
    }
  }, [value, duration])

  const formatValue = (val: number): string => {
    return val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <span className="number-counter">
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  )
}

export default NumberCounter
