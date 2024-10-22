# Vue Query

Hooks for fetching, caching and updating asynchronous data in Vue.

Support for Vue 2.x via [vue-demi](https://github.com/vueuse/vue-demi)

# Documentation

Visit https://tanstack.com/query/latest/docs/vue/overview

# Quick Features

- Transport/protocol/backend agnostic data fetching (REST, GraphQL, promises, whatever!)
- Auto Caching + Refetching (stale-while-revalidate, Window Refocus, Polling/Realtime)
- Parallel + Dependent Queries
- Mutations + Reactive Query Refetching
- Multi-layer Cache + Automatic Garbage Collection
- Paginated + Cursor-based Queries
- Load-More + Infinite Scroll Queries w/ Scroll Recovery
- Request Cancellation
- (experimental) [Suspense](https://v3.vuejs.org/guide/migration/suspense.html#introduction) + Fetch-As-You-Render Query Prefetching
- (experimental) SSR support
- Dedicated Devtools
- [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@tanstack/vue-query)](https://bundlephobia.com/package/@tanstack/vue-query) (depending on features imported)

# Quick Start

1. Install `zan-vue-query`

   ```bash
   $ npm i zan-vue-query
   ```

   or

   ```bash
   $ pnpm add zan-vue-query
   ```

   or

   ```bash
   $ yarn add zan-vue-query
   ```

   or

   ```bash
   $ bun add zan-vue-query
   ```

   > If you are using Vue 2.6, make sure to also setup [@vue/composition-api](https://github.com/vuejs/composition-api)

2. Initialize **Vue Query** via **QueryPlugin**

   ```tsx
   import { createApp } from 'vue'
   import { QueryPlugin } from 'zan-vue-query'

   import App from './App.vue'

   createApp(App).use(QueryPlugin).mount('#app')
   ```

3. Use query

   ```tsx
   import { defineComponent } from 'vue'
   import { useQuery } from 'zan-vue-query'

   export default defineComponent({
     name: 'MyComponent',
     setup() {
       const query = useQuery({ queryKey: ['todos'], queryFn: getTodos })

       return {
         query,
       }
     },
   })
   ```

4. create query 

   ```tsx
   import Vue from 'vue'
   import { createQuery } from 'vue-query'
   const [todosMixin, getTodosQuery] = createQuery({ queryKey: function(){
      return ['todos', this.id]
   }, queryFn: getTodos })
   export default Vue.extend({
     name: 'MyComponent',
     props: {
     id: Number
     },
     mixins: [todosMixin],
    computed: {
       todos: getTodosQuery
    }
   })
   ```

5. If you need to update options on your query dynamically, make sure to pass them as reactive variables

   ```tsx
   const id = ref(1)
   const enabled = ref(false)

   const query = useQuery({
     queryKey: ['todos', id],
     queryFn: () => getTodos(id),
     enabled,
   })
   ```
