import type { DefaultError, InfiniteData, QueryKey, QueryObserver, } from '../core/index';
import { InfiniteQueryObserver } from '../core/index';
import { createBaseQuery } from './createBaseQuery';
import type { QueryClient } from '../share';
import { createId } from '../share/utils';
import type { UseInfiniteQueryOptions, UseInfiniteQueryReturnType, } from '../hook';

export function createInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    TQueryKey,
    TPageParam
  >,
  queryClient?: QueryClient,
) {
  const $id = createId();

  return [
    createBaseQuery(
      $id,
      InfiniteQueryObserver as typeof QueryObserver,
      options as any,
      queryClient,
    ),
    function getState() {
      return this[`get${$id}`] as UseInfiniteQueryReturnType<TData, TError>;
    }];
}
