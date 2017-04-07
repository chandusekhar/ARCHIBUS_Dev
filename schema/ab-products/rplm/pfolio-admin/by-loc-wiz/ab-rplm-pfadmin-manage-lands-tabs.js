var abLandMangementTabCtrl = View.createController('abLandMangementTab',{
	menuParent:null,
	menu: new Array('lease', 'land', 'document', 'contact'),
	subMenu: new Array(new Array(), 
						new Array(),
						new Array('land', 'lease'),
						new Array('land', 'lease')),
	isValidGisLicense: true,
	afterInitialDataFetch: function(){
		this.isValidGisLicense = hasValidArcGisMapLicense();
		this.tabsLandManagement.addEventListener('afterTabChange', afterTabChange);
		var mapController = View.controllers.get('mapCtrl');
		mapController.menu = this.menu;
		mapController.subMenu = this.subMenu;
		mapController.init();
		//mapController.loadMenu();
	}
})

function afterTabChange(tabPanel, selectedTabName){
	if (abLandMangementTabCtrl.isValidGisLicense) {
		var mapController = View.controllers.get('mapCtrl');
		if (selectedTabName == 'tabsLandManagement_0') {
			mapController.showLegend();
		}
		else 
			if (selectedTabName == 'tabsLandManagement_1') {
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
			page = 'ab-rplm-pfadmin-leases-by-land-report.axvw';
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
			page = 'ab-rplm-pfadmin-documents-by-land-report.axvw';
			controller = 'abRplmPfadminContactsDocCommonController';
			actionType = 1;
			break;
		}
		case 3:{
			page = 'ab-rplm-pfadmin-documents-by-land-lease-report.axvw';
			controller = 'repDocumentsByLeaseByLand';
			actionType = 2;
			break;
		}
		case 4:{
			page = 'ab-rplm-pfadmin-contacts-by-lands-report.axvw';
			controller = 'abRplmPfadminContactsDocCommonController';
			actionType = 1;
			break;
		}
		case 5:{
			page = 'ab-rplm-pfadmin-contacts-by-lease-by-land-report.axvw';
			controller = 'repContactsByLeaseByLand';
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
		}else if(actionType == 3){ // "Lands by..." reports
			var restriction = new Ab.view.Restriction();
			restriction.addClause("property.pr_id", items, "IN");
			
			View.openDialog(page, null, true, {
				width: 1000,
				height: 400,
				closeButton: true,
				maximize: true,
				itemType: 'land',
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

