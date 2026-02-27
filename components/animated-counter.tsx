"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1500,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()
    const startValue = 0

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (value - startValue) * eased
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value, duration])

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(decimals > 0 ? decimals : 1) + "M"
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(decimals > 0 ? decimals : 1) + "K"
    }
    return val.toFixed(decimals)
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </span>
  )
}
