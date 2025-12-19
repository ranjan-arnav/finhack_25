'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react'
import { GroqService } from '@/lib/groq'
import { storage } from '@/lib/storage'
import { getTranslation, getCurrentLanguage, type Language } from '@/lib/i18n'

interface DiagnosisResult {
  crop_name: string;
  health_status: 'Healthy' | 'Diseased';
  disease_name: string;
  symptoms: string[];
  treatment: {
    organic: string[];
    chemical: string[];
    cultural: string[];
  };
  prevention: string[];
  urgency: 'Low' | 'Medium' | 'High';
}

export default function CropDiagnosis() {
  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentLang, setCurrentLang] = useState<Language>('en')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const groq = new GroqService()

  useEffect(() => {
    setCurrentLang(getCurrentLanguage())

    const handleLanguageChange = () => {
      setCurrentLang(getCurrentLanguage())
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeCrop = async () => {
    if (!image) return

    setIsAnalyzing(true)
    setResult(null)
    setError(null)

    try {
      const base64Image = image.split(',')[1]
      const prompt = `You are an expert agricultural pathologist. Analyze this crop image and provide:

1. **Crop Identification**: What crop is this?
2. **Health Status**: Is the crop healthy or diseased?
3. **Disease/Issue Detected**: If any disease or nutrient deficiency is present, identify it clearly.
4. **Symptoms**: List the visible symptoms you can see.
5. **Treatment**: Provide detailed treatment recommendations including:
   - Organic solutions
   - Chemical pesticides/fungicides (with names)
   - Cultural practices
6. **Prevention**: How to prevent this in the future.
7. **Urgency**: Rate the urgency (Low/Medium/High).

Be specific and practical. Format your response clearly with headings.`

      const user = storage.getUser()
      const location = user?.location

      const response = await groq.analyzeCropImage(base64Image, prompt, currentLang, location)
      console.log('Raw Groq Response:', response)

      let parsedResult: DiagnosisResult

      try {
        // Try parsing as JSON first
        const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim()
        parsedResult = JSON.parse(cleanResponse)
      } catch (e) {
        console.log('JSON parse failed, attempting text parsing...', e)
        // Fallback: Parse the Markdown text response
        parsedResult = parseMarkdownResponse(response)
      }

      setResult(parsedResult)
    } catch (error) {
      console.error('Analysis error:', error)
      setError('Failed to analyze image. Please try again with a clearer photo.')
      setResult(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Camera className="text-green-600" size={36} />
          {getTranslation('diagnosis.title', currentLang)}
        </h2>
        <p className="text-gray-600 text-lg mt-2">
          {getTranslation('diagnosis.description', currentLang)}
        </p>
      </div>

      <div className="glass-effect rounded-3xl p-6 shadow-xl">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
        />

        {!image ? (
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-3"
            >
              <Camera size={32} />
              {getTranslation('diagnosis.takePhoto', currentLang)}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full btn-secondary py-6 text-xl flex items-center justify-center gap-3"
            >
              <Upload size={32} />
              {getTranslation('diagnosis.uploadFromGallery', currentLang)}
            </motion.button>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <p className="text-blue-800 font-semibold mb-2">{getTranslation('diagnosis.tipsTitle', currentLang)}</p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>{getTranslation('diagnosis.tip1', currentLang)}</li>
                <li>{getTranslation('diagnosis.tip2', currentLang)}</li>
                <li>{getTranslation('diagnosis.tip3', currentLang)}</li>
                <li>{getTranslation('diagnosis.tip4', currentLang)}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={getTranslation('diagnosis.cropImageAlt', currentLang)}
                className="w-full h-auto max-h-96 object-contain bg-gray-100"
              />
              <button
                onClick={() => {
                  setImage(null)
                  setResult(null)
                }}
                className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-xl shadow-lg"
              >
                {getTranslation('diagnosis.remove', currentLang)}
              </button>
            </div>

            {!result && !isAnalyzing && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={analyzeCrop}
                className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-3"
              >
                <Sparkles size={32} />
                {getTranslation('diagnosis.analyzeWithAI', currentLang)}
              </motion.button>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="animate-spin text-green-600" size={48} />
                <p className="text-lg font-semibold text-gray-700">
                  {getTranslation('diagnosis.analyzing', currentLang)}
                </p>
                <p className="text-sm text-gray-600">{getTranslation('diagnosis.analyzingSubtext', currentLang)}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative flex items-center gap-3">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 text-green-600 font-bold text-xl mb-4">
                  <CheckCircle size={28} />
                  {getTranslation('diagnosis.analysisComplete', currentLang)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <h3 className="font-semibold text-green-800 mb-1">Crop</h3>
                    <p className="text-xl font-bold text-green-900">{result.crop_name}</p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${result.health_status === 'Diseased' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <h3 className={`font-semibold mb-1 ${result.health_status === 'Diseased' ? 'text-red-800' : 'text-green-800'}`}>Health Status</h3>
                    <p className={`text-xl font-bold ${result.health_status === 'Diseased' ? 'text-red-900' : 'text-green-900'}`}>{result.health_status}</p>
                  </div>

                  {result.health_status === 'Diseased' && (
                    <div className="col-span-1 md:col-span-2 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                      <h3 className="font-semibold text-orange-800 mb-1">Diagnosis</h3>
                      <p className="text-lg font-bold text-orange-900">{result.disease_name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Urgency:</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${result.urgency === 'High' ? 'bg-red-200 text-red-800' :
                          result.urgency === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                          {result.urgency}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="col-span-1 md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <AlertCircle size={18} /> Symptoms
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      {result.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  {result.health_status === 'Diseased' && (
                    <div className="col-span-1 md:col-span-2 space-y-4">
                      <h3 className="font-semibold text-gray-900 text-lg">Recommended Treatment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <h4 className="font-semibold text-blue-800 mb-2">Organic</h4>
                          <ul className="list-disc pl-4 text-sm text-blue-900 space-y-1">
                            {result.treatment.organic.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                          <h4 className="font-semibold text-purple-800 mb-2">Chemical</h4>
                          <ul className="list-disc pl-4 text-sm text-purple-900 space-y-1">
                            {result.treatment.chemical.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-span-1 md:col-span-2 bg-teal-50 p-5 rounded-2xl border border-teal-100">
                    <h3 className="font-semibold text-teal-800 mb-2">Prevention</h3>
                    <ul className="list-disc pl-5 text-teal-900 space-y-1">
                      {result.prevention.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setImage(null)
                      setResult(null)
                    }}
                    className="flex-1 btn-secondary py-5 text-lg"
                  >
                    Analyze Another
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      navigator.share?.({
                        title: 'Crop Diagnosis Report',
                        text: `Diagnosis: ${result.disease_name}\nHealth: ${result.health_status}`,
                      })
                    }}
                    className="flex-1 btn-primary py-5 text-lg"
                  >
                    Share Report
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 glass-effect rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
          <div>
            <p className="font-semibold text-gray-800">Note:</p>
            <p className="text-sm text-gray-600">
              AI analysis is for guidance only. For serious crop issues, please consult a local
              agricultural expert or extension officer.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function parseMarkdownResponse(text: string): DiagnosisResult {
  const extractSection = (header: string): string => {
    const regex = new RegExp(`## \\*\\*${header}\\*\\*[\\s\\S]*?([\\s\\S]*?)(?=\\n##|$)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : ''
  }

  const extractList = (header: string): string[] => {
    const section = extractSection(header)
    return section
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
      .filter(line => line.length > 0)
  }

  const treatmentSection = extractSection('Treatment')

  // Helper to extract subsections from treatment
  const extractTreatment = (subHeader: string): string[] => {
    const regex = new RegExp(`### \\*\\*${subHeader}\\*\\*[\\s\\S]*?([\\s\\S]*?)(?=\\n###|$)`, 'i')
    const match = treatmentSection.match(regex)
    if (!match) return []
    return match[1]
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
      .filter(line => line.length > 0)
  }

  return {
    crop_name: extractSection('Crop Identification').split('\n')[0] || 'Unknown Crop',
    health_status: extractSection('Health Status').toLowerCase().includes('healthy') ? 'Healthy' : 'Diseased',
    disease_name: extractSection('Disease/Issue Detected').split('\n')[0] || 'Unknown Issue',
    symptoms: extractList('Symptoms'),
    treatment: {
      organic: extractTreatment('Organic Solutions'),
      chemical: extractTreatment('Chemical Pesticides/Fungicides'),
      cultural: extractTreatment('Cultural Practices')
    },
    prevention: extractList('Prevention'),
    urgency: extractSection('Urgency').toLowerCase().includes('high') ? 'High' :
      extractSection('Urgency').toLowerCase().includes('medium') ? 'Medium' : 'Low'
  }
}
