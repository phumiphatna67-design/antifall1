/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon } from './icons';
import { Compare } from './ui/compare';
import { generateGymPhoto, generateAgedPhoto } from '../services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage } from '../lib/utils';

interface StartScreenProps {
  onImageFinalized: (modelUrl: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onImageFinalized }) => {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [agedImageUrl, setAgedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState<'ชาย' | 'หญิง' | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!gender) {
        setError('กรุณาเลือกเพศก่อน');
        return;
    }
    if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUserImageUrl(dataUrl);
        setIsGenerating(true);
        setGeneratedModelUrl(null);
        setAgedImageUrl(null);
        setError(null);
        try {
            const [gymResult, agedResult] = await Promise.all([
              generateGymPhoto(file, gender),
              generateAgedPhoto(file, gender),
            ]);
            setGeneratedModelUrl(gymResult);
            setAgedImageUrl(agedResult);
        } catch (err) {
            setError(getFriendlyErrorMessage(err, 'Failed to generate images'));
            setUserImageUrl(null);
        } finally {
            setIsGenerating(false);
        }
    };
    reader.readAsDataURL(file);
  }, [gender]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const reset = () => {
    setUserImageUrl(null);
    setGeneratedModelUrl(null);
    setAgedImageUrl(null);
    setIsGenerating(false);
    setError(null);
    setGender(null);
  };

  const screenVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <AnimatePresence mode="wait">
      {!userImageUrl ? (
        <motion.div
          key="uploader"
          className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="max-w-lg">
              <h1 className="text-5xl md:text-6xl font-serif font-bold leading-snug md:leading-normal tracking-wide bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                คุณจะมีรูปร่างอย่างไรเมื่อคุณอายุมากขึ้น
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                ลองอัปโหลดภาพคุณดู แล้วคุณจะรู้ว่าต้องทำอย่างไร อย่าเพิ่งตกใจนะครับ กรุณาระบุเพศด้วยครับ
              </p>
              <hr className="my-8 border-gray-200" />
              <div className="flex flex-col items-center lg:items-start w-full gap-3">
                <div className="w-full space-y-4">
                    <div>
                        <p className="font-semibold text-gray-700 mb-2">1. กรุณาระบุเพศ</p>
                        <div className="grid grid-cols-2 w-full gap-3">
                            <button
                                onClick={() => setGender('ชาย')}
                                className={`w-full flex items-center justify-center text-center font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out border ${
                                    gender === 'ชาย' 
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                ชาย
                            </button>
                            <button
                                onClick={() => setGender('หญิง')}
                                className={`w-full flex items-center justify-center text-center font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out border ${
                                    gender === 'หญิง' 
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                หญิง
                            </button>
                        </div>
                    </div>
                    <div>
                        <p className={`font-semibold mb-2 transition-colors ${gender ? 'text-gray-700' : 'text-gray-400'}`}>2. อัปโหลดรูปภาพของคุณ</p>
                        <label htmlFor="image-upload-start" className={`w-full relative flex items-center justify-center px-8 py-3 text-base font-semibold rounded-md transition-colors ${!gender ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'text-white bg-gray-900 cursor-pointer group hover:bg-gray-700'}`}>
                            <UploadCloudIcon className="w-5 h-5 mr-3" />
                            อัปโหลดรูปใบหน้า
                        </label>
                        <input id="image-upload-start" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} disabled={!gender}/>
                        <p className="text-gray-500 text-sm mt-3">เลือกรูปถ่ายหน้าตรงที่ชัดเจนเพื่อให้ได้ผลลัพธ์ที่ดีที่สุด</p>
                        <p className="text-gray-500 text-xs mt-1">การอัปโหลดแสดงว่าคุณตกลงที่จะไม่สร้างเนื้อหาที่เป็นอันตราย ลามกอนาจาร หรือผิดกฎหมาย บริการนี้มีไว้สำหรับการใช้งานอย่างสร้างสรรค์และมีความรับผิดชอบเท่านั้น</p>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
            <Compare
              firstImage="https://storage.googleapis.com/gemini-95-icons/asr-tryon.jpg"
              secondImage="https://storage.googleapis.com/gemini-95-icons/asr-tryon-model.png"
              slideMode="drag"
              className="w-full max-w-sm aspect-[2/3] rounded-2xl bg-gray-200"
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="compare"
          className="w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="md:w-1/2 flex-shrink-0 flex flex-col items-center md:items-start">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                สองอนาคตที่เป็นไปได้
              </h1>
              <p className="mt-2 text-md text-gray-600">
                ลากแถบเลื่อนเพื่อเปรียบเทียบผลลัพธ์ ทางเลือกของคุณในวันนี้ กำหนดอนาคตของคุณ
              </p>
            </div>
            
            {isGenerating && (
              <div className="flex items-center gap-3 text-lg text-gray-700 font-serif mt-6">
                <Spinner />
                <span>กำลังสร้างภาพอนาคตของคุณ...</span>
              </div>
            )}

            {error && 
              <div className="text-center md:text-left text-red-600 max-w-md mt-6">
                <p className="font-semibold">การสร้างภาพล้มเหลว</p>
                <p className="text-sm mb-4">{error}</p>
                <button onClick={reset} className="text-sm font-semibold text-gray-700 hover:underline">ลองอีกครั้ง</button>
              </div>
            }
            
            <AnimatePresence>
              {generatedModelUrl && agedImageUrl && !isGenerating && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col sm:flex-row items-center gap-4 mt-8"
                >
                  <button 
                    onClick={reset}
                    className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-gray-700 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300 transition-colors"
                  >
                    ใช้รูปภาพอื่น
                  </button>
                  <button 
                    onClick={() => onImageFinalized(generatedModelUrl)}
                    className="w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-gray-900 rounded-md cursor-pointer group hover:bg-gray-700 transition-colors"
                  >
                    ใช้รูปภาพนี้ &rarr;
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="md:w-1/2 w-full flex items-center justify-center">
            <div 
              className={`relative rounded-[1.25rem] transition-all duration-700 ease-in-out ${isGenerating ? 'border border-gray-300 animate-pulse' : 'border border-transparent'}`}
            >
              <Compare
                firstImage={agedImageUrl ?? userImageUrl}
                secondImage={generatedModelUrl ?? userImageUrl}
                slideMode="drag"
                className="w-[280px] h-[420px] sm:w-[320px] sm:h-[480px] lg:w-[400px] lg:h-[600px] rounded-2xl bg-gray-200"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartScreen;