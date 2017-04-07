var abStructureMangementTabCtrl = View.createController('abStructureMangementTab',{
	menuParent:null,
	menu: new Array('lease', 'structure', 'document', 'contact'),
	subMenu: new Array(new Array(), 
						new Array(),
						new Array('structure', 'lease'),
						new Array('structure', 'lease')),
	isValidGisLicense: true,
	afterInitialDataFetch: function(){
		this.isValidGisLicense = hasValidArcGisMapLicense();
		this.tabsStructuresManagement.addEventListener('afterTabChange', afterTabChange);
		var mapController = View.controllers.get('mapCtrl');
		mapController.menu = this.menu;
		mapController.subMenu = this.subMenu;
		mapController.init();
		//mapController.loadMenu();
	}
})

function afterTabChange(tabPanel, selectedTabName){
	if (abStructureMangementTabCtrl.isValidGisLicense) {
		var mapController = View.controllers.get('mapCtrl');
		if (selectedTabName == 'tabsStructuresManagement_0') {
			mapController.showLegend();
		}
		else 
			if (selectedTabName == 'tabsStructuresManagement_1') {
				mapController.hideLegend();
			}
	}
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
			page = 'ab-rplm-pfadmin-leases-by-structure-report.axvw';
			controller = 'abRplmPfadminLeasesCommonController';
			actionType = 1;
			break;
		}
		case 1:{
			page = 'ab-repm-pfadmin-item-by-location.axvw';
			controller = 'abRepmPfadminItemsByLocationController';
			actionType = 3;
			break;
		}
		case 2:{
			page = 'ab-rplm-pfadmin-documents-by-struc-report.axvw';
			controller = 'abRplmPfadminContactsDocCommonController';
			actionType = 1;
			break;
		}
		case 3:{
			page = 'ab-rplm-pfadmin-documents-by-struc-lease-report.axvw';
			controller = 'repDocumentsByLeaseByStruc';
			actionType = 2;
			break;
		}
		case 4:{
			page = 'ab-rplm-pfadmin-contacts-by-struc-report.axvw';
			controller = 'abRplmPfadminContactsDocCommonController';
			actionType = 1;
			break;
		}
		case 5:{
			page = 'ab-rplm-pfadmin-contacts-by-lease-by-struc-report.axvw';
			controller = 'repContactsByLeaseByStruc';
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
		}else if(actionType == 3){ // "Structures by..." reports
			var restriction = new Ab.view.Restriction();
			restriction.addClause("property.pr_id", items, "IN");

			View.openDialog(page, null, true, {
				width: 1000,
				height: 400,
				closeButton: true,
				maximize: true,
				itemType: 'structure',
				groupBy: 'geo_region',
				parentRestriction: restriction
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

