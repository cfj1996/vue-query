<script lang="js">
import { createInfiniteQuery, createMutation } from '../src'

const [delPostMixin, getDelPostState] = createMutation({
  mutationFn: ({ id }) => {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'DELETE',
    }).then(
      (response) => response.json(),
    );
  },
  onSettled() {
    const count = Number(localStorage.getItem('count') || '22');
    localStorage.setItem('count', count - 1);
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

<style scoped>

</style>
