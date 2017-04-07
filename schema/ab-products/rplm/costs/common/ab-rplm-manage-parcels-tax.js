var parcelController = View.createController('parcelController', {
    afterViewLoad: function () {
        // bind custom listener of image button to refresh parcel form when any photo change happens
        this.parcelTaxFormPanel.addFieldEventListener('parcel.parcel_photo', Ab.form.Form.DOC_EVENT_CHECKIN, this.displayImage, this);
        this.parcelTaxFormPanel.addFieldEventListener('parcel.parcel_photo', Ab.form.Form.DOC_EVENT_CHECKIN_NEW_VERSION, this.displayImage, this);
        this.parcelTaxFormPanel.addFieldEventListener('parcel.parcel_photo', Ab.form.Form.DOC_EVENT_DELETE, this.removeImage, this);
    },
    /**
     * Apply console restrictions.
     */
    repTaxParcelFilterPanel_onShow: function () {
        var console = View.panels.get('repTaxParcelFilterPanel');
        var sqlFilter = "1 = 1";
        var ctry_id = console.getFieldValue('ctry.ctry_id');
        if (ctry_id) {
            sqlFilter += " AND property.ctry_id = '" + ctry_id + "'";
        }
        var state_id = console.getFieldValue('state.state_id');
        if (state_id) {
            sqlFilter += " AND property.state_id = '" + state_id + "'";
        }
        var county_id = console.getFieldValue('county.county_id');
        if (county_id) {
            sqlFilter += " AND property.county_id = '" + county_id + "'";
        }
        var city_id = console.getFieldValue('city.city_id');
        if (city_id) {
            sqlFilter += " AND property.city_id = '" + city_id + "'";
        }
        var pr_id = console.getFieldValue('property.pr_id');
        if (pr_id) {
            sqlFilter += " AND property.pr_id = '" + pr_id + "'";
        }
        var parcel_id = console.getFieldValue('parcel.parcel_id');
        if (parcel_id) {
            sqlFilter += " AND parcel.parcel_id = '" + parcel_id + "'";
        }

        var grid = View.panels.get('parcelTaxGridPanel');
        grid.refresh(sqlFilter);
    },
    /**
     * Display image field.
     * @param form
     */
    displayImage: function (form) {
        form.showImageDoc('image_field', ['parcel.pr_id', 'parcel.parcel_id'], 'parcel.parcel_photo');
    },
    /**
     * Remove image field.
     * @param form
     */
    removeImage: function (form) {
        var imageField = form.fields.get('image_field');
        imageField.dom.src = null;
        imageField.dom.alt = getMessage('noImage');
    },
    /**
     * Set form title.
     * @param form
     */
    parcelTaxFormPanel_afterRefresh: function (form) {
        var title = getMessage('newParcelPanelTitle');
        if (!form.newRecord) {
            var parcelName = form.record.getValue('parcel.name');
            title = String.format(getMessage('editParcelPanelTitle'), parcelName);
        }
        form.setTitle(title);
        if (valueExistsNotEmpty(form.getFieldValue('parcel.parcel_photo'))) {
            this.displayImage(form);
        }
    },
    /**
     * Event called on paginated report.
     */
    parcelTaxFormPanel_onPaginatedReport: function () {
        View.openPaginatedReportDialog('ab-rplm-manage-parcels-tax-rpt.axvw', {'dsParcelTaxGridPaginatedReport': this.parcelTaxFormPanel.restriction});
    }
});