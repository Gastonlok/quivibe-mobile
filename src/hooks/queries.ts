import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { venues } from "../services/api/venues";
import { events } from "../services/api/events";
import { useSession } from "../store/session";
export function useVenues(filters: Record<string, string> = {}) {
  const { user } = useSession();
  return useInfiniteQuery({
    queryKey: ["venues", user?.id, filters],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => venues.list(filters, pageParam, signal),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
}
export function useVenue(slug: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["venue", slug, user?.id],
    queryFn: ({ signal }) => venues.detail(slug, signal),
    enabled: Boolean(slug),
  });
}
export function useEvents(filters: Record<string, string> = {}) {
  return useInfiniteQuery({
    queryKey: ["events", filters],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => events.list(filters, pageParam, signal),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
}
