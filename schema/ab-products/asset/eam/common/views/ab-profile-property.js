var abProfilePropCtrl = View.createController('abProfilePropCtrl', {
    queryParameterNames: ['pr_id'],
    queryParameters: null,
    isDemoMode: false,
    afterInitialDataFetch: function () {
        this.isDemoMode = isInDemoMode();
        this.queryParameters = readQueryParameters(this.queryParameterNames);
        var restriction = null;
        // check for existing query parameters
        if (valueExists(this.queryParameters) && !_.isEmpty(this.queryParameters)) {
            restriction = new Ab.view.Restriction({'property.pr_id': this.queryParameters['pr_id']});
        } else if (valueExists(this.view.restriction)) {
            restriction = this.view.restriction;
        }
        this.abProfileProperty_form.refresh(restriction);
    },
    /**
     * Set property image.
     */
    abProfileProperty_form_afterRefresh: function () {
        if (valueExistsNotEmpty(this.abProfileProperty_form.getFieldValue('property.prop_photo'))) {
            this.abProfileProperty_form.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
        } else {
            this.abProfileProperty_form.fields.get(this.abProfileProperty_form.fields.indexOfKey('image_field')).dom.src = null;
            this.abProfileProperty_form.fields.get(this.abProfileProperty_form.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
        }
    }
})