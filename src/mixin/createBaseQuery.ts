import type { DefaultedQueryObserverOptions, QueryKey, QueryObserver } from '../core';
import type { QueryClient } from '../share';
import { cloneDeepUnref, fnBindThis, getClientKey, shouldThrowError } from '../share/utils';
import type { UseQueryOptionsGeneric } from '../hook/useBaseQuery';

export const createBaseQuery = <
  TQueryFnData,
  TError,
  TData,
  TQueryData,
  TQueryKey extends QueryKey,
  TPageParam,
>($id: string,
  Observer: typeof QueryObserver,
  options: UseQueryOptionsGeneric<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >,
  queryClient?: QueryClient,) => {
  const queryClientKey = getClientKey();
  console.log('createBaseQuery');
  return {
    inject: [queryClientKey],
    data() {
      return {
        [`state_${$id}`]: {}
      };
    },
    computed: {
      [`defaultedOptions_${$id}`]() {
        const copeOptions = { ...options };
        fnBindThis(copeOptions, 'queryFn', this);
        fnBindThis(copeOptions, 'queryKey', this);
        const clonedOptions = cloneDeepUnref(copeOptions as any);
        if (typeof clonedOptions.enabled === 'function') {
          clonedOptions.enabled = clonedOptions.enabled.call(this);
        }
        const defaulted: DefaultedQueryObserverOptions<
          TQueryFnData,
          TError,
          TData,
          TQueryData,
          TQueryKey
        > = this[`client_${$id}`].defaultQueryOptions(clonedOptions as any);

        defaulted._optimisticResults = this[`client_${$id}`].isRestoring.value
          ? 'isRestoring'
          : 'optimistic';

        return defaulted;
      },
      [`get${$id}`]() {
        return {
          ...this[`state_${$id}`],
          refetch: this[`refetch_${$id}`]
        };
      }
    },
    created() {
      const updateState = (data) => {
        Object.keys(data || {}).forEach((key) => {
          this.$set(this[`state_${$id}`], key, data[key]);
        });
      };
      const client = queryClient || this[queryClientKey] || this.$queryClient;
      this[`client_${$id}`] = client;
      const observer = new Observer(client, this[`defaultedOptions_${$id}`]);
      updateState(observer.getCurrentResult());
      this[`observer_${$id}`] = observer;
      this[`unsubscribe_${$id}`] = () => {
        // noop
      };
      this.$watch(
        () => client.isRestoring.value,
        (isRestoring) => {
          if (!isRestoring) {
            this[`unsubscribe_${$id}`]();
            this[`unsubscribe_${$id}`] = observer.subscribe((result) => {
              updateState(result);
            });
          }
        },
        { immediate: true },
      );

      const updater = () => {
        observer.setOptions(this[`defaultedOptions_${$id}`]);
        updateState(observer.getCurrentResult());
      };
      this.$watch(() => this[`defaultedOptions_${$id}`], () => {
        updater();
      });
      this[`refetch_${$id}`] = (...args: Parameters<any>) => {
        updater();
        return this[`state_${$id}`].refetch(...args);
      };
      this.$watch(
        () => this[`state_${$id}`].error,
        (error) => {
          const state = this[`state_${$id}`];
          if (
            state.isError &&
            !state.isFetching &&
            shouldThrowError(this[`defaultedOptions_${$id}`].throwOnError, [
              error as TError,
              observer.getCurrentQuery(),
            ])
          ) {
            throw error;
          }
        },
      );
    },
    beforeDestroy() {
      this[`unsubscribe_${$id}`]();
    },
  };
};
