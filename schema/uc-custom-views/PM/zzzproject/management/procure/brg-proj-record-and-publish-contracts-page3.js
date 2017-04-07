function signContract()
{  
	var report = AFM.view.View.getControl('', 'edit_panel');
	
	var contractAmount = $('work_pkg_bids.cost_contract').value;
	if (parseFloat(contractAmount) <= 0) {
		alert('You must enter a positive value for "Amount - Contract" before it can be signed.');
		return false;
	}
	
	$('work_pkg_bids.status').value = 'Contract Signed';
}

function closeTab()
{
	var tabsFrameDetails = getFrameObject(parent,'tabsFrameDetails');
	if (tabsFrameDetails == null) {tabsFrameDetails=getFrameObject(parent, "tabsFrame");}
	tabsFrameDetails.setTabVisible('page2', false);
	tabsFrameDetails.setTabVisible('doc', false);
	tabsFrameDetails.setTabVisible('page3-sign', false);
	tabsFrameDetails.setTabVisible('page3-report', true);	
	tabsFrameDetails.selectTab('page3-report');	
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