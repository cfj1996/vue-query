import type { DefaultError, DefinedQueryObserverResult, QueryKey, QueryObserverOptions, } from '../core/index';
import { QueryObserver } from '../core/index';
import type { UseBaseQueryReturnType } from './useBaseQuery';
import { useBaseQuery } from './useBaseQuery';
import type { DeepUnwrapRef, MaybeRef, MaybeRefDeep, MaybeRefOrGetter, } from '../share/types';
import type { QueryClient } from '../share/queryClient';

type NonUndefinedGuard<T> = T extends undefined ? never : T

export type UseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = MaybeRef<
  {
    [Property in keyof QueryObserverOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey
    >]: Property extends 'enabled'
      ? MaybeRefOrGetter<
          QueryObserverOptions<
            TQueryFnData,
            TError,
            TData,
            TQueryData,
            DeepUnwrapRef<TQueryKey>
          >[Property]
        >
      : MaybeRefDeep<
          QueryObserverOptions<
            TQueryFnData,
            TError,
            TData,
            TQueryData,
            DeepUnwrapRef<TQueryKey>
          >[Property]
        >
  } & {
    shallow?: boolean
  }
>

export type UndefinedInitialQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey> & {
  initialData?: undefined
}

export type DefinedInitialQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey> & {
  initialData:
    | NonUndefinedGuard<TQueryFnData>
    | (() => NonUndefinedGuard<TQueryFnData>)
}

export type UseQueryReturnType<TData, TError> = UseBaseQueryReturnType<
  TData,
  TError
>

export type UseQueryDefinedReturnType<TData, TError> = UseBaseQueryReturnType<
  TData,
  TError,
  DefinedQueryObserverResult<TData, TError>
>

export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): UseQueryReturnType<TData, TError>

export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): UseQueryDefinedReturnType<TData, TError>

export function useQuery<
  TQueryFnData = unknown,
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
): UseQueryReturnType<TData, TError>

export function useQuery<
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
):
  | UseQueryReturnType<TData, TError>
  | UseQueryDefinedReturnType<TData, TError> {
  return useBaseQuery(QueryObserver, options, queryClient)
}
