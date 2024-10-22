import type { Ref } from 'vue-demi';
import { computed, getCurrentScope, onScopeDispose, shallowReadonly, shallowRef, watch, } from 'vue-demi';
import { useQueryClient } from './useQueryClient';
import { cloneDeepUnref } from '../share/utils';
import type { Mutation, MutationFilters as MF, MutationState, } from '../core/index';
import type { QueryClient } from '../share/queryClient';
import type { MaybeRefDeep } from '../share/types';
import type { MutationCache } from '../share/mutationCache';

export type MutationFilters = MaybeRefDeep<MF>

export function useIsMutating(
  filters: MutationFilters = {},
  queryClient?: QueryClient,
): Ref<number> {
  if (process.env.NODE_ENV === 'development') {
    if (!getCurrentScope()) {
      console.warn(
        'vue-query composable like "useQuery()" should only be used inside a "setup()" function or a running effect scope. They might otherwise lead to memory leaks.',
      )
    }
  }

  const client = queryClient || useQueryClient()

  const mutationState = useMutationState(
    {
      filters: computed(() => ({
        ...cloneDeepUnref(filters),
        status: 'pending' as const,
      })),
    },
    client,
  )
  const length = computed(() => mutationState.value.length)

  return length
}

export type MutationStateOptions<TResult = MutationState> = {
  filters?: MutationFilters
  select?: (mutation: Mutation) => TResult
}

function getResult<TResult = MutationState>(
  mutationCache: MutationCache,
  options: MutationStateOptions<TResult>,
): Array<TResult> {
  return mutationCache
    .findAll(options.filters)
    .map(
      (mutation): TResult =>
        (options.select ? options.select(mutation) : mutation.state) as TResult,
    )
}

export function useMutationState<TResult = MutationState>(
  options: MutationStateOptions<TResult> = {},
  queryClient?: QueryClient,
): Readonly<Ref<Array<TResult>>> {
  const filters = computed(() => cloneDeepUnref(options.filters))
  const mutationCache = (queryClient || useQueryClient()).getMutationCache()
  const state = shallowRef(getResult(mutationCache, options)) as Ref<
    Array<TResult>
  >
  const unsubscribe = mutationCache.subscribe(() => {
    const result = getResult(mutationCache, options)
    state.value = result
  })

  watch(filters, () => {
    state.value = getResult(mutationCache, options)
  })

  onScopeDispose(() => {
    unsubscribe()
  })

  return shallowReadonly(state)
}
