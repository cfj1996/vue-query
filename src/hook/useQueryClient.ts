import { inject } from '@vue/composition-api';

import { getClientKey } from './utils';
import type { QueryClient } from './queryClient';

export function useQueryClient(id = ''): QueryClient {
  const key = getClientKey(id)
  const queryClient = inject<QueryClient>(key)

  if (!queryClient) {
    throw new Error(
      "No 'queryClient' found in Vue context, use 'VueQueryPlugin' to properly initialize the library.",
    )
  }

  return queryClient
}