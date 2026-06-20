import { createRouter, createWebHistory } from 'vue-router'
import MyTasks from '../views/MyTasks.vue'
import RentalTasks from '../views/RentalTasks.vue'

const routes = [
  {
    path: '/',
    redirect: '/rental-tasks'
  },
  {
    path: '/tasks',
    name: 'MyTasks',
    component: MyTasks
  },
  {
    path: '/rental-tasks',
    name: 'RentalTasks',
    component: RentalTasks
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
