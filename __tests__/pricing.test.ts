import { 
  calculateZonalPrice, 
  calculateTimeBasedPrice, 
  calculateFinalPrice,
  type VehicleCategory 
} from '../src/lib/pricing'

describe('Calcul de prix VTC - Logique Hybride', () => {
  
  describe('calculateZonalPrice - Tarification Zonale', () => {
    
    describe('Catégorie STANDARD', () => {
      test('Zone 1 : 2km doit retourner 15€', () => {
        const price = calculateZonalPrice(2, 'standard')
        expect(price).toBe(15)
      })
      
      test('Zone 1 : 3km doit retourner 15€ (limite incluse)', () => {
        const price = calculateZonalPrice(3, 'standard')
        expect(price).toBe(15)
      })
      
      test('Zone 2 : 5km doit retourner 25€', () => {
        const price = calculateZonalPrice(5, 'standard')
        expect(price).toBe(25)
      })
      
      test('Zone 2 : 7km doit retourner 25€ (limite incluse)', () => {
        const price = calculateZonalPrice(7, 'standard')
        expect(price).toBe(25)
      })
      
      test('Zone 3 : 10km doit retourner 25 + (10-7)*1.90 = 30.70€', () => {
        const price = calculateZonalPrice(10, 'standard')
        const expected = 25 + ((10 - 7) * 1.90)
        expect(price).toBe(expected)
      })
      
      test('Longue distance : 100km doit retourner 25 + (100-7)*1.90 = 201.70€', () => {
        const price = calculateZonalPrice(100, 'standard')
        const expected = 25 + ((100 - 7) * 1.90)
        expect(price).toBe(expected)
      })
    })
    
    describe('Catégorie BERLINE/VAN', () => {
      test('Zone 1 : 2km doit retourner 25€', () => {
        const price = calculateZonalPrice(2, 'berline')
        expect(price).toBe(25)
      })
      
      test('Zone 1 : 2km (van) doit retourner 25€', () => {
        const price = calculateZonalPrice(2, 'van')
        expect(price).toBe(25)
      })
      
      test('Zone 2 : 5km doit retourner 35€', () => {
        const price = calculateZonalPrice(5, 'berline')
        expect(price).toBe(35)
      })
      
      test('Zone 3 : 10km doit retourner 35 + (10-7)*3.50 = 45.50€', () => {
        const price = calculateZonalPrice(10, 'berline')
        const expected = 35 + ((10 - 7) * 3.50)
        expect(price).toBe(expected)
      })
    })
  })
  
  describe('calculateTimeBasedPrice - Tarification Temps', () => {
    test('Course courte : 5km en 15min = (5*1.10) + (15*0.80) = 17.50€', () => {
      const price = calculateTimeBasedPrice(5, 15)
      const expected = (5 * 1.10) + (15 * 0.80)
      expect(price).toBe(expected)
    })
    
    test('Course avec trafic : 5km en 60min = (5*1.10) + (60*0.80) = 53.50€', () => {
      const price = calculateTimeBasedPrice(5, 60)
      const expected = (5 * 1.10) + (60 * 0.80)
      expect(price).toBe(expected)
    })
    
    test('Longue distance : 100km en 90min = (100*1.10) + (90*0.80) = 182€', () => {
      const price = calculateTimeBasedPrice(100, 90)
      const expected = (100 * 1.10) + (90 * 0.80)
      expect(price).toBe(expected)
    })
  })
  
  describe('calculateFinalPrice - Logique Hybride', () => {
    
    test('Test Zone 1 : 2km Standard doit retourner 15€ (Prix A choisi)', () => {
      const result = calculateFinalPrice(2, 10, 'standard', false)
      // Prix A (zonale) : 15€
      // Prix B (temps) : (2*1.10) + (10*0.80) = 10.20€
      // Max = 15€
      expect(result.price).toBe(15)
      expect(result.priceBasedOnDistance).toBe(15)
      expect(result.priceBasedOnTime).toBe(10.20)
      expect(result.isTrafficSurcharge).toBe(false)
    })
    
    test('Test Zone 1 : 2km Van doit retourner 25€', () => {
      const result = calculateFinalPrice(2, 10, 'van', false)
      // Prix A (zonale) : 25€
      // Prix B (temps) : (2*1.10) + (10*0.80) = 10.20€
      // Max = 25€
      expect(result.price).toBe(25)
      expect(result.priceBasedOnDistance).toBe(25)
      expect(result.priceBasedOnTime).toBe(10.20)
    })
    
    test('Test Zone 2 : 5km Standard doit retourner 25€', () => {
      const result = calculateFinalPrice(5, 15, 'standard', false)
      // Prix A (zonale) : 25€
      // Prix B (temps) : (5*1.10) + (15*0.80) = 5.5 + 12 = 17.50€
      // Max = 25€
      expect(result.price).toBe(25)
      expect(result.priceBasedOnDistance).toBe(25)
      expect(result.priceBasedOnTime).toBe(17.50)
    })
    
    test('Test Longue Distance : 100km Standard doit retourner 201.70€', () => {
      const result = calculateFinalPrice(100, 90, 'standard', false)
      // Prix A (zonale) : 25 + (100-7)*1.90 = 201.70€
      // Prix B (temps) : (100*1.10) + (90*0.80) = 182€
      // Max = 201.70€
      const expectedZonal = 25 + ((100 - 7) * 1.90)
      expect(result.price).toBe(expectedZonal)
      expect(result.priceBasedOnDistance).toBe(expectedZonal)
      expect(result.priceBasedOnTime).toBe(182)
      expect(result.isTrafficSurcharge).toBe(false)
    })
    
    test('Test Trafic : 5km en 60min - Prix B (Temps) doit être choisi', () => {
      const result = calculateFinalPrice(5, 60, 'standard', false)
      // Prix A (zonale) : 25€
      // Prix B (temps) : (5*1.10) + (60*0.80) = 53.50€
      // Max = 53.50€ (Prix B choisi)
      expect(result.price).toBe(53.50)
      expect(result.priceBasedOnDistance).toBe(25)
      expect(result.priceBasedOnTime).toBe(53.50)
      expect(result.isTrafficSurcharge).toBe(true) // Le trafic cause la majoration
    })
    
    test('Test Comparatif : Vérifie que Math.max(PrixA, PrixB) est toujours utilisé', () => {
      // Cas 1 : Prix A > Prix B
      const result1 = calculateFinalPrice(2, 5, 'standard', false)
      expect(result1.price).toBe(Math.max(result1.priceBasedOnDistance, result1.priceBasedOnTime))
      
      // Cas 2 : Prix B > Prix A
      const result2 = calculateFinalPrice(5, 60, 'standard', false)
      expect(result2.price).toBe(Math.max(result2.priceBasedOnDistance, result2.priceBasedOnTime))
      
      // Cas 3 : Prix A = Prix B (théoriquement possible)
      const result3 = calculateFinalPrice(10, 20, 'standard', false)
      expect(result3.price).toBe(Math.max(result3.priceBasedOnDistance, result3.priceBasedOnTime))
    })
    
    test('Test Aller-Retour : Prix doit être multiplié par 2', () => {
      const resultOneWay = calculateFinalPrice(5, 15, 'standard', false)
      const resultRoundTrip = calculateFinalPrice(5, 15, 'standard', true)
      
      expect(resultRoundTrip.price).toBe(resultOneWay.price * 2)
      expect(resultRoundTrip.isTrafficSurcharge).toBe(resultOneWay.isTrafficSurcharge)
    })
    
    test('Test Arrondi : Vérifie que le prix est arrondi à 2 décimales', () => {
      // Cas avec calcul qui donne beaucoup de décimales
      const result = calculateFinalPrice(7.5, 23.7, 'standard', false)
      const priceString = result.price.toString()
      const decimalPart = priceString.split('.')[1] || ''
      expect(decimalPart.length).toBeLessThanOrEqual(2)
    })
  })
})
