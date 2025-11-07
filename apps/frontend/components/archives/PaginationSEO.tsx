import Head from "next/head";

export function PaginationSEO({
  baseUrl,
  page,
  hasMore,
}: {
  baseUrl: string;
  page: number;
  hasMore: boolean;
}) {
  return (
    <Head>
      {page > 1 && <link rel="prev" href={`${baseUrl}?page=${page - 1}`} />}
      {hasMore && <link rel="next" href={`${baseUrl}?page=${page + 1}`} />}
    </Head>
  );
}
