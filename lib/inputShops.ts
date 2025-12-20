// lib/inputShops.ts - Input Shop Service for Smart Input Finder
import type { InputShop } from './types'

const STORAGE_KEY = 'kisan_mitra_input_shops'

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

// Demo/seed data for initial load
const DEMO_SHOPS: InputShop[] = [
    {
        id: 'demo-1',
        name: 'PMKSK Fertilizer Center',
        type: 'pmksk',
        location: { lat: 25.5941, lng: 85.1376 }, // Patna
        address: 'Near Bus Stand, Main Road, Patna',
        phone: '+91 98765 43210',
        items: [
            { name: 'Urea (50kg)', price: 266, lastUpdated: new Date() },
            { name: 'DAP (50kg)', price: 1350, lastUpdated: new Date() },
            { name: 'NPK (50kg)', price: 1050, lastUpdated: new Date() },
        ],
        verified: true,
        rating: 4.5,
    },
    {
        id: 'demo-2',
        name: 'Green Valley Agro Store',
        type: 'private',
        location: { lat: 25.6093, lng: 85.1442 },
        address: 'Market Road, Shop No. 15, Patna',
        phone: '+91 98765 43211',
        items: [
            { name: 'Urea (50kg)', price: 280, lastUpdated: new Date() },
            { name: 'DAP (50kg)', price: 1400, lastUpdated: new Date() },
            { name: 'NPK (50kg)', price: 1100, lastUpdated: new Date() },
            { name: 'Organic Fertilizer', price: 450, lastUpdated: new Date() },
        ],
        verified: false,
        rating: 4.2,
    },
    {
        id: 'demo-3',
        name: 'PMKSK Seeds & Pesticides',
        type: 'pmksk',
        location: { lat: 25.5788, lng: 85.1525 },
        address: 'Agriculture Office Complex, Patna',
        phone: '+91 98765 43212',
        items: [
            { name: 'Pesticide A', price: 350, lastUpdated: new Date() },
            { name: 'Pesticide B', price: 420, lastUpdated: new Date() },
            { name: 'Seeds (1kg)', price: 180, lastUpdated: new Date() },
        ],
        verified: true,
        rating: 4.7,
    },
    {
        id: 'demo-4',
        name: 'Farmer Choice Inputs',
        type: 'private',
        location: { lat: 25.6150, lng: 85.1289 },
        address: 'Highway Junction, Patna',
        phone: '+91 98765 43213',
        items: [
            { name: 'Urea (50kg)', price: 275, lastUpdated: new Date() },
            { name: 'Pesticide A', price: 340, lastUpdated: new Date() },
            { name: 'Pesticide B', price: 410, lastUpdated: new Date() },
        ],
        verified: false,
        rating: 4.0,
    },
    {
        id: 'demo-5',
        name: 'Kisan Seva Kendra',
        type: 'pmksk',
        location: { lat: 25.5700, lng: 85.1700 },
        address: 'Village Center, Patna',
        phone: '+91 98765 43214',
        items: [
            { name: 'DAP (50kg)', price: 1345, lastUpdated: new Date() },
            { name: 'NPK (50kg)', price: 1045, lastUpdated: new Date() },
            { name: 'Micronutrients', price: 280, lastUpdated: new Date() },
        ],
        verified: true,
        rating: 4.6,
    },
]

export class InputShopService {
    // Get all shops from storage
    static getAllShops(): InputShop[] {
        if (typeof window === 'undefined') return DEMO_SHOPS

        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const shops = JSON.parse(stored)
                // Convert date strings back to Date objects
                return shops.map((shop: any) => ({
                    ...shop,
                    items: shop.items.map((item: any) => ({
                        ...item,
                        lastUpdated: new Date(item.lastUpdated),
                    })),
                }))
            }
            // Initialize with demo data if nothing stored
            this.saveShops(DEMO_SHOPS)
            return DEMO_SHOPS
        } catch (error) {
            console.error('Error loading shops:', error)
            return DEMO_SHOPS
        }
    }

    // Save shops to storage
    static saveShops(shops: InputShop[]): void {
        if (typeof window === 'undefined') return

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(shops))
        } catch (error) {
            console.error('Error saving shops:', error)
        }
    }

    // Get shops near user location
    static getShopsNearLocation(
        userLat: number,
        userLng: number,
        radiusKm: number = 50
    ): InputShop[] {
        const allShops = this.getAllShops()

        return allShops
            .filter((shop) => shop.location) // Only shops with location data
            .map((shop) => ({
                ...shop,
                distance: calculateDistance(
                    userLat,
                    userLng,
                    shop.location!.lat,
                    shop.location!.lng
                ),
            }))
            .filter((shop) => shop.distance! <= radiusKm)
            .sort((a, b) => a.distance! - b.distance!)
    }

    // Search shops by name or product
    static searchShops(
        query: string,
        type: 'all' | 'pmksk' | 'private' = 'all',
        userLocation?: { lat: number; lng: number }
    ): InputShop[] {
        let shops = this.getAllShops()

        // Filter by type
        if (type !== 'all') {
            shops = shops.filter((shop) => shop.type === type)
        }

        // Filter by search query
        if (query) {
            const lowerQuery = query.toLowerCase()
            shops = shops.filter(
                (shop) =>
                    shop.name.toLowerCase().includes(lowerQuery) ||
                    shop.address.toLowerCase().includes(lowerQuery) ||
                    shop.items.some((item) =>
                        item.name.toLowerCase().includes(lowerQuery)
                    )
            )
        }

        // Add distance if user location provided
        if (userLocation) {
            shops = shops
                .filter((shop) => shop.location) // Only shops with location
                .map((shop) => ({
                    ...shop,
                    distance: calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        shop.location!.lat,
                        shop.location!.lng
                    ),
                }))
            shops.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        }

        return shops
    }

    // Add a new shop
    static addShop(shop: Omit<InputShop, 'id'>): InputShop {
        const shops = this.getAllShops()
        const newShop: InputShop = {
            ...shop,
            id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            verified: false, // New shops need verification
            rating: undefined,
        }
        shops.push(newShop)
        this.saveShops(shops)
        return newShop
    }

    // Update shop prices
    static updateShopPrices(
        shopId: string,
        items: Array<{ name: string; price: number }>
    ): boolean {
        const shops = this.getAllShops()
        const shopIndex = shops.findIndex((s) => s.id === shopId)

        if (shopIndex === -1) return false

        shops[shopIndex].items = items.map((item) => ({
            ...item,
            lastUpdated: new Date(),
        }))

        this.saveShops(shops)
        return true
    }

    // Get user's current location
    static async getUserLocation(): Promise<{
        lat: number
        lng: number
    } | null> {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            return null
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    })
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    resolve(null)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            )
        })
    }

    // Get price comparison for an item across all shops
    static getPriceComparison(itemName: string): {
        itemName: string
        minPrice: number
        maxPrice: number
        avgPrice: number
        shops: Array<{ shopName: string; price: number; type: 'pmksk' | 'private' }>
    } | null {
        const shops = this.getAllShops()
        const pricesData: Array<{
            shopName: string
            price: number
            type: 'pmksk' | 'private'
        }> = []

        shops.forEach((shop) => {
            const item = shop.items.find((i) =>
                i.name.toLowerCase().includes(itemName.toLowerCase())
            )
            if (item) {
                pricesData.push({
                    shopName: shop.name,
                    price: item.price,
                    type: shop.type,
                })
            }
        })

        if (pricesData.length === 0) return null

        const prices = pricesData.map((p) => p.price)
        return {
            itemName,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
            shops: pricesData.sort((a, b) => a.price - b.price),
        }
    }
}
