var tabsFrame;

function user_form_onload(){
	$('convertNewView').style.display = (!isMiniWizard()) ? 'none' : '';
	tabsFrame = View.getView('parent').panels.get('tabsFrame');
	if (valueExists(tabsFrame)) {
		// called from the View Definition Wizard
	    tabsFrame.setTabEnabled('page6', false);
	} else {
		// called from Basic Rule Wizard 
		tabsFrame = View.getOpenerView().panels.get('wizardTabs');
		// hide Create New View File and Convert New View File buttons
		View.panels.get('afm_ptasks_report').actions.get(0).forceHidden(true);
		View.panels.get('afm_ptasks_report').actions.get(1).forceHidden(true);
	} 
	
    // add a name attribute to the empty gray cell of the grid. Used to keep track of the position of selected row 
    $('afm_ptasks_report').setAttribute('name', -1);
    


/*
3024674     
    // restrict the grid according to selected activity and process in the previous 'Save' tab
    var grid = Ab.view.View.getControl('', 'afm_ptasks_report');
	// grid.sortEnabled = false;
	grid.sortListening = false;
    var restriction = tabsFrame.publishRestriction;
    grid.refresh(restriction);
*/    
}

function showAdd(){
	$('afm_ptasks_report').setAttribute('name', -1);
	var grid = View.panels.get('afm_ptasks_report');
	if(grid){
    	if(grid.rows.length == 0){
        var row = new Object();
        //row['afm_ptasks.activity_id'] = tabsFrame.activity_id;
        //row['afm_ptasks.process_id'] = tabsFrame.process_id;
        grid.addGridRow(row, 0);
        grid.hasNoRecords = false;
        grid.update();
    	}
  }
}


/**
 * Called when the "Add New" button is clicked. Creats a new, highlighted row, allowing
 * user to add the newly created view as a task to the Process Navigator
 *
 * @param	None
 * @return	None
 *
 */
function addViewToPnav(){
    var data_row = this;
    var record = data_row.grid.getPrimaryKeysForRow(this);
    var activity_id = valueExists(tabsFrame.activity_id) ? tabsFrame.activity_id : record['afm_ptasks.activity_id'] ;
    var process_id = valueExists(tabsFrame.process_id) ? tabsFrame.process_id : record['afm_ptasks.process_id'];
    var task_id = record['afm_ptasks.task_id'];
    var cell_element = getCellElement(data_row.grid, data_row.index, 1);
    var table_obj = cell_element.parentNode.parentNode;
    //var selected_row = table_obj.rows[data_row.index]; 

    // delete previously selected row, if there is one
    var former_new_row_index = Number($('afm_ptasks_report').getAttribute('name'));
    if (former_new_row_index > -1) {
        table_obj.deleteRow(former_new_row_index);
    }
    
    var selected_row = table_obj.rows[data_row.index];    
    // create a new row with editable fields
    var new_row = table_obj.insertRow(data_row.index + 1);
    
    // create cells for new row, which will be empty but highlighted in salmon color
    for (i = 0; i < this.grid.getNumberOfColumns(); i++) {
        var new_cell = new_row.insertCell(i);
        new_cell.style.background = "#ff9999";
    }
    
    // fill in activity and process in new row    
    new_row.cells[1].innerHTML = activity_id;
    new_row.cells[2].innerHTML = process_id;
    
    // add an input field for enterring the name of the new task
    new_row.cells[3].innerHTML = '<input type="text" id="taskName" value="' + getMessage('taskName') + '" style="width:200" />';
    $('taskName').focus();
    $('taskName').select();
    
    // add a select box for selecting whether or not this new task is a hostlist item
    var myFavoritesOptions =  '<select id="hotlist" name="hotlist">';
    myFavoritesOptions += '<option style="display:';
    myFavoritesOptions += (isMiniWizard()) ? 'none' : '';
    myFavoritesOptions += '"'; 
    myFavoritesOptions += (isMiniWizard()) ? 'disabled="disabled"' : ''; 
    myFavoritesOptions += '>' + getMessage('no') + '</option>';
    myFavoritesOptions += '<option>' + getMessage('yes') + '</option></select>';
    new_row.cells[4].innerHTML = myFavoritesOptions;
    // insert default hotlist settings according to the selected position 
    var hotlist1 = selected_row.cells[4].innerHTML;
    if ((hotlist1 == "Yes") || isMiniWizard()) {
        $('hotlist').selectedIndex = 1;
    }
       
    // calculate and autofill in the new display order	
    var display_order = calculateDisplayOrder(table_obj, selected_row, data_row);
    new_row.cells[5].innerHTML = '<input type="text" id="display_order" value="' + display_order + '" style="width:50"/>';
    
    // create the Save button
    var save_button = document.createElement('input');
    save_button.setAttribute('id', 'Add');
    save_button.setAttribute('name', 'Add');
    save_button.setAttribute('value', getMessage('save'));
    save_button.setAttribute('type', 'button');
    
    // attach a click event handler to the Save button
    var parameters = [];
    parameters['index'] = data_row.index;
    parameters['activity'] = activity_id;
    parameters['process'] = process_id;
    YAHOO.util.Event.addListener(save_button, 'click', addEntry, parameters);
    
    // add the button to the row
    new_row.cells[5].appendChild(save_button);
    
    // update the position
    former_new_row_index = data_row.index + 1;
    $('afm_ptasks_report').setAttribute('name', former_new_row_index);
}

