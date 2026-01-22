/**
 * Service de détection automatique de localisation par IP
 * ⚡ 100% CÔTÉ CLIENT - Aucun backend requis
 * 
 * Utilise des API publiques gratuites :
 * - ipify.org : Détection IP (illimité, gratuit)
 * - ipapi.co : Géolocalisation (30,000 requêtes/mois gratuit)
 * 
 * Tout fonctionne directement dans le navigateur de l'utilisateur
 */

export interface IPLocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  timezone: string;
  latitude: number;
  longitude: number;
  isp?: string;
}

/**
 * Récupère l'adresse IP publique de l'utilisateur
 */
async function getPublicIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'IP:', error);
    return 'Unknown';
  }
}

/**
 * Récupère les informations de géolocalisation via l'IP
 * Utilise ipapi.co (gratuit jusqu'à 30,000 requêtes/mois)
 */
async function getLocationFromIP(ip: string): Promise<IPLocationData | null> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      throw new Error('Erreur API de géolocalisation');
    }

    const data = await response.json();

    return {
      ip: data.ip || ip,
      city: data.city || 'Inconnu',
      region: data.region || 'Inconnu',
      country: data.country_name || 'Inconnu',
      country_code: data.country_code || 'XX',
      timezone: data.timezone || 'UTC',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      isp: data.org || undefined
    };
  } catch (error) {
    console.error('Erreur lors de la géolocalisation:', error);
    return null;
  }
}

/**
 * Détecte automatiquement la localisation complète de l'utilisateur
 * FONCTION PRINCIPALE À UTILISER
 */
export async function detectUserLocation(): Promise<IPLocationData | null> {
  try {
    // 1. Récupérer l'IP publique
    const ip = await getPublicIP();
    
    if (ip === 'Unknown') {
      return null;
    }

    // 2. Récupérer la localisation via l'IP
    const location = await getLocationFromIP(ip);
    
    if (location) {
      // 3. Sauvegarder dans le localStorage pour cache (durée: 24h)
      const cachedData = {
        ...location,
        cached_at: Date.now()
      };
      localStorage.setItem('user_location_cache', JSON.stringify(cachedData));
    }

    return location;
  } catch (error) {
    console.error('Erreur détection localisation:', error);
    return null;
  }
}

/**
 * Récupère la localisation depuis le cache (si < 24h)
 * Sinon, détecte à nouveau
 */
export async function getUserLocation(): Promise<IPLocationData | null> {
  try {
    // Vérifier le cache
    const cached = localStorage.getItem('user_location_cache');
    
    if (cached) {
      const data = JSON.parse(cached);
      const age = Date.now() - data.cached_at;
      
      // Si le cache a moins de 24h, l'utiliser
      if (age < 24 * 60 * 60 * 1000) {
        const { cached_at, ...location } = data;
        return location;
      }
    }

    // Sinon, détecter à nouveau
    return await detectUserLocation();
  } catch (error) {
    console.error('Erreur récupération localisation:', error);
    return null;
  }
}

/**
 * Formate la localisation pour affichage
 */
export function formatLocation(location: IPLocationData | null): string {
  if (!location) return 'Localisation inconnue';
  
  const parts = [];
  
  if (location.city && location.city !== 'Inconnu') {
    parts.push(location.city);
  }
  
  if (location.region && location.region !== 'Inconnu') {
    parts.push(location.region);
  }
  
  if (location.country && location.country !== 'Inconnu') {
    parts.push(location.country);
  }

  return parts.length > 0 ? parts.join(', ') : 'Localisation inconnue';
}

/**
 * Récupère uniquement l'IP (rapide, sans géolocalisation)
 */
export async function getIPAddress(): Promise<string> {
  return await getPublicIP();
}

/**
 * Efface le cache de localisation (forcer une nouvelle détection)
 */
export function clearLocationCache(): void {
  localStorage.removeItem('user_location_cache');
}
