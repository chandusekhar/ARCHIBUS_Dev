/**
 * Creates example Grid component.
 */
function createGrid() {
	// create column definitions
	var columns = [
	    new AFM.grid.Column('rm.checked', '', 'checkbox', onCheck),
	    new AFM.grid.Column('rm.selected', '', 'radiobutton', onSelect),
	    new AFM.grid.Column('rm.bl_id', 'Building ID', 'text'),
	    new AFM.grid.Column('rm.fl_id', 'Floor ID', 'text'),
	    new AFM.grid.Column('rm.rm_id', 'Room ID', 'text'),
	    new AFM.grid.Column('rm.area', 'Area', 'number'),
        new AFM.grid.Column('rm.editable', '', 'image', onClick),
	    new AFM.grid.Column('rm.editable', '', 'button', onClick)];
    columns[6].imageName = '..\\..\\graphics\\ab-icon-task-edit.gif';    
    columns[6].text = 'Show Room ID';
    columns[7].text = 'Show Room ID';    
	
	// create test data objects to be displayed as grid rows
	var rows = [
	    {'rm.bl_id':'HQ', 'rm.fl_id':'18', 'rm.rm_id':'101', 'rm.area':55.0, 'rm.editable':false, 'rm.checked':true, 'rm.selected':false},
	    {'rm.bl_id':'HQ', 'rm.fl_id':'18', 'rm.rm_id':'102', 'rm.area':40.0, 'rm.editable':true, 'rm.checked':true, 'rm.selected':true},
	    {'rm.bl_id':'HQ', 'rm.fl_id':'18', 'rm.rm_id':'103', 'rm.area':15.0, 'rm.editable':true, 'rm.checked':false, 'rm.selected':false}];
	
	var configObj = new AFM.view.ConfigObject();
	configObj['rows'] = rows;
	configObj['columns'] = columns;

	// create new Grid component instance
	var grid_simple = new AFM.grid.Grid('grid-simple', configObj);
	grid_simple.build();
	
	// create another Grid instance based on the same columns and rows, which displays filter and index rows
	var indices = [
		{'value':'000', 'count': 4, 'restriction':"rm.rm_id LIKE '0__'"},
		{'value':'100', 'count': 4, 'restriction':"rm.rm_id LIKE '1__'"},
		{'value':'200', 'count': 4, 'restriction':"rm.rm_id LIKE '2__'"},
		{'value':'300', 'count': 4, 'restriction':"rm.rm_id LIKE '3__'"},
		{'value':'400', 'count': 4, 'restriction':"rm.rm_id LIKE '4__'"},
		{'value':'500', 'count': 4, 'restriction':"rm.rm_id LIKE '5__'"},
		{'value':'600', 'count': 4, 'restriction':"rm.rm_id LIKE '6__'"},
		{'value':'700', 'count': 4, 'restriction':"rm.rm_id LIKE '7__'"},
		{'value':'800', 'count': 4, 'restriction':"rm.rm_id LIKE '8__'"},
		{'value':'900', 'count': 4, 'restriction':"rm.rm_id LIKE '9__'"},
		{'value':'1000', 'count': 4, 'restriction':"rm.rm_id LIKE '10__'"},
		{'value':'1100', 'count': 4, 'restriction':"rm.rm_id LIKE '11__'"},
		{'value':'1200', 'count': 4, 'restriction':"rm.rm_id LIKE '12__'"},
		{'value':'1300', 'count': 4, 'restriction':"rm.rm_id LIKE '12__'"},
		{'value':'1400', 'count': 4, 'restriction':"rm.rm_id LIKE '12__'"},
		{'value':'1500', 'count': 4, 'restriction':"rm.rm_id LIKE '12__'"},
		{'value':'1600', 'count': 4, 'restriction':"rm.rm_id LIKE '12__'"},
		{'value':'1700', 'count': 4, 'restriction':"rm.rm_id LIKE '12__'"},
		{'value':'1800', 'count': 4, 'restriction':"rm.rm_id LIKE '12__'"},
		{'value':'1900', 'count': 4, 'restriction':"rm.rm_id LIKE '12__'"},
		{'value':'All', 'count': 4, 'restriction':""}];
	//var grid_complex = new AFM.grid.MiniConsole('grid-complex', rows, columns);

	configObj = new AFM.view.ConfigObject();
	configObj['groupIndex'] = 0;
	configObj['viewDef'] = '';

	// construct the grid without a viewDef
	var grid_complex = new AFM.grid.ReportGrid('grid-complex', configObj);
	grid_complex.addColumns(columns);
	grid_complex.addRows(rows);

//	grid_complex.enableIndex(true, indices);
//	grid_complex.enableFilter(true);
//	grid_complex.enableSort(true, 4);
//    grid_complex.selectedColumn = 2;
	grid_complex.build();
	
	// create two-tier grid
	var columns2 = [
	    new AFM.grid.Column('', 'One', 'text', null, null, 4),
	    new AFM.grid.Column('', 'Two', 'text', null, null, 4),
	    new AFM.grid.Column('', 'Three', 'text', null, null, 4)];
	var rows2 = [{}];
	configObj = new AFM.view.ConfigObject();
	configObj['rows'] = rows2;
	configObj['columns'] = columns2;

	var grid_2column = new AFM.grid.Grid('grid-2column', configObj);
	for (var i = 0; i < 12; i++) {
	    grid_2column.addColumn(new AFM.grid.Column('', '' + i, 'text', null, null, 1, "25px"), 2);
	}
	grid_2column.build(); 
}

/**
 * This function is invoked when the user clicks on the checkbox.
 */
function onCheck(e, row, column) {
	alert('Room ID: ' + row['rm.rm_id'] + ', checkbox = ' + e.target.checked);
}

/**
 * This function is invoked when the user clicks on the radio button.
 */
function onSelect(e, row, column) {
	alert('Room ID: ' + row['rm.rm_id'] + ', radio button = ' + e.target.checked);
}

/**
 * This function is invoked when the user clicks on the Edit button.
 */
function onClick(e, row, column) {
	alert('Room ID: ' + row['rm.rm_id']);
}
