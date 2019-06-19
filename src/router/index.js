import Vue from 'vue'
import VueRouter from 'vue-router'

import Layout from '../views/layout/Layout.vue'
import Index from '../views/index'
import SignIn from '../views/login/SignIn.vue'
import SignUp from '../views/login/SignUp.vue'
import Activate from '../views/login/Activate'
import CreateProject from '../views/project/CreateProject'
import HelloWorld from '../components/HelloWorld.vue'
import RepositoryTreeView from "../views/repository/TreeView.vue"
import RepositoryBlobView from "../views/repository/BlobView.vue"
import Homepage from "../views/homepage"

Vue.use(VueRouter)

export const routes = [
    {
        path: "/",
        component: Layout,
        children: [
            {
                path: "",
                component: Index
            },
            {
                path: "sign-in",
                component: SignIn,
            },
            {
                path: "sign-up",
                component: SignUp
            },
            {
                path: "activate",
                component: Activate
            },
            {
                path: "/create",
                component: CreateProject,
                meta: { login: true }
            },
            {
                path: "/:user",
                component: Homepage
            },
            {
                path: "/:user/:repo+/tree/:commit/:path*",
                component: RepositoryTreeView,
                meta: { tree: true }
            },
            {
                path: "/:user/:repo+/blob/:commit/:path+",
                component: RepositoryBlobView
            }
        ]
    },
    {
        path: "/foo",
        component: HelloWorld
    }
]

export default new VueRouter({
    mode: "history",
    routes
})