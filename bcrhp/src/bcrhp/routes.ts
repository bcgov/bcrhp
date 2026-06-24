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
        path: arches.urls.plugin('workflow-list/submissions/new-site/new'),
        name: 'newSite',
        params: { editMode: 'create' },
        component: () => import('@/bcrhp/pages/NewSite/NewSite.vue'),
        meta: {
            shouldShowNavigation: true,
            requiresAuthentication: !dev_mode,
        },
    },
    {
        path: arches.urls.plugin('workflow-list/submissions/edit-site/'),
        name: 'updateSite',
        component: () => import('@/bcrhp/pages/NewSite/NewSite.vue'),
        params: { editMode: 'update' },
        meta: {
            shouldShowNavigation: true,
            requiresAuthentication: !dev_mode,
        },
    },
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
};
export { routes, routeNames };
export type { BCRHPRouteNamesType };
