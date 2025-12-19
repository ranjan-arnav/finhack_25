'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Play, FileText, Video, ArrowRight, X, IndianRupee, TrendingUp, RefreshCw } from 'lucide-react'
import { getTranslation, getCurrentLanguage, type Language } from '@/lib/i18n'

interface KnowledgeCardProps {
  fullView?: boolean
  onOpenAI?: () => void
}

export default function KnowledgeCard({ fullView = false, onOpenAI }: KnowledgeCardProps) {
  const [currentLang, setCurrentLang] = useState<Language>('en')

  useEffect(() => {
    setCurrentLang(getCurrentLanguage())

    const handleLanguageChange = () => {
      setCurrentLang(getCurrentLanguage())
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const getLocalizedArticles = () => [
    {
      key: 'wheatCultivation',
      title: getTranslation('knowledgeCard.articles.wheatCultivation.title', currentLang),
      category: getTranslation('knowledgeCard.articles.wheatCultivation.category', currentLang),
      duration: getTranslation('knowledgeCard.articles.wheatCultivation.duration', currentLang),
      icon: FileText,
      color: 'from-yellow-400 to-orange-500',
      content: `# ${getTranslation('knowledgeCard.articles.wheatCultivation.title', currentLang)}

## Soil Preparation
- Plow the field 2-3 times before sowing
- Add organic manure (10-15 tons/hectare)
- Maintain pH level between 6.0-7.5

## Sowing
- Best time: Mid-November to December
- Seed rate: 100-125 kg/hectare
- Row spacing: 20-23 cm

## Irrigation
- First irrigation: 20-25 days after sowing
- Subsequent irrigations every 20-25 days
- Total 5-6 irrigations needed

## Fertilizer
- Nitrogen: 120-150 kg/hectare
- Phosphorus: 60 kg/hectare
- Potassium: 40 kg/hectare

## Harvesting
- Harvest when grain moisture is 20-25%
- Usually 130-150 days after sowing`
    },
    {
      key: 'organicPest',
      title: getTranslation('knowledgeCard.articles.organicPest.title', currentLang),
      category: getTranslation('knowledgeCard.articles.organicPest.category', currentLang),
      duration: getTranslation('knowledgeCard.articles.organicPest.duration', currentLang),
      icon: FileText,
      color: 'from-green-400 to-emerald-500',
      content: `# ${getTranslation('knowledgeCard.articles.organicPest.title', currentLang)}

## Neem-Based Solutions
- Neem oil spray: 5ml per liter of water
- Spray every 7-10 days
- Effective against aphids, whiteflies

## Natural Predators
- Ladybugs: Control aphids
- Praying mantis: Control caterpillars
- Lacewings: Control soft-bodied insects

## Home Remedies
### Garlic Spray
- Crush 100g garlic in 1L water
- Let sit for 24 hours
- Spray on affected plants

### Soap Solution
- Mix 1 tbsp dish soap in 1L water
- Spray directly on pests
- Safe for most plants

## Prevention
- Crop rotation
- Companion planting
- Proper spacing
- Regular inspection`
    },
    {
      key: 'waterConservation',
      title: getTranslation('knowledgeCard.articles.waterConservation.title', currentLang),
      category: getTranslation('knowledgeCard.articles.waterConservation.category', currentLang),
      duration: getTranslation('knowledgeCard.articles.waterConservation.duration', currentLang),
      icon: Video,
      color: 'from-blue-400 to-cyan-500',
      content: `# ${getTranslation('knowledgeCard.articles.waterConservation.title', currentLang)}

## Drip Irrigation
- Saves 30-70% water vs flood irrigation
- Delivers water directly to roots
- Reduces evaporation
- Installation cost: ₹25,000-50,000/acre

## Mulching
- Cover soil with organic material
- Reduces evaporation by 70%
- Materials: straw, leaves, grass clippings
- 5-10 cm thick layer recommended

## Rainwater Harvesting
- Build farm ponds
- Store monsoon water
- Use for dry season irrigation
- Government subsidies available

## Scheduling
- Irrigate early morning or evening
- Avoid midday watering
- Use soil moisture sensors
- Water deeply, less frequently

## Crop Selection
- Choose drought-resistant varieties
- Practice crop rotation
- Use cover crops`
    },
    // Economics & Market Articles
    {
      key: 'msp',
      title: getTranslation('knowledgeCard.articles.mspTitle', currentLang),
      category: getTranslation('knowledgeCard.articles.mspCategory', currentLang),
      duration: getTranslation('knowledgeCard.articles.mspDuration', currentLang),
      icon: IndianRupee, // Using IndianRupee from lucide-react if added to imports, else fallback
      color: 'from-purple-500 to-indigo-600',
      content: `# ${getTranslation('knowledgeCard.articles.mspTitle', currentLang)}

## What is MSP?
Minimum Support Price (MSP) is a form of market intervention by the Government of India to insure agricultural producers against any sharp fall in farm prices. It is announced by the Government of India at the beginning of the sowing season for certain crops.

## Why is it important?
- **Price Safety:** It guarantees farmers a minimum price for their produce.
- **Income Security:** Protects farmers from market fluctuations and distress sales.
- **Incentive:** Encourages farmers to invest in technology and improve productivity.
- **Food Security:** Ensures adequate food grain production in the country.

## How is it decided?
The Commission for Agricultural Costs and Prices (CACP) recommends MSP based on:
1. Cost of production
2. Demand and supply
3. Price trends in the market
4. Inter-crop price parity
5. Terms of trade between agriculture and non-agriculture sectors

## Covered Crops
There are currently 23 crops covered under MSP, including:
- **Cereals:** Paddy, Wheat, Maize, Sorghum, Pearl millet, Barley, Ragi
- **Pulses:** Gram, Tur, Moong, Urad, Lentil
- **Oilseeds:** Groundnut, Rapeseed-mustard, Soyabean, Seasamum, Sunflower, Safflower, Nigerseed
- **Commercial:** Copra, Sugarcane, Cotton, Raw jute`
    },
    {
      key: 'demandSupply',
      title: getTranslation('knowledgeCard.articles.demandTitle', currentLang),
      category: getTranslation('knowledgeCard.articles.demandCategory', currentLang),
      duration: getTranslation('knowledgeCard.articles.demandDuration', currentLang),
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      content: `# ${getTranslation('knowledgeCard.articles.demandTitle', currentLang)}

## Basic Concept
- **Demand:** How much of a crop consumers want to buy.
- **Supply:** How much of a crop farmers have grown and brought to the market.

## How Prices Change
- **Validating High Prices:** When Demand is high but Supply is low (e.g., bad harvest), prices go UP.
- **Validating Low Prices:** When Supply is high (e.g., bumper harvest) but Demand is stable, prices go DOWN.

## Strategies for Farmers
1. **Grow Off-Season Crops:** Try to harvest when others are not, to get better prices due to lower supply.
2. **Storage:** Use cold storage or warehouses to hold produce when prices are low and sell when prices rise.
3. **Diversification:** Don't put all your eggs in one basket. Grow different crops to spread the risk.
4. **Market Intelligence:** Use apps like Kisan Mitra to track price trends before harvesting.`
    },
    {
      key: 'cropCycles',
      title: getTranslation('knowledgeCard.articles.cyclesTitle', currentLang),
      category: getTranslation('knowledgeCard.articles.cyclesCategory', currentLang),
      duration: getTranslation('knowledgeCard.articles.cyclesDuration', currentLang),
      icon: RefreshCw,
      color: 'from-orange-400 to-red-500',
      content: `# ${getTranslation('knowledgeCard.articles.cyclesTitle', currentLang)}

## Understanding Commodity Cycles
Agricultural prices often follow predictable cycles or patterns over years. Understanding these can help you plan better.

## Types of Cycles
1. **Seasonal Cycles:** Prices are usually lowest during harvest time (peak supply) and highest just before the next harvest (lean season).
2. **Cobweb Cycle:** High prices this year often lead to overproduction next year, causing prices to crash. This crash leads to lower production the following year, causing prices to spike again.

## Breaking the Cycle
- **Don't Chase Last Year's Prices:** Just because onions were expensive last year doesn't mean they will be this year. Everyone might plant onions, crashing the price.
- **Look at Long-Term Trends:** Focus on crops with steady demand growth (e.g., fruits, vegetables, proteins).
- **Value Addition:** Processing your crop (e.g., making tomato puree instead of selling raw tomatoes) can protect you from raw commodity price swings.`
    },
  ]

  const articles = getLocalizedArticles()

  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: fullView ? 0 : 0.6 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
          <BookOpen className="text-indigo-600" size={32} />
          {getTranslation('dashboard.learnAndGrow', currentLang)}
        </h3>
        <button className="font-semibold text-lg text-indigo-600 dark:text-indigo-300">
          {getTranslation('knowledgeCard.viewAll', currentLang)}
        </button>
      </div>

      <div className="glass-effect rounded-3xl p-4 md:p-6 shadow-xl dark:bg-gray-800/80 dark:border dark:border-gray-700">
        <div className="space-y-4">
          {articles.map((article, index) => {
            const IconComponent = article.icon
            return (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedArticle(article)}
                className="bg-white dark:bg-gray-800/80 rounded-2xl p-5 shadow-md border-2 border-gray-100 dark:border-gray-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-400 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${article.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                    <IconComponent size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-300">• {article.duration}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                      {article.title}
                    </h4>
                  </div>
                  <ArrowRight className="text-gray-400 dark:text-gray-300 flex-shrink-0" size={24} />
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
        >
          <Play size={24} />
          {getTranslation('knowledgeCard.startLearning', currentLang)}
        </motion.button>
      </div>

      {/* AI Assistant CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
        className="mt-6 glass-effect rounded-3xl p-5 md:p-8 shadow-xl text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 dark:border dark:border-gray-700"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-6xl mb-4"
        >
          🤖
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {getTranslation('knowledgeCard.askAI', currentLang)}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
          {getTranslation('knowledgeCard.instantAnswers', currentLang)}
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAI}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-lg hover:shadow-2xl transition-shadow"
        >
          {getTranslation('knowledgeCard.chatWithAI', currentLang)}
        </motion.button>
      </motion.div>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${selectedArticle.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <selectedArticle.icon size={32} className="text-white" />
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  aria-label={getTranslation('common.close', currentLang)}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{selectedArticle.title}</h2>

              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed">
                  {selectedArticle.content}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
