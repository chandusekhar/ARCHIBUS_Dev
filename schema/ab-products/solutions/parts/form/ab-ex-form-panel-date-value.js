
View.createController('ormPanelDateValue_controller',{

    formPanelDateValue_form_onRefreshJS: function() {
        var restriction = this.formPanelDateValue_form.getPrimaryKeyFieldValues(true);
        this.formPanelDateValue_form.refresh(restriction);
    }

});


