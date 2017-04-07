// *****************************************************************************
// on save, refresh the schedule list
// *****************************************************************************
function saveRemoveEmployee()
{
	// refresh Grid (done here so we can pass in the restriction)
	View.getControl('', 'pms_grid').refresh();
}
