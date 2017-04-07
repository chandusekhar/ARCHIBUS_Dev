/**
 * Export XLS, DOCX and PDF reports with two level table tree control.
 *
 */
var spaceExpressConsoleDepartments = View.createController('spaceExpressConsoleDepartments', {
    afterViewLoad: function() {
        this.departmentTree.createRestrictionForLevel = function(parentNode, level) {
            var restriction = null;
            if (level == 1) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('rm.dv_id', parentNode.data['rm.dv_id'], '=');
            }
            return restriction;
        },
        
        /////// handle virtual hatch pattern field by calling following methods ///////
        //tree API: setLegendTable(levelIndex as 0-indexing , tableName);
        this.departmentTree.setLegendTable(0, 'dv');
        this.departmentTree.setLegendTable(1, 'dp');
        //tree API: setLegendFields(levelIndex as 0-indexing, fieldFullNames as Array);
        this.departmentTree.setLegendFields(0, ['rm.dv_id']);
        this.departmentTree.setLegendFields(1, ['rm.dv_id', 'rm.dp_id']);
        
    },
    
    /**
     * XLS report.
     */
    exportDepartmentXLS: function(){
    	this.doCustomExportReport(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, 'xls');
    },
    /**
	 * DOCX.
	 */
	exportDepartmentDOCX: function(){
		this.doCustomExportReport(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, 'docx');
	},
	/**
	 * PDF.
	 */
	exportDepartmentPDF: function(){
		this.doCustomExportReport(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, 'pdf');
	},
    
    doCustomExportReport: function(workFlowName, outputType){
    	var parameters = {
                version: Ab.view.View.version
        	};
    	
    		if(outputType != 'xls'){
    			parameters.outputType = outputType;
    		}
        	 
        	//dataSources for two level table tree.
        	var firstLevelDataSourceId = 'divisionDS';
        	var secondLevelDataSourceId = 'departmentDS';

        	//set up top level by category properties: categoryDataSourceId and categoryFields
        	var dv_name_field = {id:'rm.dv_name',title: getMessage('dvTitle'), isNumeric:false};
        	if(outputType === 'xls'){
        		dv_name_field.title = getMessage('dvDpTitle');
        	}
        	parameters.categoryDataSourceId = firstLevelDataSourceId;
        	parameters.categoryFields = [this.getFieldDef(firstLevelDataSourceId, 'rm.dv_id'), 
        	                             dv_name_field, 
        	                             this.getFieldDef(firstLevelDataSourceId, 'rm.total_area'), 
        	                             this.getFieldDef(firstLevelDataSourceId, 'rm.total_count'),
        	                             this.getFieldDef(firstLevelDataSourceId, 'rm.dv_hpattern_acad')];
        	
        	//client-side restriction
        	var restriction = '';
        		
        	 //set up second level by its dataSource id and field defs
        	var jobId = Workflow.startJob(workFlowName, 
        			 						this.departmentTree._viewFile,  
        			 						secondLevelDataSourceId, 
        			 						this.departmentTree.title, 
        			 						this.getFieldDefs(secondLevelDataSourceId), 
        			 						restriction, 
        			 						parameters);
    		
        	 //get and open reported URL
        	 if(jobId != null){
        		var command = new Ab.command.exportPanel({});
        		 command.displayReport(jobId, outputType);
    		 }
    },
    
    /**
     * Gets field defs from specified dataSource
     */
	getFieldDefs: function(dataSourceId){
		var fieldDefs = [];
		var dataSource = View.dataSources.get(dataSourceId);
		dataSource.fieldDefs.each(function (fieldDef) {
			fieldDefs.push(fieldDef);
    	});
		return fieldDefs;
	},
	
	/**
	 * Gets field def from specified dataSource and field id
	 */
	getFieldDef: function(dataSourceId, fieldId){
		var fieldDefs = this.getFieldDefs(dataSourceId);
		for (var i = 0, field; field = fieldDefs[i]; i++) {
			if(field.id === fieldId){
				return field;
			}	
		}
		return {};
	}
	
});

