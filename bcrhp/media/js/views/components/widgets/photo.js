import $ from 'jquery';
import ko from 'knockout';
import _ from 'underscore';
import DropZone from 'dropzone';
import uuid from 'uuid';
import WidgetViewModel from 'viewmodels/widget';
import GalleryBinding from 'bindings/gallery';
import DropzoneBinding from 'bindings/dropzone';
import arches from 'arches';
import defaultPhotoTemplate from 'templates/views/components/widgets/photo.htm';
export default ko.components.register('photo-widget', {
    viewModel: function (params) {
        params.configKeys = ['acceptedFiles', 'maxFilesize'];
        var self = this;
        WidgetViewModel.apply(this, [params]);

        this.currentLanguage = arches.activeLanguage;

        this.imageTitle = ko.observable(params.imageTitle || '');
        this.imageDescription = ko.observable(params.imageDescription || null);

        this.uploadedFiles = ko.observableArray();
        this.unsupportedImageTypes = ['tif', 'tiff', 'vnd.adobe.photoshop'];

        if (Array.isArray(self.value())) {
            this.uploadedFiles(self.value());
        }

        this.fullSizeUrl = ko.observable('');
        this.fullSizeAlt = ko.observable('');
        this.fullSizeTitle = ko.observable('');
        this.overlayVisible = ko.observable(true);

        this.getImageTitle = function () {
            var title = ko.unwrap(self.imageTitle);
            if (!!title && !!title[self.currentLanguage]) {
                return title[self.currentLanguage].value();
            }
            return '';
        };

        this.getImageDescription = function () {
            return self.imageDescription && self.imageDescription['en']
                ? self.imageDescription['en']
                : '';
        };

        this.hoveredOverImage = ko.observable(false);

        this.toggleHoveredOverImage = function (val, event) {
            var res = event.target === event.toElement ? true : false;
            this.hoveredOverImage(res);
        };

        this.reportImages = ko.computed(function () {
            // return [];
            return self.uploadedFiles().filter(function (file) {
                var fileType = ko.unwrap(file.type);
                if (fileType) {
                    var ext = fileType.split('/').pop();
                    return (
                        fileType.indexOf('image') >= 0 &&
                        self.unsupportedImageTypes.indexOf(ext) <= 0
                    );
                }
                return false;
            });
        });

        this.getFileUrl = function (url) {
            url = ko.unwrap(url);
            var httpRegex = /^https?:\/\//;
            // test whether the url is external (starts with http(s), if it is just return it)
            if (
                httpRegex.test(url) ||
                url.startsWith(arches.urls.url_subpath)
            ) {
                return url;
            } else {
                return (arches.urls.url_subpath + url).replace('//', '/');
            }
        };

        this.showOverlay = function (shouldShow) {
            this.overlayVisible(shouldShow);
        };

        this.showPhoto = function (url, title) {
            console.log(`Need to show this image ${url}`);
            this.fullSizeUrl(this.getFileUrl(url));
            this.fullSizeTitle(title);
            this.overlayVisible(true);
        };
    },
    template: defaultPhotoTemplate,
});
