View.createController('spaceServedController', {
    callbackMethod: null,
    afterViewLoad: function () {
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)) {
            this.callbackMethod = this.view.parameters.callback;
        }
    },
    eqRmForm_onSave: function () {
        var hierarchy_delim = Ab.view.View.preferences.hierarchy_delim;
        var blId = this.eqRmForm.getFieldValue('eq_rm.bl_id');
        var flId = this.eqRmForm.getFieldValue('eq_rm.fl_id');
        var rmId = this.eqRmForm.getFieldValue('eq_rm.rm_id');
        var bl_fl_rm = blId;
        if (valueExistsNotEmpty(flId)) {
            bl_fl_rm += hierarchy_delim + flId;
        }
        if (valueExistsNotEmpty(rmId)) {
            bl_fl_rm += hierarchy_delim + rmId;
        }
        this.eqRmForm.setFieldValue('eq_rm.bl_fl_rm', bl_fl_rm);
        if (this.eqRmForm.save()) {
            if (valueExists(this.callbackMethod)) {
                this.callbackMethod();
            }
        }
    },
    eqRmForm_onDelete: function () {
    	if (this.eqRmForm.deleteRecord()) {
            if (valueExists(this.callbackMethod)) {
                this.callbackMethod();
            }
        }
    }
});