import { createRouter, createWebHistory } from 'vue-router'
import MyTasks from '../views/MyTasks.vue'
import RentalTasks from '../views/RentalTasks.vue'
import DeliveryTaskDetail from '../views/DeliveryTaskDetail.vue'
import AcceptanceTaskDetail from '../views/AcceptanceTaskDetail.vue'
import RentalTaskDetail from '../views/RentalTaskDetail.vue'

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
  },
  {
    path: '/rental-tasks/acceptance/:id',
    name: 'AcceptanceTaskDetail',
    component: AcceptanceTaskDetail
  },
  {
    path: '/rental-tasks/detail/:id',
    name: 'RentalTaskDetail',
    component: RentalTaskDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
