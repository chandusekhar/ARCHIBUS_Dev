
View.createController('miniconsoleCustomFilter', {

    /**
     * Sets the initial UI state.
     */
    afterViewLoad: function() {	

    	// set up filter for calculated fields "Location" and "Organization"
        this.employeeGrid.setFilterConfiguration({
            columns: {
                'em.location': {
                	fields: ['rm.bl_id', 'rm.fl_id', 'rm.rm_id'],
                	delimiter: '-',
                	placeholders: ['bl', 'fl', 'rm']
                },
                'em.organization': {
                	fields: ['em.dv_id', 'em.dp_id'],
                	delimiter: '-',
                	placeholders: ['dv', 'dp']
                }
            }
        });   
    },

    /**
     * Sets per-row values of composite fields after the grid is refreshed.
     */
    employeeGrid_afterRefresh: function() {
        this.employeeGrid.gridRows.each(function(row) {
            var location = '';
            if (row.getFieldValue('rm.rm_id')) {
                location = row.getFieldValue('rm.bl_id') + '-' + row.getFieldValue('rm.fl_id') + '-' + row.getFieldValue('rm.rm_id');
            }
            row.setFieldValue('em.location', location);

            var organization = '';
            if (row.getFieldValue('em.dp_id')) {
                organization = row.getFieldValue('em.dv_id') + '-' + row.getFieldValue('em.dp_id');
            }
            row.setFieldValue('em.organization', organization);
        });
    }
});


