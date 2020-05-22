const resolvers = require('../resolvers');

describe('[Query.launches]', () => {
  const mockContext = {
    dataSources: {
      launchAPI: { getAllLaunches: jest.fn() },
    },
  };
  const { getAllLaunches } = mockContext.dataSources.launchAPI;

  it('calls lookup from launch api', async () => {
    getAllLaunches.mockReturnValueOnce([{ id: 999, cursor: 'foo' }]);

    const res = await resolvers.Query.launches(null, {}, mockContext);
    expect(res).toEqual({
      cursor: 'foo',
      hasMore: false,
      launches: [{ id: 999, cursor: 'foo' }],
    });
  });

  it('respects pageSize arg', async () => {
    getAllLaunches.mockReturnValue([
      { id: 1, cursor: 'foo' },
      { id: 999, cursor: 'bar' },
    ]);

    const res = await resolvers.Query.launches(
      null,
      { pageSize: 1 },
      mockContext,
    );
    expect(res).toEqual({
      cursor: 'bar',
      hasMore: true,
      launches: [{ id: 999, cursor: 'bar' }],
    });
  });

  it('respects cursor arg', async () => {
    getAllLaunches.mockReturnValueOnce([
      { id: 1, cursor: 'a' },
      { id: 999, cursor: 'b' },
    ]);

    const res = await resolvers.Query.launches(
      null,
      { after: 'b' },
      mockContext,
    );

    expect(res).toEqual({
      hasMore: false,
      cursor: 'a',
      launches: [{ id: 1, cursor: 'a' }],
    });
  });

  it('respects both pageSize and cursor', async () => {
    getAllLaunches.mockReturnValue([
      { id: 1, cursor: 'a' },
      { id: 999, cursor: 'b' },
      { id: 123, cursor: 'c' },
    ]);

    const res = await resolvers.Query.launches(
      null,
      { after: 'c', pageSize: 1 },
      mockContext,
    );

    expect(res).toEqual({
      cursor: 'b',
      hasMore: true,
      launches: [{ id: 999, cursor: 'b' }],
    });
  });
});

describe('[Query.launch]', () => {
  const mockContext = {
    dataSources: {
      launchAPI: { getLaunchById: jest.fn() },
    },
  };

  it('calls lookup from launch api', async () => {
    const getLaunchById = mockContext.dataSources.launchAPI.getLaunchById;
    getLaunchById.mockReturnValueOnce({
      id: 999,
    });

    const res = await resolvers.Query.launch(null, { id: 999 }, mockContext);
    expect(res).toEqual({ id: 999 });

    expect(getLaunchById).toBeCalledWith({ launchId: 999 });
  });
});

describe('[Query.me]', () => {
  const mockContext = {
    dataSources: {
      userAPI: { findOrCreateUser: jest.fn() },
    },
    user: {},
  };

  it('returns null if no user in context', async () => {
    expect(await resolvers.Query.me(null, null, mockContext)).toBeFalsy();
  });

  it('returns user from userAPI', async () => {
    mockContext.user.email = 'a@a.a';
    const findOrCreateUser = mockContext.dataSources.userAPI.findOrCreateUser;
    findOrCreateUser.mockReturnValueOnce({ id: 999 });

    const res = await resolvers.Query.me(null, null, mockContext);
    expect(res).toEqual({
      id: 999,
    });
  });
});
