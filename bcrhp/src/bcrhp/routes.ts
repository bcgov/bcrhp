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
    {
        path: arches.urls.plugin('workflow-list/submissions/edit-site/:id'),
        name: 'editSite',
        component: () => import('@/bcrhp/pages/NewSite/NewSite.vue'),
        meta: {
            shouldShowNavigation: true,
            requiresAuthentication: !dev_mode,
        },
    },
];

type BCRHPRouteNamesType = RouteNamesType & {
    newSite: string;
    updateSite: string;
    editSite: string;
};

const routeNames: BCRHPRouteNamesType = {
    home: 'root',
    login: 'login',
    newSite: 'newSite',
    updateSite: 'updateSite',
    editSite: 'editSite',
    // search: "search",
    // advancedSearch: "advanced-search",
    // schemes: "schemes",
    // concept: "concept",
    // scheme: "scheme",
};
export { routes, routeNames };
export type { BCRHPRouteNamesType };
