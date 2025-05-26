import { motion } from 'framer-motion';

export default function SimpleAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{ width: 100, height: 100, backgroundColor: 'blue' }}
    />
  );
}
