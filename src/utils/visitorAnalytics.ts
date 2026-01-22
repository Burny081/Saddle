import type { Visitor } from '@/types/compatibility';

export interface CityData {
    city: string;
    count: number;
    percentage: number;
}

export interface HourData {
    hour: number;
    count: number;
}

export interface DateData {
    date: string;
    count: number;
}

export interface DeviceData {
    device: string;
    count: number;
    percentage: number;
}

/**
 * Get visitor distribution by city
 */
export function getVisitorsByCity(visitors: Visitor[]): CityData[] {
    const cityMap = new Map<string, number>();

    visitors.forEach(visitor => {
        const city = visitor.location.split(',')[0].trim();
        cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });

    const total = visitors.length;
    return Array.from(cityMap.entries())
        .map(([city, count]) => ({
            city,
            count,
            percentage: (count / total) * 100
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get visitor distribution by hour of day
 */
export function getVisitorsByHour(visitors: Visitor[]): HourData[] {
    const hourMap = new Map<number, number>();

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
        hourMap.set(i, 0);
    }

    visitors.forEach(visitor => {
        try {
            const timeParts = visitor.time.split(':');
            const hour = parseInt(timeParts[0], 10);
            if (!isNaN(hour) && hour >= 0 && hour < 24) {
                hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
            }
        } catch {
            // Skip invalid time entries silently
        }
    });

    return Array.from(hourMap.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour);
}

/**
 * Get visitor distribution by date
 */
export function getVisitorsByDate(visitors: Visitor[]): DateData[] {
    const dateMap = new Map<string, number>();

    visitors.forEach(visitor => {
        dateMap.set(visitor.date, (dateMap.get(visitor.date) || 0) + 1);
    });

    return Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get device type distribution
 */
export function getDeviceDistribution(visitors: Visitor[]): DeviceData[] {
    const deviceMap = new Map<string, number>();

    visitors.forEach(visitor => {
        const device = visitor.device || 'Unknown';
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    });

    const total = visitors.length;
    return Array.from(deviceMap.entries())
        .map(([device, count]) => ({
            device,
            count,
            percentage: (count / total) * 100
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get top N cities by visitor count
 */
export function getTopCities(visitors: Visitor[], limit: number = 10): CityData[] {
    return getVisitorsByCity(visitors).slice(0, limit);
}

/**
 * Get peak hour (hour with most visitors)
 */
export function getPeakHour(visitors: Visitor[]): { hour: number; count: number } {
    const hourData = getVisitorsByHour(visitors);
    return hourData.reduce((peak, current) =>
        current.count > peak.count ? current : peak
        , { hour: 0, count: 0 });
}

/**
 * Get visitor growth rate (comparing last 7 days to previous 7 days)
 */
export function getGrowthRate(visitors: Visitor[]): number {
    const now = new Date();
    const last7Days = visitors.filter(v => {
        const visitDate = new Date(v.date);
        const diffDays = Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 7;
    }).length;

    const previous7Days = visitors.filter(v => {
        const visitDate = new Date(v.date);
        const diffDays = Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 7 && diffDays < 14;
    }).length;

    if (previous7Days === 0) return last7Days > 0 ? 100 : 0;
    return ((last7Days - previous7Days) / previous7Days) * 100;
}
