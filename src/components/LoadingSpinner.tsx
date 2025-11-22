import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
            <div className="relative flex flex-col items-center">
                <motion.div
                    className="relative"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 0, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Heart
                        size={64}
                        className="text-pink-500 fill-pink-500 drop-shadow-lg"
                    />

                    <motion.div
                        className="absolute inset-0 border-4 border-pink-300 rounded-full"
                        style={{ width: '100%', height: '100%' }}
                        animate={{
                            scale: [1, 1.5],
                            opacity: [1, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                </motion.div>

                <motion.p
                    className="mt-4 text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Chargement...
                </motion.p>
            </div>
        </div>
    );
};
