import { motion } from 'framer-motion';

export default function TestAnimation() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Test Animation on a New Page</h1>
      <motion.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'blue',
          margin: '0 auto',
          borderRadius: '50%',
        }}
        animate={{ x: 100 }}
        transition={{ type: 'spring', stiffness: 100 }}
      />
    </div>
  );
}

