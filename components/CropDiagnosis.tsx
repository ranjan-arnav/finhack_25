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
  const [retryCount, setRetryCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const groq = new GroqService()
  const MAX_RETRIES = 2
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

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
      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        setError(getTranslation('diagnosis.imageTooLarge', currentLang) || 'Image too large. Please use an image smaller than 5MB.')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(getTranslation('diagnosis.invalidFileType', currentLang) || 'Please upload a valid image file.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setResult(null)
        setError(null)
        setRetryCount(0)
      }
      reader.onerror = () => {
        setError('Failed to read image file. Please try again.')
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeCrop = async (isRetry = false) => {
    if (!image) return

    if (!isRetry) {
      setRetryCount(0)
    }

    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    setProgress(10)

    try {
      const base64Image = image.split(',')[1]
      setProgress(30)

      const prompt = `You are an expert agricultural pathologist. Analyze this crop image carefully.

Provide your analysis in this EXACT JSON format:
{
  "crop_name": "Name of the crop",
  "health_status": "Healthy" or "Diseased",
  "disease_name": "Name of disease if diseased, otherwise 'None'",
  "symptoms": ["symptom 1", "symptom 2"],
  "treatment": {
    "organic": ["organic solution 1", "organic solution 2"],
    "chemical": ["chemical solution 1", "chemical solution 2"],
    "cultural": ["cultural practice 1", "cultural practice 2"]
  },
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "urgency": "Low", "Medium", or "High"
}

Be specific and practical. Respond ONLY with valid JSON.`

      const user = storage.getUser()
      const location = user?.location

      setProgress(50)
      const response = await groq.analyzeCropImage(base64Image, prompt, currentLang, location)
      setProgress(70)

      console.log('Raw Groq Response:', response)

      let parsedResult: DiagnosisResult

      try {
        // Try parsing as JSON first
        const cleanResponse = response
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/^[\s\S]*?({[\s\S]*})[\s\S]*$/, '$1') // Extract JSON object
          .trim()

        parsedResult = JSON.parse(cleanResponse)

        // Validate parsed result
        if (!parsedResult.crop_name || !parsedResult.health_status) {
          throw new Error('Invalid response structure')
        }
      } catch (e) {
        console.log('JSON parse failed, attempting text parsing...', e)
        // Fallback: Parse the Markdown text response
        parsedResult = parseMarkdownResponse(response)

        // If parsing still fails, retry
        if (!parsedResult.crop_name || parsedResult.crop_name === 'Unknown Crop') {
          throw new Error('Failed to parse response')
        }
      }

      setProgress(100)
      setResult(parsedResult)
      setRetryCount(0)
    } catch (error) {
      console.error('Analysis error:', error)

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        setRetryCount(retryCount + 1)
        setProgress(0)
        setTimeout(() => analyzeCrop(true), 1000) // Retry after 1 second
        return
      }

      setError(
        getTranslation('diagnosis.analysisFailedRetry', currentLang) ||
        'Failed to analyze image after multiple attempts. Please try with a clearer, well-lit photo of the affected crop.'
      )
      setResult(null)
    } finally {
      if (retryCount >= MAX_RETRIES || result) {
        setIsAnalyzing(false)
        setProgress(0)
      }
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
                onClick={() => analyzeCrop()}
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
                  {retryCount > 0
                    ? `${getTranslation('diagnosis.retrying', currentLang) || 'Retrying'} (${retryCount}/${MAX_RETRIES})...`
                    : getTranslation('diagnosis.analyzing', currentLang)
                  }
                </p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
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
            <p className="text-sm text-gray-600">
              {getTranslation('dashboard.cropDiagnosis.note', currentLang)}
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
