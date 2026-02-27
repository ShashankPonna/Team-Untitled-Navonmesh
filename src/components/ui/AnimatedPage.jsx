import { motion } from 'framer-motion'

export default function AnimatedPage({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
            {children}
        </motion.div>
    )
}
