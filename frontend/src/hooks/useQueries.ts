import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useIsValid() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isValid'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isValid();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGoogleSheetsURL() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['googleSheetsURL'],
    queryFn: async () => {
      if (!actor) return '';
      try {
        return await actor.getGoogleSheetsURL();
      } catch {
        return '';
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFetchGoogleSheet() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['googleSheetData'],
    queryFn: async () => {
      if (!actor) return '';
      try {
        return await actor.fetchGoogleSheet();
      } catch {
        return '';
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSetGoogleSheetsURL() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.setGoogleSheetsURL(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['googleSheetsURL'] });
      queryClient.invalidateQueries({ queryKey: ['isValid'] });
    },
  });
}

export function useRefreshGoogleSheet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.fetchGoogleSheet();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['googleSheetData'], data);
      queryClient.invalidateQueries({ queryKey: ['googleSheetData'] });
    },
  });
}
