import type { Ref } from '@vue/composition-api';
import {
  computed,
  getCurrentScope,
  onScopeDispose,
  readonly,
  shallowReactive,
  shallowReadonly,
  toRefs,
  watch,
} from '@vue/composition-api';
import { useQueryClient } from './useQueryClient';
import { cloneDeepUnref, shouldThrowError, updateState } from '../share/utils';
import type { DefaultedQueryObserverOptions, QueryKey, QueryObserver, QueryObserverResult, } from '../core/index';
import type { QueryClient } from '../share/queryClient';
import type { UseQueryOptions } from './useQuery';
import type { UseInfiniteQueryOptions } from './useInfiniteQuery';

export type UseBaseQueryReturnType<
  TData,
  TError,
  TResult = QueryObserverResult<TData, TError>,
> = {
  [K in keyof TResult]: K extends
    | 'fetchNextPage'
    | 'fetchPreviousPage'
    | 'refetch'
    ? TResult[K]
    : Ref<Readonly<TResult>[K]>
} & {
  suspense: () => Promise<TResult>
}

export type UseQueryOptionsGeneric<
  TQueryFnData,
  TError,
  TData,
  TQueryData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> =
  | UseQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>
  | UseInfiniteQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey,
      TPageParam
    >

export function useBaseQuery<
  TQueryFnData,
  TError,
  TData,
  TQueryData,
  TQueryKey extends QueryKey,
  TPageParam,
>(
  Observer: typeof QueryObserver,
  options: UseQueryOptionsGeneric<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >,
  queryClient?: QueryClient,
): UseBaseQueryReturnType<TData, TError> {
  if (process.env.NODE_ENV === 'development') {
    if (!getCurrentScope()) {
      console.warn(
        'vue-query composable like "useQuery()" should only be used inside a "setup()" function or a running effect scope. They might otherwise lead to memory leaks.',
      )
    }
  }

  const client = queryClient || useQueryClient()

  const defaultedOptions = computed(() => {
    const clonedOptions = cloneDeepUnref(options as any)

    if (typeof clonedOptions.enabled === 'function') {
      clonedOptions.enabled = clonedOptions.enabled()
    }

    const defaulted: DefaultedQueryObserverOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey
    > = client.defaultQueryOptions(clonedOptions)

    defaulted._optimisticResults = client.isRestoring.value
      ? 'isRestoring'
      : 'optimistic'

    return defaulted
  })

  const observer = new Observer(client, defaultedOptions.value)
  const state = shallowReactive(observer.getCurrentResult())

  let unsubscribe = () => {
    // noop
  }

  watch(
    () => client.isRestoring.value,
    (isRestoring) => {
      if (!isRestoring) {
        unsubscribe()
        unsubscribe = observer.subscribe((result) => {
          updateState(state, result)
        })
      }
    },
    { immediate: true },
  )

  const updater = () => {
    observer.setOptions(defaultedOptions.value)
    updateState(state, observer.getCurrentResult())
  }

  watch(defaultedOptions, updater)

  onScopeDispose(() => {
    unsubscribe()
  })

  // fix #5910
  const refetch = (...args: Parameters<(typeof state)['refetch']>) => {
    updater()
    return state.refetch(...args)
  }
  // Handle error boundary
  watch(
    () => state.error,
    (error) => {
      if (
        state.isError &&
        !state.isFetching &&
        shouldThrowError(defaultedOptions.value.throwOnError, [
          error as TError,
          observer.getCurrentQuery(),
        ])
      ) {
        throw error
      }
    },
  )

  const readonlyState =
    process.env.NODE_ENV === 'production'
      ? state
      : // @ts-expect-error
        defaultedOptions.value.shallow
        ? shallowReadonly(state)
        : readonly(state)

  const object: any = toRefs(readonlyState)
  for (const key in state) {
    if (typeof state[key as keyof typeof state] === 'function') {
      object[key] = state[key as keyof typeof state]
    }
  }
  object.refetch = refetch

  return object as UseBaseQueryReturnType<TData, TError>
}
