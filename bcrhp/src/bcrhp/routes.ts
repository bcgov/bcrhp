import arches from 'arches';
import type { RouteNamesType } from '@/bcgov_arches_common/routes.ts';
const dev_mode = true;
const routes = [
    {
        path: arches.urls.plugin('workflow-list'),
        name: 'root',
        component: () => import('@/bcrhp/pages/Submissions.vue'),
        meta: {
            shouldShowNavigation: true,
            requiresAuthentication: !dev_mode,
        },
    },
    {
        path: arches.urls.plugin('workflow-list/submissions/new-site/'),
        name: 'newSite',
        component: () => import('@/bcrhp/pages/NewSite/NewSite.vue'),
        meta: {
            shouldShowNavigation: true,
            requiresAuthentication: !dev_mode,
        },
    },
    {
        path: arches.urls.plugin('workflow-list/submissions/update-site/'),
        name: 'updateSite',
        component: () => import('@/bcrhp/pages/UpdateSite.vue'),
        meta: {
            shouldShowNavigation: true,
            requiresAuthentication: !dev_mode,
        },
    },
    // {
    //     path: "/bcrhp/ipa_submit/",
    //     name: "ipaSubmit",
    //     component: () => import("@/bcrhp/pages/ipa/IpaSubmit.vue"),
    //     meta: {
    //         shouldShowNavigation: true,
    //         requiresAuthentication: true,
    //     },
    // },
    // {
    //     path: "/login/:next?",
    //     name: "login",
    //     component: () => import("@/bcrhp/pages/LoginPage.vue"),
    //     meta: {
    //         shouldShowNavigation: false,
    //         requiresAuthentication: false,
    //     },
    // },
    // {
    //     path: "/advanced-search",
    //     name: "advanced-search",
    //     component: () => import("@/bcrhp/pages/AdvancedSearch.vue"),
    //     meta: {
    //         shouldShowNavigation: true,
    //         requiresAuthentication: true,
    //     },
    // },
    // {
    //     path: "/schemes",
    //     name: "schemes",
    //     component: () => import("@/bcrhp/pages/SchemeList.vue"),
    //     meta: {
    //         shouldShowNavigation: true,
    //         requiresAuthentication: true,
    //     },
    // },
    // {
    //     path: "/concept/:id",
    //     name: "concept",
    //     component: () =>
    //         import("@/bcrhp/pages/ConceptOrSchemeSplitter.vue"),
    //     meta: {
    //         shouldShowNavigation: true,
    //         requiresAuthentication: true,
    //     },
    // },
    // {
    //     path: "/scheme/:id",
    //     name: "scheme",
    //     component: () =>
    //         import("@/bcrhp/pages/ConceptOrSchemeSplitter.vue"),
    //     meta: {
    //         shouldShowNavigation: true,
    //         requiresAuthentication: true,
    //     },
    // },
];

type BCRHPRouteNamesType = RouteNamesType & {
    newSite: string;
    updateSite: string;
};

const routeNames: BCRHPRouteNamesType = {
    home: 'root',
    login: 'login',
    newSite: 'newSite',
    updateSite: 'updateSite',
    // search: "search",
    // advancedSearch: "advanced-search",
    // schemes: "schemes",
    // concept: "concept",
    // scheme: "scheme",
};
export { routes, routeNames };
export type { BCRHPRouteNamesType };
