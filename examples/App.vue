<script lang="js">
import { defineComponent, ref } from '@vue/composition-api'

import Post from './Post.vue'
import Posts from './Posts.vue'

export default defineComponent({
  name: 'App',
  components: { Posts, Post },
  setup() {
    const postId = ref();
    const page = ref('list');
    return {
      postId,
      page,
      handleEdit(value) {
        postId.value = value;
        page.value = 'edit';
      }
    };
  }
});
</script>

<template>
  <el-tabs v-model="page">
    <el-tab-pane name="list" label="列表">
      <Posts  @edit="handleEdit" />
    </el-tab-pane>
    <el-tab-pane name="add" label="新增">
      <Post v-if="page === 'add'" @back="page = 'list'" />
    </el-tab-pane>
    <el-tab-pane name="edit" label="编辑">
      <Post v-if="page === 'edit'" :id="postId" @back="page = 'list'" />
    </el-tab-pane>
  </el-tabs>
</template>
