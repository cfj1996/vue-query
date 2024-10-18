import type { MaybeRefDeep } from '../hook/types';
import { DefaultError, type MutateOptions, MutationObserver, QueryClient, UseMutationReturnType } from '../hook';
import { UseMutationOptionsBase } from '../hook/useMutation';
import { cloneDeepUnref, getClientKey, shouldThrowError } from '../hook/utils';
import { createId, fnBindThis } from '../minxin/utils';

const createBaseMutation = function <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown
>(
  $id: string,
  mutationOptions: MaybeRefDeep<
    UseMutationOptionsBase<TData, TError, TVariables, TContext>
  >,
  queryClient?: QueryClient
) {
  const queryClientKey = getClientKey();
  return {
    inject: [queryClientKey],
    data() {
      return {
        [`state_${$id}`]: {}
      };
    },
    computed: {
      [`options_${$id}`]() {
        const copeMutationOptions = { ...mutationOptions };
        fnBindThis(copeMutationOptions,'mutationFn', this)
        fnBindThis(copeMutationOptions,'onError', this)
        fnBindThis(copeMutationOptions,'onMutate', this)
        fnBindThis(copeMutationOptions,'onSettled', this)
        fnBindThis(copeMutationOptions,'onSuccess', this)
        const options = cloneDeepUnref(copeMutationOptions)
        return this[`client_${$id}`].defaultMutationOptions(options);
      },
      [`get${$id}`]() {
        const state = this[`state_${$id}`];
        return {
          ...state,
          mutate: this[`mutate_${$id}`],
          mutateAsync: state.mutate,
          reset: state.reset,
        };
      }
    },
    created() {
      const updateState = (data) => {
        Object.keys(data).forEach((key) => {
          this.$set(this[`state_${$id}`], key, data[key]);
        });
      };
      const client = queryClient || this[queryClientKey] || this.$queryClient;
      this[`client_${$id}`] = client;
      const observer = new MutationObserver(client, this[`options_${$id}`]);
      updateState(observer.getCurrentResult());
      this[`unsubscribe_${$id}`] = observer.subscribe((result) => {
        updateState(result);
      });
      this[`mutate_${$id}`] = (
        variables: TVariables,
        mutateOptions?: MutateOptions<TData, TError, TVariables, TContext>,
      ) => {
        observer.mutate(variables as any, mutateOptions as any).catch(() => {
          // This is intentional
        });
      };
      this.$watch(() => this[`options_${$id}`], () => {
        observer.setOptions(this[`options_${$id}`]);
      });
      this.$watch(
        () => this[`state_${$id}`].error,
        (error) => {
          if (
            error &&
            shouldThrowError(this[`options_${$id}`].throwOnError, [error as TError])
          ) {
            throw error;
          }
        },
      );
    },
    beforeDestroy() {
      this[`unsubscribe_${$id}`]();
    }
  };
};
export const createMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown>(
  mutationOptions: MaybeRefDeep<UseMutationOptionsBase<TData, TError, TVariables, TContext>>,
  queryClient?: QueryClient) => {
  const $id = createId();

  return [createBaseMutation($id, mutationOptions, queryClient),
    function getData() {
      return this[`get${$id}`] as UseMutationReturnType<TData, TError, TVariables, TContext>;
    }];
};
