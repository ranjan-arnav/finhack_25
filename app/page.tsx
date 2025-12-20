'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingFlow from '@/components/OnboardingFlow'
import { storage } from '@/lib/storage'
import { getTranslation, getCurrentLanguage, type Language } from '@/lib/i18n'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentLang, setCurrentLang] = useState<Language>('en')

  useEffect(() => {
    setCurrentLang(getCurrentLanguage())

    // Small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      const hasCompletedOnboarding = storage.isOnboarded()

      if (!hasCompletedOnboarding) {
        setShowOnboarding(true)
      } else {
        router.push('/dashboard')
      }
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  const handleOnboardingComplete = (userData?: any) => {
    storage.setOnboarded(true)
    if (userData) {
      storage.setUser(userData)

      // Auto-create Crop objects from onboarding selections
      if (userData.crops && Array.isArray(userData.crops) && userData.crops.length > 0) {
        const existingCrops = storage.getCrops()

        // Only create crops if none exist yet (avoid duplicates)
        if (existingCrops.length === 0) {
          const today = new Date()
          const harvestDate = new Date()
          harvestDate.setDate(today.getDate() + 90) // Default 90 days to harvest

          userData.crops.forEach((cropId: string) => {
            const newCrop = {
              id: `${Date.now()}-${cropId}`,
              name: cropId.charAt(0).toUpperCase() + cropId.slice(1), // Capitalize
              plantedDate: today.toISOString().split('T')[0],
              expectedHarvestDate: harvestDate.toISOString().split('T')[0],
              status: 'healthy' as const,
              progress: 0,
              daysToHarvest: 90,
              notes: 'Added during onboarding'
            }
            storage.addCrop(newCrop)
          })
        }
      }
    }
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
        <p className="text-gray-600 font-semibold">{getTranslation('common.loading', currentLang)}</p>
      </div>
    )
  }

  if (!showOnboarding) {
    return null
  }

  return <OnboardingFlow onComplete={handleOnboardingComplete} />
}
