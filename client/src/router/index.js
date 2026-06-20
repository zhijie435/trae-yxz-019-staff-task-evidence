import { createRouter, createWebHistory } from 'vue-router'
import MyTasks from '../views/MyTasks.vue'

const routes = [
  {
    path: '/',
    redirect: '/tasks'
  },
  {
    path: '/tasks',
    name: 'MyTasks',
    component: MyTasks
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
