<script lang="js">
import { createMutation, createQuery, useQuery } from '../src'

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
    const count = Number(localStorage.getItem('count') || '22');
    localStorage.setItem('count', count + 1);
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
  updated() {
    console.log('postsData', this.postsData);
    console.log('addPostState', this.addPostState);
    console.log('editPostState', this.editPostState);
  },
  watch: {
    'postsData.isSuccess': function(value) {
      console.log('watch postsData.isSuccess');
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

<style>
.root {
  display: flex;
}

.item {
  flex: 0 0 50%;
  border: 1px solid red;
}

</style>
