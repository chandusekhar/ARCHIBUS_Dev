var craftpersonSelectController = View.createController('craftpersonSelectController', {
    afterInitialDataFetch: function() {
        var openerView = View.getOpenerView();
        var basicPanel = View.panels.get('cfBasicGrid');
        var coursePanel = View.panels.get('cfCourseGrid');
        
        if(basicPanel)
            basicPanel.refresh(openerView.parameters.fleetRestriction);
        
        if(coursePanel)
            coursePanel.refresh(openerView.parameters.fleetRestriction);
    }
});

function filterCraftpersons(shouldClear) {
    var courseCode = null;
    
    if(shouldClear) {
        craftpersonSelectController.cfCourseConsole.clear();
    } else {
        courseCode = craftpersonSelectController.cfCourseConsole.getFieldValue('UC_courses.course_id');
    }
    
    if(courseCode == null || courseCode == "") courseCode = '%';
    
    craftpersonSelectController.cfCourseGrid.addParameter('courseCode', courseCode);
    craftpersonSelectController.cfCourseGrid.refresh();
}

function selectCourses() {
    View.selectValue({
        formId: 'cfCourseConsole',
        title: "Courses",
        fieldNames: ['UC_courses.course_id'],
        selectTableName: 'UC_courses',
        selectFieldNames: ['UC_courses.course_id'],
        visibleFieldNames: ['UC_courses.course_id','UC_courses.course_name']
    });
    craftpersonSelectController.cfCourseConsole.record.setValue('UC_courses.course_id',
        craftpersonSelectController.cfCourseConsole.getFieldValue('UC_courses.course_id'));
}

function selectCraftperson(row) {
    var craftperson = row['cf.cf_id'];
    
    var openerView = View.getOpenerView();
    var editPanelView = openerView.getOpenerView();
    var editLaborPanel = editPanelView.panels.get('wrcfEditPanel');
    
    editLaborPanel.setFieldValue('wrcf.cf_id', craftperson);
    openerView.closeThisDialog();
}