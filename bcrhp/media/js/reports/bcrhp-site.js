import _ from 'underscore';
import ko from 'knockout';
import koMapping from 'knockout-mapping';
import MapReportViewModel from 'viewmodels/bcrhp-site';
import MapHeader from 'reports/map-header';
import defaultSiteTemplate from 'templates/views/report-templates/bcrhp_default.htm';
export default ko.components.register('bcrhp-site-report', {
    viewModel: MapReportViewModel,
    template: defaultSiteTemplate,
});
