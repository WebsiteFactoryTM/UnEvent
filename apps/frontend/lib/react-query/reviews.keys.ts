export const reviewsKeys = {
  all: ["reviews"] as const,
  _listing: (type: string, id: number | string) =>
    ["reviews", type, id] as const,
  list: (
    type: string,
    id: number | string,
    opts: { page?: number; limit?: number; status?: string } = {},
  ) =>
    [
      ...reviewsKeys._listing(type, id),
      {
        page: opts.page ?? 1,
        limit: opts.limit ?? 10,
        status: opts.status ?? "approved",
      },
    ] as const,
};
