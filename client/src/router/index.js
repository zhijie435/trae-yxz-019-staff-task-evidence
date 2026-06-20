import { createRouter, createWebHistory } from 'vue-router'
import MyTasks from '../views/MyTasks.vue'
import RentalTasks from '../views/RentalTasks.vue'
import DeliveryTaskDetail from '../views/DeliveryTaskDetail.vue'
import AcceptanceTaskDetail from '../views/AcceptanceTaskDetail.vue'
import DepositRefundTaskDetail from '../views/DepositRefundTaskDetail.vue'
import RepairTaskDetail from '../views/RepairTaskDetail.vue'
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
    path: '/rental-tasks/deposit-refund/:id',
    name: 'DepositRefundTaskDetail',
    component: DepositRefundTaskDetail
  },
  {
    path: '/rental-tasks/repair/:id',
    name: 'RepairTaskDetail',
    component: RepairTaskDetail
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
