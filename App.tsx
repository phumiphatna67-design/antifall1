/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartScreen from './components/StartScreen';
import { RotateCcwIcon, DownloadIcon } from './components/icons';

const App: React.FC = () => {
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleImageFinalized = (url: string) => {
    setGeneratedImageUrl(url);
  };

  const handleStartOver = () => {
    setGeneratedImageUrl(null);
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = 'ai-gym-photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <AnimatePresence mode="wait">
        {!generatedImageUrl ? (
          <motion.div
            key="start-screen"
            className="w-screen min-h-screen flex items-start sm:items-center justify-center bg-gray-50 p-4 pb-20"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <StartScreen onImageFinalized={handleImageFinalized} />
          </motion.div>
        ) : (
          <motion.div
            key="result-app"
            className="relative flex flex-col h-screen bg-gray-50 overflow-hidden"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="flex-grow relative flex flex-col items-center justify-center p-4">
               <div className="absolute top-4 left-4 z-30">
                <button 
                  onClick={handleStartOver}
                  className="flex items-center justify-center text-center bg-white/60 border border-gray-300/80 text-gray-700 font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-white hover:border-gray-400 active:scale-95 text-sm backdrop-blur-sm"
                >
                    <RotateCcwIcon className="w-4 h-4 mr-2" />
                    สร้างใหม่อีกครั้ง
                </button>
               </div>
               
               <div className="w-full h-full flex items-center justify-center">
                  <motion.img
                      key={generatedImageUrl}
                      src={generatedImageUrl}
                      alt="Generated gym photo"
                      className="max-w-full max-h-full object-contain rounded-lg shadow-xl animate-fade-in"
                      style={{maxHeight: 'calc(100vh - 150px)'}}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
               </div>

                <div className="absolute bottom-20 md:bottom-16 flex flex-col sm:flex-row gap-4 z-30">
                    <button
                        onClick={handleDownload}
                        className="flex items-center justify-center text-center bg-gray-900 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-700 active:scale-95 text-base shadow-lg"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        ดาวน์โหลดรูปภาพ
                    </button>
                </div>
                 <div className="absolute bottom-4 text-center text-xs text-gray-600 px-4 z-20">
                    <p>อย่าลืมมาออกกำลังกายกับเรานะครับ</p>
                    <p>สำนักงานป้องกันควบคุมโรคที่ 10 จังหวัดอุบลราชธานี กลุ่มโรคไม่ติดต่อ โทร 045250556 รักนะ จุ๊บๆ</p>
                </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;