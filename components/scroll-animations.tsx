"use client"

import { useRef, type ReactNode } from "react"
import { motion, useInView } from "framer-motion"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  duration?: number
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const directionMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directionMap[direction],
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...directionMap[direction] }
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleOnScroll({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ParallaxScroll({
  children,
  className,
  speed = 0.5,
}: {
  children: ReactNode
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, margin: "-20%" })

  return (
    <motion.div
      ref={ref}
      initial={{ y: 0 }}
      animate={isInView ? { y: -20 * speed } : { y: 20 * speed }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
