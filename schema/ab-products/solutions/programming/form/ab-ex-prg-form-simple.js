
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
        this.prgFormSimple_employeeForm.newRecord = true;
    },
    
    /**
     * Saves the form record.
     */
    prgFormSimple_employeeForm_onSave: function() {
        this.prgFormSimple_employeeForm.save();
    },
    
    /**
     * Demonstrates the Ab.data.Record.removeValue() method.
     */
    prgFormSimple_employeeForm_onRemove: function() {
        var record = this.prgFormSimple_employeeForm.getRecord();
        View.alert('Values in the form:<br/>' + record.toString(), function() {
            
            record.removeValue('em.em_std');
            View.alert('Values in the form after calling Ab.data.Record.removeValue():<br/>' + record.toString());
        });
    }
});