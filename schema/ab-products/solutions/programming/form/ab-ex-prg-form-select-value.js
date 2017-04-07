
/**
 * Example form controller class. 
 * Handles lifecycle events (such as afterViewLoaded) and user actions (such as Save). 
 */
var formController = View.createController('simpleForm', {
    
    /**
     * This function is called then the view is loaded.
     */
    afterViewLoad: function() {
        // force new record mode, so that the form does not load existing record
        this.prgFormSelectValue_employeeForm.newRecord = true;
    },
    
    /**
     * Saves the form record.
     */
    prgFormSelectValue_employeeForm_onSave: function() {
        this.prgFormSelectValue_employeeForm.save();
    },
    
    /**
     * Handles Select Value button for the Employee Standard field.
     */
    prgFormSelectValue_employeeForm_onSelectEmployeeStandard: function() {
        var controller = this;
        View.openDialog('ab-ex-prg-form-select-value-add.axvw', null, false, {
            callback: function(record) {
                var value = record.getValue('emstd.em_std');
                controller.prgFormSelectValue_employeeForm.setFieldValue('em.em_std', value);
            }
        });
    }
});