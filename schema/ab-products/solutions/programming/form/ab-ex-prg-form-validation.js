
/**
 * Example form controller class that implements custom form validation. 
 * Handles lifecycle events (such as afterViewLoaded) and user actions (such as Save). 
 */
var formController = View.createController('formWithValidation', {
    
    /**
     * Validates values entered by the user.
     */
	prgFormValidation_projectForm_beforeSave: function() {
        var canSave = true;
        
        var project = this.prgFormValidation_projectForm.getRecord();
        
        // project_id must be filled in
        var projectId = project.getValue('project.project_id');
        if (projectId == '') {
            this.prgFormValidation_projectForm.fields.get('project.project_id').setInvalid(getMessage('errorProjectId'));
            canSave = false;
        }
        
        // date_start must not be before today's date
        var dateStart = project.getValue('project.date_start');
        if (valueExistsNotEmpty(dateStart)) {
	        if (DateMath.before(dateStart, new Date().add(Date.DAY, -1))) {
	            this.prgFormValidation_projectForm.fields.get('project.date_start').setInvalid(getMessage('errorDateStart'));
	            canSave = false;
	        }
        }
        
        // date_end must not be before date_start
        var dateEnd = project.getValue('project.date_end');
        if (valueExistsNotEmpty(dateEnd) && valueExistsNotEmpty(dateStart)) {
	        if (DateMath.before(dateEnd, dateStart)) {
	            this.prgFormValidation_projectForm.fields.get('project.date_end').setInvalid(getMessage('errorDateEnd'));
	            canSave = false;
	        }
        }

        // hours_est must be > 0
        var hoursEsimated = project.getValue('project.hours_est');
        if (hoursEsimated <= 0) {
            this.prgFormValidation_projectForm.fields.get('project.hours_est').setInvalid(getMessage('errorHoursEst'));
            canSave = false;
        }
        
        return canSave;
    }
});