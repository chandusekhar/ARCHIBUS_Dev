/**
 * Called each time the exRmFindManage2PanelsSql_rmForm panel is refreshed, 
 * to get from WFR and display the list of rooms for selected building/floor.
 * @param {form} Ab.form.Form object for exRmFindManage2PanelsSql_rmForm panel.
 */
function exRmFindManage2PanelsSql_rmForm_afterRefresh(form) {
    // clear the rooms drop-down list
    var rmSelect = $('exRmFindManage2PanelsSql_rmSelect');
    rmSelect.innerHTML = '';
    
    // call WFR to get new room list for selected building/floor
    var parameters = {
        tableName: 'rm',
        fieldNames: toJSON(['rm.rm_id']),
        restriction: toJSON(form.restriction)
    };
    try {
        var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
        
        // populate the room drop-down list
        for (var i = 0; i < result.data.records.length; i++) {
            var record = result.data.records[i];
            var room_id = record['rm.rm_id'];
            
            var option = document.createElement('option');
            option.value = room_id;
            option.appendChild(document.createTextNode(room_id));
            rmSelect.appendChild(option);
        }
        
        // enable of disable the View Details button
        var hasRooms = (result.data.records.length > 0);
        $('exRmFindManage2PanelsSql_rmView').disabled = !hasRooms;
        $('exRmFindManage2PanelsSql_rmSelect').disabled = !hasRooms;
        
    } catch (e) {
        Workflow.handleError(e);
    }
}

/**
 * Called when the user selects the room in the drop-down list to view the room details.
 */
function exRmFindManage2PanelsSql_rmView_onclick() {
    // get selected room ID
    var rmSelect = $('exRmFindManage2PanelsSql_rmSelect');
    var rm_id = rmSelect.options[rmSelect.selectedIndex].value;
    
    // get current building and floor IDs
    var form = View.getControl('', 'exRmFindManage2PanelsSql_rmForm');
    var bl_id = form.getFieldValue('rm.bl_id');
    var fl_id = form.getFieldValue('rm.fl_id');
    
    // create a restriction and open the Room Details dialog
    var restriction = {
        'rm.bl_id':bl_id, 
        'rm.fl_id':fl_id, 
        'rm.rm_id':rm_id
    };
	
	var panel = View.panels.get('exRmFindManage2PanelsSql_roomDetails');
	panel.refresh(restriction);
	panel.showInWindow({
		width: 300,
		height: 400
	});
}