# Zan Vue Query

Hooks Mixin 版本请求库, 支持vue 2.6, vue 2.7, vue 3, uniApp 小程序

Support for Vue 2.x via [vue-demi](https://github.com/vueuse/vue-demi)

# Documentation 参考

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

2. Initialize **Zan Vue Query** via **QueryPlugin**

   ```tsx
   import { createApp } from 'vue'
   import { QueryPlugin } from 'zan-vue-query'

   import App from './App.vue'

   createApp(App).use(QueryPlugin).mount('#app')
   ```

3. Hook 版本 Use query

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

4. Mixin 版本 create query 

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

5. 动态控制请求是否执行使用 enabled 属性控制

   ```tsx
   const id = ref(1)
   const enabled = ref(false)

   const query = useQuery({
     queryKey: ['todos', id],
     queryFn: () => getTodos(id),
     enabled,
   })
   ```
6. 获取 queryClient 实例,Mixin可以通过 this.$queryClient 访问, hook可以通过 useQueryClient

### mixin 于 hook 版本区别
1. queryFn, queryKey, enabled : mixin版本如果参数为函数时可以访问 this 组件实例
2. mutationFn, onError, onMutate, onSettled, onSuccess: mixin版本如果参数为函数时可以访问 this 组件实例
3. mixin版本获取返回值需要绑定到 computed 才能访问


### 小技巧
由于 useQuery api 没有请求成功的配置项，当获取数据到需要setData时需要使用 watch 状态 isSuccess， 由于带有缓存功能不是每个queryFn都会触发

### 一个mixin版本的 posts list 例子

```vue
<script lang="js">
//  PostsList.vue 页面  
import { createInfiniteQuery, createMutation } from 'zan-vue-query'
const [delPostMixin, getDelPostState] = createMutation({
  mutationFn: ({ id }) => {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'DELETE',
    }).then(
      (response) => response.json(),
    );
  },
  onSettled() {
    return this.$queryClient.invalidateQueries({ queryKey: ['posts'] });
  }
});
const getPosts = async ({ pageParam, pageSize }) => {
  const count = Number(localStorage.getItem('count') || '22');
  return fetch(`https://jsonplaceholder.typicode.com/posts?_page=${pageParam}&_limit=${pageSize}`).then(
    (response) => response.json().then((res) => ({
      items: pageParam * pageSize > count ? res.slice(0, count - (pageParam - 1) * pageSize) : res,
      count,
      page: pageParam,
    })),
  );

};

const [postsMixin, getPostsState] = createInfiniteQuery({
  queryKey: function() {
    return ['posts', this.pageSize];
  },
  initialPageParam: 1,
  getNextPageParam: (lastPage, pages) => {
    if (pages.map(i => i.items.length).reduce((acc, item) => acc + item, 0) >= lastPage.count) {
      return null;
    }
    return lastPage.page + 1;
  },
  queryFn(data) {
    console.log('arguments', this.postsState.data);
    const { pageParam, queryKey } = data;
    return getPosts({ pageParam, pageSize: queryKey[1] });
  }
});

export default {
  name: 'Posts',
  mixins: [postsMixin, delPostMixin],
  computed: {
    postsState: getPostsState,
    delPostState: getDelPostState
  },
  data() {
    return {
      pageSize: 10
    };
  },
  updated() {
    console.log('postsState', this.postsState);
    console.log('delPostState', this.delPostState);
  }
};
</script>

