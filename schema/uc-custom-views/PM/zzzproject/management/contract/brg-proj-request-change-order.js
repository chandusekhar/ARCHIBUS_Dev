function beforeSaveForm()
{	
	var form = AFM.view.View.getControl('detailsFrame', 'detailsPanel'); 
	var curDate = new Date();
	var date_planned_for = getDateObject(form.getFieldValue('activity_log.date_planned_for'));//note that getFieldValue returns date in ISO format
	if ((curDate - date_planned_for)/(1000*60*60*24) >= 1){
    	if (!confirm(getMessage('dateBeforeCurrent'))) return false;
	}
	$('activity_log.created_by').value = $('user_name').value;
	$('activity_log.status').value = "REQUESTED";
	$('activity_log.requestor_type').value = "Vendor";
	$('activity_log.activity_type').value = "PROJECT - CHANGE ORDER";
    return true;
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}




