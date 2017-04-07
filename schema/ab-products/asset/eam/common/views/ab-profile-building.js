var abProfileBlCtrl = View.createController('abProfileBlCtrl', {
    queryParameterNames: ['bl_id'],
    queryParameters: null,
    isDemoMode: false,
    afterInitialDataFetch: function () {
        this.isDemoMode = isInDemoMode();
        this.queryParameters = readQueryParameters(this.queryParameterNames);
        var restriction = null;
        // check for existing query parameters
        if (valueExists(this.queryParameters) && !_.isEmpty(this.queryParameters)) {
            restriction = new Ab.view.Restriction({'bl.bl_id': this.queryParameters['bl_id']});
        } else if (valueExists(this.view.restriction)) {
            restriction = this.view.restriction;
        }
        this.abProfileBuilding_form.refresh(restriction);
    },
    /**
     * Set building image.
     */
    abProfileBuilding_form_afterRefresh: function () {
        if (valueExistsNotEmpty(this.abProfileBuilding_form.getFieldValue('bl.bldg_photo'))) {
            this.abProfileBuilding_form.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
        } else {
            this.abProfileBuilding_form.fields.get(this.abProfileBuilding_form.fields.indexOfKey('image_field')).dom.src = null;
            this.abProfileBuilding_form.fields.get(this.abProfileBuilding_form.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
        }
    }
});