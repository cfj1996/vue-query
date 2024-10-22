import type { QueryClientConfig } from './core';
import { QueryClient } from './share/queryClient';
import { getClientKey } from './share/utils';
import { isVue2 } from 'vue-demi';

type ClientPersister = (client: QueryClient) => [() => void, Promise<void>]

interface CommonOptions {
  enableDevtoolsV6Plugin?: boolean
  queryClientKey?: string
  clientPersister?: ClientPersister
  clientPersisterOnSuccess?: (client: QueryClient) => void
}

interface ConfigOptions extends CommonOptions {
  queryClientConfig?: QueryClientConfig
}

interface ClientOptions extends CommonOptions {
  queryClient?: QueryClient
}

export type VueQueryPluginOptions = ConfigOptions | ClientOptions

declare module 'vue/types/vue' {
  interface Vue {
    $queryClient: QueryClient
  }
}

export const QueryPlugin = {
  install: (app: any, options: VueQueryPluginOptions = {}) => {
    const clientKey = getClientKey(options.queryClientKey)
    let client: QueryClient

    if ('queryClient' in options && options.queryClient) {
      client = options.queryClient
    } else {
      const clientConfig =
        'queryClientConfig' in options ? options.queryClientConfig : undefined
      client = new QueryClient(clientConfig)
    }
    client.mount()
    let persisterUnmount = () => {
      // noop
    }
    if(!client.isRestoring){
      client.isRestoring = app.observable({value: false})
    }
    if (options.clientPersister) {
      client.isRestoring.value = true
      const [unmount, promise] = options.clientPersister(client)
      persisterUnmount = unmount
      promise.then(() => {
        client.isRestoring.value = false
        options.clientPersisterOnSuccess?.(client)
      })
    }

    const cleanup = () => {
      client.unmount()
      persisterUnmount()
    }
    if (app.onUnmount) {
      app.onUnmount(cleanup)
    } else {
      const originalUnmount = app.unmount
      app.unmount = function vueQueryUnmount() {
        cleanup()
        originalUnmount()
      }
    }

    if (isVue2) {
      app.mixin({
        beforeCreate() {
          // HACK: taken from provide(): https://github.com/vuejs/composition-api/blob/master/src/apis/inject.ts#L30
          if (!this._provided) {
            const provideCache = {}
            Object.defineProperty(this, '_provided', {
              get: () => provideCache,
              set: (v) => Object.assign(provideCache, v),
            })
          }

          this._provided[clientKey] = client
        },
      })
      app.prototype.$queryClient = client
    } else {
      app.provide(clientKey, client)
    }
  },
}
