var abBldgMangementTabCtrl = View.createController('abBldgMangementTab',{
	menuParent:null,
	menu: new Array('lease', 'building', 'document', 'contact'),
	subMenu: new Array(new Array(), 
						new Array('country', 'region', 'state', 'city', 'site', 'property'),
						new Array('building', 'lease'),
						new Array('building', 'lease')),
	isValidGisLicense: true,
	afterInitialDataFetch: function(){
		//this.isValidGisLicense = hasValidArcGisMapLicense();
		this.tabsBldgManagement.addEventListener('afterTabChange', afterTabChange);
		var mapController = View.controllers.get('mapCtrl');
		mapController.menu = this.menu;
		mapController.subMenu = this.subMenu;
//		mapController.loadMenu();
	}
})

function afterTabChange(tabPanel, selectedTabName){
	/*
	if(abBldgMangementTabCtrl.isValidGisLicense){
		var mapController = View.controllers.get('mapCtrl');
		if (selectedTabName == 'tabsBldgManagement_0') {
		//	mapController.showLegend();
		}else if (selectedTabName == 'tabsBldgManagement_1') {
			//	mapController.hideLegend();
		}
	}
	*/
}

function reports(type, items){
	// try to read items varaiable again
	try{
		items = this.items;
		items = items.join(',').replaceAll('\'', '').split(',');
	}catch(e){
		return;
	}
	var page;
	var controller;
	var actionType;
	switch(type){
		case 0:{
			page = 'ab-rplm-pfadmin-leases-and-suites-by-building-report.axvw';
			controller = 'abRplmPfadminLeasesCommonController';
			actionType = 1;
			break;
		}
		case 1:{
			page = 'ab-rplm-pfadmin-bldgs-by-country-report.axvw';
			controller = 'abRplmBldgByCtryCtrl';
			actionType = 3;
			break;
		}
		case 2:{
			page = 'ab-rplm-pfadmin-bldgs-by-region-report.axvw';
			controller = 'abRplmPfadminBldgsByRegionReportCtrl';
			actionType = 3;
			break;
		}
		case 3:{
			page = 'ab-rplm-pfadmin-bldgs-by-state-report.axvw';
			controller = 'abRplmPfadminBldgsByStateReportCtrl';
			actionType = 3;
			break;
		}
		case 4:{
			page = 'ab-rplm-pfadmin-bldgs-by-city-report.axvw';
			controller = 'abRplmPfadminBldgsByCityReportCtrl';
			actionType = 3;
			break;
		}
		case 5:{
			page = 'ab-rplm-pfadmin-bldgs-by-site-report.axvw';
			controller = 'abRplmPfadminBldgsBySiteReportCtrl';
			actionType = 3;
			break;
		}
		case 6:{
			page = 'ab-rplm-pfadmin-bldgs-by-property-report.axvw';
			controller = 'abRplmPfadminBldgsByPropertyReportCtrl';
			actionType = 3;
			break;
		}
		case 7:{
			page = 'ab-rplm-pfadmin-documents-by-bldgs-report.axvw';
			controller = 'abRplmPfadminContactsDocCommonController';
			actionType = 1;
			break;
		}
		case 8:{
			page = 'ab-rplm-pfadmin-documents-by-bldgs-lease-report.axvw';
			controller = 'repDocumentsByBuildingLease';
			actionType = 2;
			break;
		}
		case 9:{
			page = 'ab-rplm-pfadmin-contacts-by-bldgs-report.axvw';
			controller = 'abRplmPfadminContactsDocCommonController';
			actionType = 1;
			break;
		}
		case 10:{
			page = 'ab-rplm-pfadmin-contacts-by-lease-by-bldgs-report.axvw';
			controller = 'repContactsByLeaseByBldg';
			actionType = 2;
			break;
		}
	}
	if (items[0].length == 0) {
		View.showMessage(getMessage('error_noselection'));
	}
	else {
		if(actionType == 1){
			View.openDialog(page, null, true, {
				width: 1000,
				height: 400,
				closeButton: true,
				afterInitialDataFetch: function(dialogView){
					var dialogController = dialogView.controllers.get(controller);
					dialogController.items = items;
					dialogController.initReport();
				}
			});
		}else if(actionType == 2){
			View.openDialog(page, null, true, {
				width: 1000,
				height: 400,
				closeButton: true,
				afterInitialDataFetch: function(dialogView){
					var dialogController = dialogView.controllers.get(controller);
					dialogController.isDialog = true;
					dialogController.items = items;
					dialogController.buildReport();
				}
			});
		}else if(actionType == 3){ // "Buildings by..." reports
			View.openDialog(page, null, true, {
				width: 1000,
				height: 400,
				closeButton: true,
				bldgIds: items
			});
		}
	}
}

String.prototype.replaceAll = function(search, replacement){
	var i = this.indexOf(search);
	var object = this;
	
	while (i > -1){
		object = object.replace(search, replacement); 
		i = object.indexOf(search);
	}
	return object;
}

