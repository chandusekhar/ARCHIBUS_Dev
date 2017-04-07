function clearFilter()
{
	clearConsole();
	$('work_pkgs.status').value = "Approved-Out for Bid";
}

function setPackageTitle() 
{
	var northPanel = AFM.view.View.getControl('northFrame', 'northPanel')
	var work_pkg_id = northPanel.restriction['work_pkgs.work_pkg_id'];
	var northFrame = getFrameObject(parent,'northFrame');
	northFrame.document.getElementById("_title").innerHTML = work_pkg_id;
}
	
function selectPage2()
{ 	
	var edit_panel = AFM.view.View.getControl('','edit_panel');
	var restriction = new AFM.view.Restriction(edit_panel.getFieldValues());
	var tabsFrame = getFrameObject(parent, "tabsFrame"); 
	tabsFrame.restriction = restriction;
}

function closeDialogAndRefreshOpener()
{
	parent.opener.closeBidDialog();
}

function closeReviewDialogAndRefreshOpener()
{
	opener.closeBidDialog();
}

function closeBidDialog()
{
	refreshPanels();	
	AFM.view.View.closeDialog();	
}

function refreshOpener()
{
	parent.opener.refreshPanels();
}

function refreshGrid(){
	var gridPanel = AFM.view.View.getControl('westFrame', 'westPanel');
	if (gridPanel) {
		gridPanel.refresh()
		gridPanel.show(true);
	}	
	var detailsPanel = AFM.view.View.getControl('detailsFrame', 'detailsPanel');
	if (detailsPanel) {
		detailsPanel.show(false);
	}	
	var northPanel = AFM.view.View.getControl('northFrame', 'northPanel');
	if (northPanel) {
		northPanel.show(false);
	}		
}

function refreshPanels()
{
	var detailsPanel = AFM.view.View.getControl('detailsFrame', 'detailsPanel');
	if (detailsPanel) 
	{
		detailsPanel.refresh();
		detailsPanel.show(true);
	}	
	var northPanel = AFM.view.View.getControl('northFrame', 'northPanel');
	if (northPanel) 
	{
		northPanel.refresh();
		northPanel.show(true);
	}		
}

function getCurrentISODate()
{
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	= curDate.getDate();
	var year = curDate.getFullYear();
	month =  (month<10)?("0"+month):month;
	day =  (day<10)?("0"+day):day;
	return year + "-" + month + "-" + day;
}

function submitBid()
{
	var curDate = new Date();
	var month = curDate.getMonth()+1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	var formattedCurDate = FormattingDate(day, month, year, strDateShortPattern);
	$('work_pkg_bids.status').value = 'Submitted';
	$('work_pkg_bids.date_submitted').value = formattedCurDate;
}


