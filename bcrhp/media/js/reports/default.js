import _ from 'underscore';
import ko from 'knockout';
import ReportViewModel from 'viewmodels/bcrhp-site';
import defaultTemplate from 'templates/views/report-templates/bcrhp_default.htm';

const viewModel = function (params) {
    params.configKeys = [];
    ReportViewModel.apply(this, [params]);
};

export default ko.components.register('default-report', {
    viewModel: viewModel,
    template: defaultTemplate,
});