/**
 * Calculate and return display order for new row
 *
 * @param  	table_obj			Grid table object
 * @param	selected_row		Highlighted row
 * @param	data_row			Row above selected row
 * @return 	new_display_order	Display order
 *
 */
function calculateDisplayOrder(table_obj, selected_row, data_row){
    // get display order in the row above the selected row
    var display_order_above = selected_row.cells[5].innerHTML;
    display_order_above = Number(display_order_above.replace(/[,.\s\&\;\D]/gi, ""));
	
    // if at the end of the grid (ie. no rows below the selected row), simply take the display order above and add 100.	    
    if (data_row.index + 1 >= data_row.grid.rows.length) {
        var new_display_order = display_order_above + 100;
    }
    else {
		// if there is a row below the selected row, get its display order
		var display_order_below = table_obj.rows[data_row.index + 2].cells[5].innerHTML;
		display_order_below = Number(display_order_below.replace(/[,.\s\&\;\D]/gi, ""));
		
        // if the display order in the row above is greater than the row below, simply add 100 to above    
        if (display_order_above > display_order_below) {
            var new_display_order = display_order_above + 100;
        }
        else {        
            // otherwise, use the average of the display order above and the display order below
            var new_display_order = (display_order_above + Math.ceil((display_order_below - display_order_above) / 2));
        }
    }
    
    return new_display_order;
}

/**
 * Event handler method for the "Save" button.  Adds a new entry to the Process Navigator.
 *
 * @param  	e		event object
 * @param	obj		listener object used to store parameters
 * @return 	None
 *
 */
function addEntry(e, obj){
    var index = obj['index'];
    var activity = obj['activity'];
    var process = obj['process'];
    var hotlist = $('hotlist').selectedIndex;
    var taskName = $('taskName').value;
    var display_order = $('display_order').value;
    var pattern = tabsFrame.patternRestriction;

    // detect if task name already exists.  If so, warn the user.
    var grid = Ab.view.View.getControl(window, 'afm_ptasks_report');
    if (grid != null) {
        var data_rows = grid.getDataRows();
        for (var i = 0; i < data_rows.length; i++) {
            var data_row = data_rows[i];
            var task_name = data_row.cells[3].innerHTML;
            if (task_name.toUpperCase() == taskName.toUpperCase()) {
                var answer = confirm('"' + taskName + '" already exists.  Do you want to replace the existing entry?"');
                if (answer == false) {
                    return;
                } else {
                	// delete first, then update
                	var record = new Ab.data.Record({
                		'afm_ptasks.task_id': taskName,
                		'afm_ptasks.process_id': process,
                		'afm_ptasks.activity_id': activity
                	}, false);
                	
                	try{
                		var ds = grid.getDataSource(grid.dataSourceId);
                		ds.deleteRecord(record);
                	} catch(e){
                		View.showMessage('error', message, e.message, e.data);
                	}
                }
            }
        }
    }
    
	// add 'pagereports' folder to file name for paginated reports
	var task_file = tabsFrame.textFileName;
	if (valueExists(pattern) && pattern.match(/paginated/gi)){
		task_file = 'pagereports/' + tabsFrame.textFileName;
	}

    /*
    #3025450
    // create a new record with the selected row's data
    var record = {};
    record['afm_ptasks.task_id'] = taskName;
    record['afm_ptasks.process_id'] = process;
    record['afm_ptasks.activity_id'] = activity;
    record['afm_ptasks.display_order'] = display_order;
    record['afm_ptasks.is_hotlist'] = hotlist;
    record['afm_ptasks.task_type'] = 'WEB URL';
    record['afm_ptasks.icon_small'] = 'ab-icon-task.gif';
    record['afm_ptasks.task_file'] = task_file;
    if (hotlist == 1) {
        record['afm_ptasks.hot_user_name'] = View.user.name;
    }
        
        
    // call standard WFR to save task record    
    var parameters = {
        tableName: 'afm_ptasks',
        fields: toJSON(record)
    };
    
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
    if (result.code == 'executed') {
        $('afm_ptasks_report').setAttribute('name', '-1');
        grid.refresh();
    }
    else {
        alert(result.message);
    }
    */

    // if this is a My Favorites view, fill in the hot_user_name field with the current user name	    
    var hotlist_user_name = '';
    if (hotlist == 1) {
        // record['afm_ptasks.hot_user_name'] = View.user.name;
        hotlist_user_name = View.user.name;
    }
    
    var record = new Ab.data.Record({
    	'afm_ptasks.task_id': taskName,
    	'afm_ptasks.process_id': process,
    	'afm_ptasks.activity_id': activity,
    	'afm_ptasks.display_order': display_order,
    	'afm_ptasks.is_hotlist': hotlist, 
    	'afm_ptasks.task_type': 'WEB URL',
    	'afm_ptasks.icon_small': 'ab-icon-task.gif',
    	'afm_ptasks.task_file': task_file,	
    	'afm_ptasks.hot_user_name': hotlist_user_name											
    }, true);
		

    try{
    	var ds = grid.getDataSource(grid.dataSourceId);
    	ds.saveRecord(record);
    	$('afm_ptasks_report').setAttribute('name', '-1');
    	grid.refresh();
    } catch(e){
    	View.showMessage('error', message, e.message, e.data);
    }
}

