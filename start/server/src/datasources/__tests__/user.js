const UserAPI = require('../user');

const mockStore = {
  users: {
    findOrCreate: jest.fn(),
    findAll: jest.fn(),
  },
  trips: {
    findOrCreate: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
  },
};
module.exports.mockStore = mockStore;

const ds = new UserAPI({ store: mockStore });
ds.initialize({ context: { user: { id: 1, email: 'a@a.a' } } });

describe('[UserAPI.findOrCreateUser]', () => {
  it('returns null for invalid emails', async () => {
    const res = await ds.findOrCreateUser({ email: 'boo!' });
    expect(res).toEqual(null);
  });

  it('looks up/creates user in store', async () => {
    mockStore.users.findOrCreate.mockReturnValueOnce([{ id: 1 }]);

    const res = await ds.findOrCreateUser({ email: 'a@a.a' });
    expect(res).toEqual({ id: 1 });

    expect(mockStore.users.findOrCreate).toBeCalledWith({
      where: { email: 'a@a.a' },
    });
  });

  it('returns null if no user found/created', async () => {

    const res = await ds.findOrCreateUser({ email: 'a@a.a' });
    expect(res).toEqual(null);
  });
});

describe('[UserAPI.bookTrip]', () => {
  it('calls store creator and returns result', async () => {
    mockStore.trips.findOrCreate.mockReturnValueOnce([{ get: () => 'heya' }]);

    const res = await ds.bookTrip({ launchId: 1 });
    expect(res).toBeTruthy();

    expect(mockStore.trips.findOrCreate).toBeCalledWith({
      where: { launchId: 1, userId: 1 },
    });
  });
});

describe('[UserAPI.bookTrips]', () => {
  it('returns multiple lookups from bookTrip', async () => {
    mockStore.trips.findOrCreate.mockReturnValueOnce([{ get: () => 'heya' }]);
    mockStore.trips.findOrCreate.mockReturnValueOnce([{ get: () => 'okay' }]);

    const res = await ds.bookTrips({ launchIds: [1, 2] });
    expect(res).toEqual(['heya', 'okay']);
  });
});

describe('[UserAPI.cancelTrip]', () => {
  it('calls store destroy and returns result', async () => {
    const args = { userId: 1, launchId: 1 };
    mockStore.trips.destroy.mockReturnValueOnce('heya');

    const res = await ds.cancelTrip(args);
    expect(res).toEqual(true);

    expect(mockStore.trips.destroy).toBeCalledWith({ where: args });
  });
});

describe('[UserAPI.getLaunchIdsByUser]', () => {
  it('looks up launches by user', async () => {
    const args = { userId: 1 };
    const launches = [
      { dataValues: { launchId: 1 } },
      { dataValues: { launchId: 2 } },
    ];
    mockStore.trips.findAll.mockReturnValueOnce(launches);

    const res = await ds.getLaunchIdsByUser(args);
    expect(res).toEqual([1, 2]);

    expect(mockStore.trips.findAll).toBeCalledWith({ where: args });
  });

  it('returns empty array if nothing found', async () => {
    const args = { userId: 1 };
    const res = await ds.getLaunchIdsByUser(args);
    expect(res).toEqual([]);
  });
});