<template>
  <div>
    <div>
      <el-button-group>
        <el-button :type="pageSize === 5?'primary':''" @click="pageSize = 5">设置5页</el-button>
        <el-button :type="pageSize === 10?'primary':''" @click="pageSize = 10">设置10页</el-button>
        <el-button :type="pageSize === 15?'primary':''" @click="pageSize = 15">设置15页</el-button>
      </el-button-group>
    </div>
    <div v-if="postsState.isLoading">loading ...</div>
    <div v-if="postsState.isError">{{ postsState.error }}</div>
    <ul v-if="postsState.data?.pages">
      <template v-for="(posts, index) in postsState.data.pages">
        <li v-for="post in posts.items" :key="post.id">
          <div style="display: flex; align-items: center;">
            <h3>{{ post.id }} </h3>
            <p> title: {{ post.title }}</p>
            <el-button type="primary" @click="$emit('edit', post.id )">编辑</el-button>
            <el-button @click="delPostState.mutate({id: post.id})"
                       :loading="delPostState.variables?.id === post.id ?  delPostState.isPending: false">删除
            </el-button>
          </div>
        </li>
      </template>
      <li v-if="postsState.hasNextPage">
        <el-button :disabled="postsState.isFetchingNextPage"
                   :loading="postsState.isFetchingNextPage"
                   @click="postsState.fetchNextPage()">
          {{ postsState.isFetchingNextPage ? '获取中...' : '获取下一页' }}
        </el-button>
      </li>
      <li v-else>
        <el-button :disabled="postsState.isFetchingNextPage" :loading="postsState.isRefetching"
                   @click="postsState.refetch()">
          {{ postsState.isRefetching ? '更新中...' : '更新页面' }}
        </el-button>
      </li>
    </ul>
  </div>
</template>

```


```vue
<script>
//  Post.vue 页面, props id存在是编辑场景，不存在新增场景
import { createMutation, createQuery, useQuery } from 'zan-vue-query'

const [postsMixin, getPostData] = createQuery({
  queryKey: function() {
    console.log('queryKey', this);
    return ['post', this.id];
  },
  queryFn: ({ queryKey }) => {
    const id = queryKey[1];
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(
      (response) => response.json(),
    );

  },
  enabled: function() {
    console.log('this.id', this.id);
    return this.id !== undefined;
  }
});
const [addPostMixin, getAddPostState] = createMutation({
  mutationFn: (data) => {
    return fetch(`https://jsonplaceholder.typicode.com/posts`, {
      body: JSON.stringify(data),
      method: 'POST',
    }).then(
      (response) => response.json(),
    );
  },
  onSuccess(){
    this.$emit('back');
  },
  onSettled(){
    return this.$queryClient.invalidateQueries({ queryKey: ['posts'] })
  }
});
const [editPostMixin, getEditPostState] = createMutation({
  mutationFn: (data) => {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${data.id}`, {
      body: JSON.stringify(data),
      method: 'PUT',
    }).then(
      (response) => response.json(),
    );
  },
  onSuccess(data, variables, context) {
    this.$emit('back');
  },
  onSettled(){
    return this.$queryClient.invalidateQueries({ queryKey: ['posts'] })
  }
});
export default {
  name: 'PostDetails',
  mixins: [postsMixin, addPostMixin, editPostMixin],
  data() {
    return {
      formData: {
        title: '',
        body: '',
        userId: undefined,
      }
    };
  },
  setup(props){
    useQuery({
      queryKey: ['post 2', props.id],
      queryFn: ({ queryKey }) => {
        const id = queryKey[1];
        return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(
          (response) => response.json(),
        );

      },
      enabled: props.id !== undefined
    })
  },
  props: {
    id: {
      type: Number,
    },
  },
  computed: {
    'postsData': getPostData,
    'addPostState': getAddPostState,
    'editPostState': getEditPostState,
  },
  methods: {
    addForm() {
      this.addPostState.mutate(this.formData);
    },
    editForm() {
      this.editPostState.mutate({ id: this.id, ...this.formData });
    }
  },
  watch: {
    'postsData.isSuccess': function(value) {
      if (value && this.postsData?.data) {
        this.formData = this.postsData.data;
      }
    }
  }
};
</script>

<template>
  <div v-loading="postsData.isLoading">
    <el-form ref="form">
      <el-form-item required label="userId">
        <el-input-number :disabled="!!id" v-model="formData.userId" />
      </el-form-item>
      <el-form-item required label="title">
        <el-input v-model="formData.title" />
      </el-form-item>
      <el-form-item required label="body">
        <el-input v-model="formData.body" />
      </el-form-item>
    </el-form>
    <el-button v-if="!id" @click="addForm" :loading="addPostState.isPending">创建</el-button>
    <el-button v-else @click="editForm" :loading="editPostState.isPending">编辑</el-button>
  </div>
</template>
```
