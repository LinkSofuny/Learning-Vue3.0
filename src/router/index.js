import {
    createRouter,
    createWebHashHistory
} from 'vue-router'
import About from '../pages/About.vue'

const routes = [
    {
        path: '/',
        name: 'About',
        component: About
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router