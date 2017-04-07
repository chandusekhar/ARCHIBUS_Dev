/**
 * @author keven.xi
 */
var locEmpController = View.createController('locEmp', {

    afterInitialDataFetch: function(){
    	
        this.locateEmployee_cadPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        var obtThis = this;
        // overrides Grid.onChangeMultipleSelection to load a drawing with a room, not zoomed in
        this.locateEmployee_employees.addEventListener('onMultipleSelectionChange', function(row){
      
            var records = View.panels.get("locateEmployee_employees").getSelectedRows();
            if (row.row.isSelected()) {
                // Call the drawing control to highlight the selected room
				View.panels.get("locateEmployee_cadPanel").highlightAssets(null, row);
            }
            else {
                var isHighlight = locEmpController.hasTheRoomInSelectedRows(row, records);
                if (!isHighlight) {
                    if (locEmpController.isUnLoadDrawing(row, records)) {
                        locEmpController.locateEmployee_cadPanel.addDrawing(row, null);
                    }
                    else {
                        // Call the drawing control to un highlight the selected room
                        if (View.panels.get("locateEmployee_cadPanel").highlightAssets(null, row)) {
                            row.row.unselect();
                        }
                    }
                }
            }
            
            obtThis.showEmployeesDetails(records);
        })
    },
    
    showEmployeesDetails: function(records){
        var res = new Ab.view.Restriction();
        for (var i = 0; i < records.length; i++) {
            var empCode = records[i]["em.em_id"];
            res.addClause("em.em_id", empCode, '=', 'OR');
        }
        var empDetailsGrid = View.getControl('', 'empDetails');
        if (res.clauses.length > 0) 
            empDetailsGrid.refresh(res, null, false);
        else 
            empDetailsGrid.clear();
    },
    
    emFilterPanel_onShow: function(){
        var restriction = new Ab.view.Restriction();
        var empId = this.emFilterPanel.getFieldValue("em.em_id");
        if (empId) {
            restriction.addClause("em.em_id", empId + '%', "LIKE");
        }
        this.locateEmployee_employees.refresh(restriction);
        
        //clear the drawing in the drawing panel and rows in the employee details panel
        this.locateEmployee_cadPanel.clear();
        this.empDetails.clear();
        this.locateEmployee_employees.enableSelectAll(false);
        
        var records = this.locateEmployee_employees.rows.length;
        if(records==1){
        	View.panels.get("locateEmployee_cadPanel").highlightAssets(null, this.locateEmployee_employees.rows[0]);
        	this.showEmployeesDetails(this.locateEmployee_employees.rows);
        }
    },
    
    hasTheRoomInSelectedRows: function(row, records){
        for (var i = 0; i < records.length; i++) {
            var bl = records[i]["rm.bl_id"];
            var fl = records[i]["rm.fl_id"];
            var rm = records[i]["rm.rm_id"];
            var dwgName = records[i]["rm.dwgname"];
            if (row["rm.bl_id"] == bl && row["rm.fl_id"] == fl && row["rm.rm_id"] == rm && row["rm.dwgname"] == dwgName) {
                return true;
            }
        }
        return false;
    },
    isUnLoadDrawing: function(row, records){
        for (var i = 0; i < records.length; i++) {
            var bl = records[i]["rm.bl_id"];
            var fl = records[i]["rm.fl_id"];
            var dwgname = records[i]["rm.dwgname"];
            if (row["rm.bl_id"] == bl && row["rm.fl_id"] == fl && row["rm.dwgname"] == dwgname) {
                return false;
            }
        }
        return true;
    },
    
    emPhotoForm_afterRefresh: function(){
		var distinctPanel = View.panels.get('emPhotoForm');
		var em_photo = distinctPanel.getFieldValue('em.em_photo').toLowerCase();
		var em_id = distinctPanel.getFieldValue('em.em_id');
		if (valueExistsNotEmpty(em_photo)) {
			distinctPanel.showImageDoc('image_field', 'em.em_id', 'em.em_photo');
		}
		else {
			distinctPanel.fields.get('image_field').dom.src = null;
			distinctPanel.fields.get('image_field').dom.alt = getMessage('noImage');
		}
	}
})

function generateReport(){
	var grid = View.panels.get("locateEmployee_employees");
    var records = grid.getSelectedRows();
	if ( !records || records.length==0 ) {
		View.alert(getMessage('noEmSelected'));
		return;
	}

	var result = "";
    for (var j = 0; j < records.length; j++) {
        var row = records[j];
        result+="'"+row["em.em_id"]+"',"
    }    
    var filterPanel = View.panels.get("emFilterPanel");
    var restriction = "";
    if(result!=""){
    	result = result.substring(0,result.length-1);
        restriction += " em.em_id in (" + result + ")";
    }
	var parameters = {'existsBlflrm':' and '+restriction}; 
    View.openPaginatedReportDialog("ab-sp-loc-em-print.axvw", null , parameters);
}


