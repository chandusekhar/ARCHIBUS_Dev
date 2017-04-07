
// --------------------------- FHBM console functions --------------------------------------



/**
 * Prepares custom console restriction and applies it to the work request report.
 */
function fhbm_console_applyRestriction() {

	var form = View.getControl('', 'fhbm_console');
	
	var restriction = form.getFieldRestriction();

	
	var fhbmgrid = View.getControl('', 'fhbm_grid');
	//alert(grid.type + grid.parentElementId);
	fhbmgrid.refresh(restriction);


    fhbmgrid.show(true);

}



/**
 * Copies values entered as a search criteria to the edit form when new record is edited.
 */
function fhbm_copy_console_values() {
    var fhbmConsole = View.panels.get('fhbm_console');
    var fhbmForm = View.panels.get('fhbm_form');

	var fhbmBL = fhbmConsole.getFieldValue('fhbm.bl_id');
	var fhbmFL = fhbmConsole.getFieldValue('fhbm.fl_id');
	var fhbmFL = fhbmConsole.getFieldValue('fhbm.rm_id');

    if (fhbmBL != '') {
         fhbmForm.setFieldValue('fhbm.bl_id', fhbmBL );
    }
    if (fhbmFL != '') {
         fhbmForm.setFieldValue('fhbm.fl_id', fhbmFL );
    }
    if (fhbmRM != '') {
         fhbmForm.setFieldValue('fhbm.rm_id', fhbmRM );
    }
}

