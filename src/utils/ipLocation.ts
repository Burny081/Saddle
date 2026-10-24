/**
 * Service de détection volontaire de localisation par IP
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

export interface LocationDataServices {
  getLocation: () => Promise<IPLocationData | null>;
  getIpAddress: () => Promise<string>;
}

export interface CollectedLocationData {
  locationData: IPLocationData | null;
  ipAddress: string | null;
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
 * Détecte la localisation complète de l'utilisateur après consentement explicite.
 */
export async function detectUserLocation(): Promise<IPLocationData | null> {
  try {
    // 1. Récupérer l'IP publique
    const ip = await getPublicIP();
    
    if (ip === 'Unknown') {
      return null;
    }

    // 2. Récupérer la localisation via l'IP. Ne pas la mettre en cache côté client.
    return await getLocationFromIP(ip);
  } catch (error) {
    console.error('Erreur détection localisation:', error);
    return null;
  }
}

/**
 * Récupère la localisation sans lecture ou écriture dans le stockage local.
 */
export async function getUserLocation(): Promise<IPLocationData | null> {
  return detectUserLocation();
}

/**
 * Collecte l'IP et la localisation uniquement après un consentement explicite.
 */
export async function collectLocationData(
  consent: boolean,
  services: LocationDataServices = {
    getLocation: getUserLocation,
    getIpAddress: getIPAddress,
  },
): Promise<CollectedLocationData> {
  if (!consent) {
    return { locationData: null, ipAddress: null };
  }

  const [locationData, ipAddress] = await Promise.all([
    services.getLocation(),
    services.getIpAddress(),
  ]);

  return {
    locationData,
    ipAddress: ipAddress === 'Unknown' ? null : ipAddress,
  };
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
 * Conservé pour compatibilité : la localisation n'est plus mise en cache côté client.
 */
export function clearLocationCache(): void {
  // No-op: location data is intentionally not stored in localStorage.
}
