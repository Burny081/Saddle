import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  clients: {
    insert: vi.fn(),
    update: vi.fn(),
  },
  profiles: {
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('./supabaseClient', () => ({
  supabase: { from: mocks.from },
}));

import { createClient, deleteClient, updateClient } from './apiCatalog';

const clientInput = {
  id: 'client-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+237600000000',
  address: 'Douala',
  client_type: 'individual' as const,
  is_active: true,
};

const createdClient = {
  ...clientInput,
  total_spent: 0,
};

const updatedClient = {
  ...createdClient,
  name: 'Ada Byron',
};

const singleResult = (result: { data: unknown; error: Error | null }) => ({
  single: vi.fn().mockResolvedValue(result),
});

describe('catalogue client synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mocks.from.mockImplementation((table: string) => {
      if (table === 'clients') return mocks.clients;
      if (table === 'profiles') return mocks.profiles;
      throw new Error(`Unexpected table: ${table}`);
    });

    mocks.clients.insert.mockReturnValue({
      select: vi.fn(() => singleResult({ data: createdClient, error: null })),
    });
    mocks.clients.update.mockReturnValue({
      eq: vi.fn(() => ({
        select: vi.fn(() => singleResult({ data: updatedClient, error: null })),
      })),
    });
    mocks.profiles.insert.mockResolvedValue({ error: null });
    mocks.profiles.update.mockReturnValue({
      eq: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
    });
  });

  it('creates the primary client before synchronizing its client profile', async () => {
    await expect(createClient(clientInput)).resolves.toEqual(createdClient);

    expect(mocks.from).toHaveBeenNthCalledWith(1, 'clients');
    expect(mocks.from).toHaveBeenNthCalledWith(2, 'profiles');
    expect(mocks.profiles.insert).toHaveBeenCalledWith({
      id: createdClient.id,
      name: clientInput.name,
      email: clientInput.email,
      phone: clientInput.phone,
      address: clientInput.address,
      role: 'client',
      is_active: true,
    });
  });

  it('returns the created client when profile synchronization fails', async () => {
    mocks.profiles.insert.mockResolvedValueOnce({ error: new Error('profile unavailable') });

    await expect(createClient(clientInput)).resolves.toEqual(createdClient);
  });

  it('rejects creation when the primary client write fails', async () => {
    mocks.clients.insert.mockReturnValueOnce({
      select: vi.fn(() => singleResult({ data: null, error: new Error('client write failed') })),
    });

    await expect(createClient(clientInput)).rejects.toThrow('client write failed');
  });

  it('updates the primary client and attempts profile synchronization', async () => {
    await expect(updateClient(createdClient.id, { name: updatedClient.name })).resolves.toEqual(updatedClient);

    expect(mocks.from).toHaveBeenCalledWith('clients');
    expect(mocks.from).toHaveBeenCalledWith('profiles');
    expect(mocks.profiles.update).toHaveBeenCalledWith(expect.objectContaining({
      name: updatedClient.name,
      updated_at: expect.any(String),
    }));
  });

  it('soft-deactivates the client and its profile', async () => {
    mocks.clients.update.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    await expect(deleteClient(createdClient.id)).resolves.toBeUndefined();

    expect(mocks.clients.update).toHaveBeenCalledWith({ is_active: false });
    expect(mocks.profiles.update).toHaveBeenCalledWith({ is_active: false });
  });
});
