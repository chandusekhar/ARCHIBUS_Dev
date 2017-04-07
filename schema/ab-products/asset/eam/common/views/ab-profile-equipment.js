var abProfileEquipmentCtrl = View.createController('abProfileEquipmentCtrl', {
    queryParameterNames: ['eq_id'],
    queryParameters: null,
    isDemoMode: false,
    afterInitialDataFetch: function () {
        this.isDemoMode = isInDemoMode();
        this.queryParameters = readQueryParameters(this.queryParameterNames);
        var restriction = null;
        // check for existing query parameters
        if (valueExists(this.queryParameters) && !_.isEmpty(this.queryParameters)) {
            restriction = new Ab.view.Restriction({'eq.eq_id': this.queryParameters['eq_id']});
        } else if (valueExists(this.view.restriction)) {
            restriction = this.view.restriction;
        }
        this.abProfileEquipment_form.refresh(restriction);
    },
    /**
     * Set equipment image.
     */
    abProfileEquipment_form_afterRefresh: function () {
        if (valueExistsNotEmpty(this.abProfileEquipment_form.getFieldValue('eqstd.doc_graphic'))) {
            this.abProfileEquipment_form.showImageDoc('image_field', 'eqstd.eq_std', 'eqstd.doc_graphic');
        } else {
            this.abProfileEquipment_form.fields.get(this.abProfileEquipment_form.fields.indexOfKey('image_field')).dom.src = null;
            this.abProfileEquipment_form.fields.get(this.abProfileEquipment_form.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
        }
    }
})