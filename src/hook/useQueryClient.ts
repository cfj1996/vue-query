import { hasInjectionContext, inject } from 'vue-demi';
import { getClientKey } from '../share/utils';
import type { QueryClient } from '../share/queryClient';

export function useQueryClient(id = ''): QueryClient {
  if (!hasInjectionContext()) {
    throw new Error(
      'vue-query hooks can only be used inside setup() function or functions that support injection context.',
    )
  }
  const key = getClientKey(id)
  const queryClient = inject<QueryClient>(key)

  if (!queryClient) {
    throw new Error(
      "No 'queryClient' found in Vue context, use 'VueQueryPlugin' to properly initialize the library.",
    )
  }

  return queryClient
}
