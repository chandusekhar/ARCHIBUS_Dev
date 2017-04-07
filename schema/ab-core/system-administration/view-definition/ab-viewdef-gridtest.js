/**
 * Creates example Grid component.
 */
//  Globals holding grids

var grid_fields = new Object;


/* Invert the checked state of the row checkbox toggles in the 1st
 * column. */
function checkSel(){
    for (var i = 0; i < grid_fields.rows.length; i++) {
        if (grid_fields.getCellValue(i, 0)) 
            grid_fields.setCellValue(i, 0, false);
        else 
            grid_fields.setCellValue(i, 0, true);
    }
    
};

/* Alter the text in the 3rd column */

function showTex(){
    for (var i = 0; i < grid_fields.rows.length; i++) {
        if (grid_fields.getCellValue(i, 2) != "Building Code") 
            grid_fields.setCellValue(i, 2, "Yo Code");
    }
};


/* Create the grid. */

function createFieldsGrid(){

    //  ?? Must localize column names
    var columns = [new AFM.grid.Column('afm_flds.checked', '', 'checkbox', onCheck), new AFM.grid.Column('afm_flds.field_name', 'Field Name', 'text'), new AFM.grid.Column('afm_flds.ml_heading', 'Heading', 'text'), new AFM.grid.Column('afm_flds.data_type', 'Data Type', 'text'), new AFM.grid.Column('afm_flds.primary_key', 'Primary Key', 'text'), new AFM.grid.Column('afm_flds.moveup', '', 'button', onMoveRowUpButton), new AFM.grid.Column('afm_flds.movedn', '', 'button', onMoveRowDownButton), new AFM.grid.Column('afm_flds.remove', '', 'button', onRowRemoveButton), new AFM.grid.Column('afm_flds.spacer', '', '', 'text')];
    columns[5].text = 'Up';
    columns[6].text = 'Dn';
    columns[7].text = 'Remove';
    
    
    var rows = [{
        'afm_flds.field_name': 'bl',
        'afm_flds.ml_heading': 'Building Code',
        'afm_flds.data_type': 'Char',
        'afm_flds.primary_key': 1
    }];
    
    var row1 = new Object();
    row1['afm_flds.field_name'] = 'fl';
    row1['afm_flds.ml_heading'] = 'Floor Code';
    row1['afm_flds.data_type'] = 'Char';
    row1['afm_flds.primary_key'] = 2;
    
    var row2 = new Object();
    row2['afm_flds.field_name'] = 'area';
    row2['afm_flds.ml_heading'] = 'Floor Area';
    row2['afm_flds.data_type'] = 'Numeric';
    row2['afm_flds.primary_key'] = 35000.05;
    
    // create new Grid component instance
    grid_fields = new AFM.grid.ViewDefGrid('grid-fields', rows, columns);
    
    grid_fields.addRow(row1);
    grid_fields.addRow(row2);
    
    grid_fields.build();
};


/* Implement up, down, and remove buttons. */

function onMoveRowUpButton(e, row, column){
    grid_fields.moveRowUp(row.index);
}

function onMoveRowDownButton(e, row, column){
    grid_fields.moveRowDown(row.index);
}

function onRowRemoveButton(e, row, column){
    grid_fields.removeRowAndRebuild(row.index);
}


/*
 * Called when the user
 * e is the DOM cell element that has the listener
 * row is the current row being clicked
 * column is unused
 */
function onCheck(e, row, column){
    //  e.target.checked works only on Firefox to get the current checked
    //  state of the control.
    alert('Field Name: ' + row['afm_flds.field_name']);
}



