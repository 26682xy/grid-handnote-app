import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import NotebookListPage from '../pages/NotebookListPage.vue'
import NotebookViewPage from '../pages/NotebookViewPage.vue'

const routes = [
  { path:'/', name:'home', component: HomePage },
  { path:'/notebook-list', name:'notebookList', component: NotebookListPage },
  { path:'/notebook-view/:id', name:'notebookView', component: NotebookViewPage }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
