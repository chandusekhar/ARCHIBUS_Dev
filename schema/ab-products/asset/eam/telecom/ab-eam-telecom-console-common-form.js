View.createController('abEamTelConsTabs_common_form_controller', {
    assetType: null,
    locationParameters: null,
    callbackMethod: null,
    newRecord: null,

    afterViewLoad: function () {
        if (valueExists(View.parameters) && valueExists(View.parameters.assetType)) {
            this.assetType = View.parameters.assetType;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.locationParameters)) {
            this.locationParameters = View.parameters.locationParameters;
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
            this.callbackMethod = View.parameters.callback;
        }
        this.newRecord = View.newRecord;
    },

    abEamTelConsDetails_form_afterRefresh: function (form) {
        if (this.newRecord) {
            form.setFieldValue(this.assetType + ".bl_id", this.locationParameters.blId);
            form.setFieldValue(this.assetType + ".fl_id", this.locationParameters.flId);
            form.setFieldValue(this.assetType + ".rm_id", this.locationParameters.rmId);
            if (valueExists(form.fields.get(this.assetType + ".eq_std"))) {
                form.setFieldValue(this.assetType + ".eq_std", this.locationParameters.eqStd);
            }
        }
    },

    callCallbackMethod: function () {
        if (valueExists(this.callbackMethod)) {
            this.callbackMethod();
        }
    }
});

function callbackHandler() {
    View.controllers.get('abEamTelConsTabs_common_form_controller').callCallbackMethod();
}