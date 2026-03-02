import ko from 'knockout';
import arches from 'arches';
import defaultInitWorkflowTemplate from 'templates/views/components/plugins/workflow-list.htm';

var InitWorkflow = function (params) {
    this.workflows = params.workflows.map(function (wf) {
        wf.url = arches.urls.plugin(wf.slug);
        return wf;
    }, this);
};

export default ko.components.register('workflow-list', {
    viewModel: InitWorkflow,
    template: defaultInitWorkflowTemplate,
});
