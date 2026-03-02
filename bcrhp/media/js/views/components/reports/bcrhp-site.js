import _ from 'underscore';
import ko from 'knockout';
import koMapping from 'knockout-mapping';
import MapReportViewModel from 'viewmodels/map-report';
import MapHeader from 'reports/map-header';
import defaultBchpSiteTemplate from 'templates/views/report-templates/bcrhp_default.htm';

export default ko.components.register('bcrhp-site-report', {
    viewModel: MapReportViewModel,
    template: defaultBchpSiteTemplate,
});
