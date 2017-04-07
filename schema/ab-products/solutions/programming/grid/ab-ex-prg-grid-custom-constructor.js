
var gridExampleController = View.createController('gridExample', {

    /**
     * Calls WFR to get data records for the grid.
     */
    afterViewLoad: function() {
        var parameters = {
            tableName: 'project',
            fieldNames: toJSON(['project.project_id','project.project_type','project.status','project.date_commence_work','project.date_target_end'])
        };
        try {
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            var rows = result.data.records;
            
            var columns = [
                new Ab.grid.Column('project.project_id', getMessage('project'), 'text'),
                new Ab.grid.Column('project.project_type', getMessage('project_type'), 'text'),
                new Ab.grid.Column('project.status', getMessage('project_status'), 'text'),
                new Ab.grid.Column('project.date_commence_work', getMessage('scheduled_start_date'), 'date'),
                new Ab.grid.Column('project.date_target_end', getMessage('scheduled_end_date'), 'date'),
                new Ab.grid.Column('project.show_details', '', 'button', this.showProjectDetails.createDelegate(this))];
            columns[5].text = getMessage('details');
            
            var configObj = new Ab.view.ConfigObject();
            configObj['rows'] = rows;
            configObj['columns'] = columns;
    
            // create new Grid component instance   
            var grid = new Ab.grid.Grid('prgGridCustomConstructor_projectReport', configObj);
            grid.build();
            
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * This function is invoked when the user clicks on the Details button.
     */
    showProjectDetails: function(row) {
        View.showMessage('Project ID: ' + row['project.project_id']);
    }
});

