import type { DefaultError } from '../core';
import { QueryObserver } from '../core';
import type { UseQueryDefinedReturnType, UseQueryOptions, UseQueryReturnType } from '../hook/useQuery';
import { createBaseQuery } from './createBaseQuery';
import { createId } from '../share/utils';
import { QueryClient } from '../share';

type QueryKey = ReadonlyArray<unknown> | ((vm: any) => ReadonlyArray<unknown>)

export function createQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    TQueryKey
  >,
  queryClient?: QueryClient,
) {
  const $id = createId();

  return [
    createBaseQuery($id, QueryObserver, options, queryClient),
    function getState() {
      return this[`get${$id}`] as (UseQueryReturnType<TData, TError> | UseQueryDefinedReturnType<TData, TError>);
    }
  ];
}
