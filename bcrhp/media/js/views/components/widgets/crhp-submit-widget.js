import arches from 'arches';
import ko from 'knockout';
import koMapping from 'knockout-mapping';
import _ from 'underscore';
import WidgetViewModel from 'viewmodels/widget';
import moment from 'moment';
import datePickerWidgetTemplate from 'templates/views/components/widgets/crhp-submit-widget.htm';

const CrhpSubmitWidget = function (params) {
    var self = this;
    params.configKeys = [
        'minDate',
        'maxDate',
        'viewMode',
        'dateFormat',
        'defaultValue',
    ];

    WidgetViewModel.apply(this, [params]);

    if (self.node.config && ko.unwrap(self.node.config.dateFormat)) {
        this.dateFormat(ko.unwrap(self.node.config.dateFormat));
    }
    if (!ko.unwrap(this.dateFormat)) {
        this.dateFormat = ko.observable(self.node.datatypeLookup.date.config);
    }

    this.placeholder = this.config().placeholder;
    this.viewModeOptions = ko.observableArray([
        {
            id: 'days',
            name: 'Days',
        },
        {
            id: 'months',
            name: 'Months',
        },
        {
            id: 'years',
            name: 'Years',
        },
        {
            id: 'decades',
            name: 'Decades',
        },
    ]);

    this.onViewModeSelection = function (val, e) {
        this.viewMode(e.currentTarget.value);
    };

    this.on = this.config().on || 'Date of Data Entry';
    this.off = this.config().off || '';
    this.setvalue =
        this.config().setvalue ||
        function (self) {
            if (self.defaultValue() === self.on) {
                self.defaultValue(self.off);
            } else {
                self.defaultValue(self.on);
            }
        };

    this.setdefault =
        this.config().setdefault ||
        function (self) {
            if (self.defaultValue() === self.on) {
                self.defaultValue(self.off);
            } else {
                self.defaultValue(self.on);
            }
        };

    this.getdefault =
        this.config().getdefault ||
        ko.computed(function () {
            return this.defaultValue() == this.on;
        }, this);

    if (self.form && this.defaultValue() === 'Date of Data Entry') {
        if (this.value() === 'Date of Data Entry') {
            const today = new Date();
            self.value(today.toLocaleDateString('en-CA')); //"en-CA" formats the date in the desired format YYYY-MM-DD
            const tileData = JSON.parse(self.tile._tileData());
            tileData[this.node.id] = today.toLocaleDateString('en-CA');
            self.tile._tileData(koMapping.toJSON(tileData));
        }
    }

    this.disableSubmit = ko.computed(function () {
        return false;
    });

    this.disposables.push(this.getdefault);

    this.xmlDownloadPending = ko.observable(false);

    this.getCrhpXml = function () {
        if (!!self.tile.resourceinstance_id) {
            window.open(
                `${arches.urls.root}crhp_export/${self.tile.resourceinstance_id}`,
                '_blank',
            );
        }
    };
};

export default ko.components.register('crhp-submit-widget', {
    viewModel: CrhpSubmitWidget,
    template: datePickerWidgetTemplate,
});
