function beforeSaveForm()
{
	var form = AFM.view.View.getControl('','edit_panel');
	var curDate = new Date();
	var date_start = getDateObject(form.getFieldValue('work_pkg_bids.date_contract_start'));//note that getFieldValue returns date in ISO format
	var date_end = getDateObject(form.getFieldValue('work_pkg_bids.date_contract_end'));
	if (date_end < date_start) {
		form.addInvalidField('work_pkg_bids.date_contract_end', getMessage('endBeforeStart'));
		return false;
	}
	if ((curDate - date_start)/(1000*60*60*24) >= 1){
		if (!confirm(getMessage('dateBeforeCurrent'))) return false;		
	}
	
	if (form.getFieldValue('work_pkg_bids.cost_contract') <= 0) {
		form.addInvalidField('work_pkg_bids.cost_contract', getMessage('costValidation'));
		return false
	}
	return true;
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}


function cancel() {
	var tabsFrameDetails = getFrameObject(parent,'tabsFrameDetails');
//	if (tabsFrameDetails == null) {tabsFrameDetails=getFrameObject(parent.parent, "tabsFrameDetails");}
//	if (tabsFrameDetails.findTab('page1') == null) {

	if (tabsFrameDetails == null) {
		parent.opener.AFM.view.View.closeDialog()
	}
	else if (tabsFrameDetails.document.getElementById('page1') == null) {
		parent.opener.AFM.view.View.closeDialog()
	}
	else {
		tabsFrameDetails.selectTab("page1",null,false,true)
	}
}

function user_form_onload()
{

	var tabsFrame = getFrameObject(parent,'tabsFrame');
	if (tabsFrame != null) {
		var east_panel = AFM.view.View.getControl('','edit_panel');
		east_panel.restriction = tabsFrame.restriction;
		east_panel.refresh();
		east_panel.show(true);
	}
}

