import { createRouter, createWebHistory } from 'vue-router'
import MyTasks from '../views/MyTasks.vue'
import RentalTasks from '../views/RentalTasks.vue'
import DeliveryTaskDetail from '../views/DeliveryTaskDetail.vue'

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
  },
  {
    path: '/rental-tasks/delivery/:id',
    name: 'DeliveryTaskDetail',
    component: DeliveryTaskDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
