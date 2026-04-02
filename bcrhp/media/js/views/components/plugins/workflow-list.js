import createVueApplication from 'arches/arches/app/media/js/utils/create-vue-application';
import { createRouter, createWebHistory } from 'vue-router';
import BCRHPApp from '@/bcrhp/App.vue';
import { routes } from '@/bcrhp/routes.ts';
import { definePreset } from '@primeuix/themes';
import { ArchesPreset } from '@/arches/themes/default.ts';

import ko from 'knockout';
import defaultInitWorkflowTemplate from 'templates/views/components/plugins/workflow-list.htm';

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const BCGovPreset = definePreset(ArchesPreset, {
    options: {
        prefix: 'p',
        darkModeSelector: 'system',
        // cssLayer: false,
    },
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}',
        },
        colorScheme: {
            light: {
                color: '{gray.50}',
                formField: {
                    hoverBorderColor: '{primary.color}',
                },
            },
            dark: {
                formField: {
                    hoverBorderColor: '{primary.color}',
                },
            },
        },
    },
    components: {
        button: {
            paddingX: '.75rem;',
            paddingY: '0.1rem;',
        },
        card: {
            titleFontSize: '1.0rem',
        },
        fieldset: {
            colorScheme: {
                light: {
                    background: '{grey.50}',
                    legendBackground: '{grey.50}',
                },
                dark: {
                    background: '{grey.900}',
                    legendBackground: '{grey.900}',
                },
            },
        },
        inputtext: {
            paddingX: '0.2rem',
            paddingY: '0.2rem',
        },
        select: {
            paddingX: '0.2rem',
            paddingY: '0.2rem',
        },
        panel: {
            contentPadding: '1.0rem',
            colorScheme: {
                light: {
                    background: '{grey.50}',
                },
                dark: {
                    background: '#222',
                },
            },
        },
        stepper: {
            stepNumberSize: '2.8rem',
            stepNumberFontSize: '1.8rem',
            steppanel: {
                background: '{grey.50}',
            },
        },
    },
});

ko.components.register('workflow-list', {
    viewModel: function () {
        createVueApplication(BCRHPApp, {
            theme: {
                preset: BCGovPreset,
                options: {
                    darkModeSelector: 'system',
                    cssLayer: {
                        name: 'primevue',
                        order: 'theme, base, primevue',
                    },
                },
            },
        }).then((vueApp) => {
            vueApp.use(router);
            vueApp.mount('#bcrhp-mounting-point');
        });
    },
    template: defaultInitWorkflowTemplate,
});
