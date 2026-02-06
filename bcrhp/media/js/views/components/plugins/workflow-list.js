define([
    'knockout',
    'arches',
    'templates/views/components/plugins/workflow-list.htm',
], function (ko, arches, defaultInitWorkflowTemplate) {
    var InitWorkflow = function (params) {
        this.workflows = params.workflows.map(function (wf) {
            wf.url = arches.urls.plugin(wf.slug);
            return wf;
        }, this);
    };

    return ko.components.register('workflow-list', {
        viewModel: InitWorkflow,
        template: defaultInitWorkflowTemplate,
    });
});
