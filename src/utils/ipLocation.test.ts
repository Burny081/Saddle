import { describe, expect, it, vi } from 'vitest';
import { collectLocationData, type IPLocationData } from './ipLocation';

const location: IPLocationData = {
  ip: '203.0.113.10',
  city: 'Douala',
  region: 'Littoral',
  country: 'Cameroon',
  country_code: 'CM',
  timezone: 'Africa/Douala',
  latitude: 4.0511,
  longitude: 9.7679,
};

describe('location data collection', () => {
  it('does not request IP or location data without consent', async () => {
    const getLocation = vi.fn();
    const getIpAddress = vi.fn();

    await expect(collectLocationData(false, { getLocation, getIpAddress })).resolves.toEqual({
      locationData: null,
      ipAddress: null,
    });

    expect(getLocation).not.toHaveBeenCalled();
    expect(getIpAddress).not.toHaveBeenCalled();
  });

  it('returns consented location and IP data from the supplied services', async () => {
    const getLocation = vi.fn().mockResolvedValue(location);
    const getIpAddress = vi.fn().mockResolvedValue(location.ip);

    await expect(collectLocationData(true, { getLocation, getIpAddress })).resolves.toEqual({
      locationData: location,
      ipAddress: location.ip,
    });
  });
});
