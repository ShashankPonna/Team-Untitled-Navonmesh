import { useEffect, useState } from 'react'

/**
 * TypingAnimation — character-by-character reveal
 *
 * Props:
 *   text      {string}  – the text to type out
 *   duration  {number}  – ms per character (default 60)
 *   className {string}  – extra classes (optional)
 *   style     {object}  – inline style overrides (optional)
 *   onDone    {fn}      – called when typing completes (optional)
 */
export function TypingAnimation({ text, duration = 60, className = '', style = {}, onDone }) {
    const [displayedText, setDisplayedText] = useState('')
    const [i, setI] = useState(0)

    useEffect(() => {
        // Reset when text prop changes
        setDisplayedText('')
        setI(0)
    }, [text])

    useEffect(() => {
        if (i >= text.length) {
            if (onDone) onDone()
            return
        }
        const timer = setTimeout(() => {
            setDisplayedText(text.substring(0, i + 1))
            setI(prev => prev + 1)
        }, duration)
        return () => clearTimeout(timer)
    }, [i, text, duration, onDone])

    return (
        <h1 className={`typing-animation-title ${className}`} style={style}>
            {displayedText || '\u00A0'}
            <span className="typing-cursor" aria-hidden="true" />
        </h1>
    )
}

export default TypingAnimation
