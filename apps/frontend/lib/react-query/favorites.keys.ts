export const favoritesKeys = {
  all: ["favorites"] as const,
  listing: (type: string, id: number | string) =>
    ["favorite", type, id] as const,
};
