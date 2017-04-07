/**
 * @song
 */
var abRiskMsdsDefMsdsByLocationController = View.createController('abRiskMsdsDefMsdsByLocationController', {
	/**
	 * This event handler is called by the view after the view loading and
	 * initial data fetch for all panels is complete.
	 */
	afterInitialDataFetch : function() {
//		if(this.abRiskMsdsDefMsdsTabsParent){
//			this.abRiskMsdsDefMsdsTabsParent.addEventListener('afterTabChange', afterTabChange);
//		}
		this.hiddenTabsPanel();
	},
	/**
	 * hidden tabs panel.
	 */
	hiddenTabsPanel: function(){
		//kb 3035056 select first tab and then hidden tab panel.
	    if(abRiskMsdsDefMsdsByLocationController.abRiskMsdsDefMsdsTabsParent){
	    	abRiskMsdsDefMsdsByLocationController.abRiskMsdsDefMsdsTabsParent.selectTab("msds", null, false, false, false);
	    }
		this.abRiskMsdsDefMsdsTabsParent.hideTab("msds"); 
		this.abRiskMsdsDefMsdsTabsParent.hideTab("details"); 
	},
	/**
	 * click tree node.
	 */
	onClickSiteNode: function(){
		this.hidenGroupPanels();
		var objTree = this.abRiskMsdsDefMsdsSiteTree;
		var node = objTree.lastNodeClicked;
		var site_id = node.data['site.site_id'];
		this.abRiskMsdsDefMsdsGroupSitePanel.refresh("msds_location.site_id='"+site_id+"'");
		this.abRiskMsdsDefMsdsGrid.show(false);
	},
	/**
	 * click tree node.
	 */
	onClickBlNode: function(){
		this.hidenGroupPanels();
		var objTree = this.abRiskMsdsDefMsdsSiteTree;
		var node = objTree.lastNodeClicked;
		var site_id = node.parent.data['site.site_id'];
		var bl_id = node.data['bl.bl_id'];
		this.abRiskMsdsDefMsdsGroupBlPanel.refresh("msds_location.site_id='"+site_id+"' and msds_location.bl_id='"+bl_id+"'");
		this.abRiskMsdsDefMsdsGrid.show(false);
	}, 
	/**
	 * click tree node.
	 */
	onClickFlNode: function(){
		this.hidenGroupPanels();
		var objTree = this.abRiskMsdsDefMsdsSiteTree;
		var node = objTree.lastNodeClicked;
		var site_id = node.parent.parent.data['site.site_id'];
		var bl_id = node.parent.data['bl.bl_id'];
		var fl_id = node.data['fl.fl_id'];
		this.abRiskMsdsDefMsdsGroupFlPanel.refresh("msds_location.site_id='"+site_id+"' and msds_location.bl_id='"+bl_id+"' and msds_location.fl_id='"+fl_id+"'");
		this.abRiskMsdsDefMsdsGrid.show(false);
	},
	/**
	 * click tree node.
	 */
	onClickRmNode: function(){
		this.hidenGroupPanels();
		var objTree = this.abRiskMsdsDefMsdsSiteTree;
		var node = objTree.lastNodeClicked;
		var site_id = node.parent.parent.parent.data['site.site_id'];
		var bl_id = node.parent.parent.data['bl.bl_id'];
		var fl_id = node.parent.data['fl.fl_id'];
		var rm_id = node.data['rm.rm_id'];
		this.abRiskMsdsDefMsdsGroupRmPanel.refresh("msds_location.site_id='"+site_id+"' and msds_location.bl_id='"+bl_id+"' and msds_location.fl_id='"+fl_id+"' and msds_location.rm_id='"+rm_id+"'");
		this.abRiskMsdsDefMsdsGrid.show(false);
	},
	/**
	 * click tree node.
	 */
	onClickAisleNode: function(){
		this.hidenGroupPanels();
		var objTree = this.abRiskMsdsDefMsdsSiteTree;
		var node = objTree.lastNodeClicked; 
		var bl_id = node.data['aisle.bl_id'];
		var fl_id = node.data['aisle.fl_id'];
		var rm_id = node.data['aisle.rm_id'];
		var aisle_id = node.data['aisle.aisle_id'];
		this.abRiskMsdsDefMsdsGroupAislePanel.refresh("msds_location.bl_id='"+bl_id+"' and msds_location.fl_id='"+fl_id+"' and msds_location.rm_id='"+rm_id+"'");
		this.abRiskMsdsDefMsdsGrid.show(false);
	},
	
	onClickCabinetNode: function(){
		this.hidenGroupPanels();
		var objTree = this.abRiskMsdsDefMsdsSiteTree;
		var node = objTree.lastNodeClicked; 
		var bl_id = node.data['cabinet.bl_id'];
		var fl_id = node.data['cabinet.fl_id'];
		var rm_id = node.data['cabinet.rm_id'];
		var aisle_id = node.data['cabinet.aisle_id'];
		var cabinet_id = node.data['cabinet.cabinet_id'];
		this.abRiskMsdsDefMsdsGroupCabinetPanel.refresh("msds_location.bl_id='"+bl_id+"' and msds_location.fl_id='"+fl_id+"' and msds_location.rm_id='"+rm_id+"'");
		this.abRiskMsdsDefMsdsGrid.show(false);
	},
	
	hidenGroupPanels: function(){
		// make sure the tabs are shown
		this.abRiskMsdsDefMsdsTabsParent.show(true);
		var panels = [this.abRiskMsdsDefMsdsGroupSitePanel,this.abRiskMsdsDefMsdsGroupBlPanel,this.abRiskMsdsDefMsdsGroupFlPanel,
		              	this.abRiskMsdsDefMsdsGroupRmPanel,this.abRiskMsdsDefMsdsGroupAislePanel,this.abRiskMsdsDefMsdsGroupCabinetPanel];
		for(var i=0;i<panels.length;i++){
			panels[i].show(false);
		}
		
		this.hiddenTabsPanel();
	}
});


/**
 * event handler when select one group row record 
 */
function showPnaelSite(){
	refreshGrid('abRiskMsdsDefMsdsGroupSitePanel');
}
/**
 * event handler when select one group row record 
 */
function showPnaelBl(){
	refreshGrid('abRiskMsdsDefMsdsGroupBlPanel');
}
/**
 * event handler when select one group row record 
 */
function showPnaelFl(){
	refreshGrid('abRiskMsdsDefMsdsGroupFlPanel');
}
/**
 * event handler when select one group row record 
 */
function showPnaelRm(){
	refreshGrid('abRiskMsdsDefMsdsGroupRmPanel');
}

function showPanelAisle(){
	refreshGrid('abRiskMsdsDefMsdsGroupAislePanel');
}
function showPanelCabinet(){
	refreshGrid('abRiskMsdsDefMsdsGroupCabinetPanel');
}
/**
 * common method 
 * event handler when select one group row record  
 */
function refreshGrid(panelName){

	abRiskMsdsDefMsdsByLocationController.abRiskMsdsDefMsdsTabsParent.showTab("msds"); 
	abRiskMsdsDefMsdsByLocationController.abRiskMsdsDefMsdsTabsParent.showTab("details");
	abRiskMsdsDefMsdsByLocationController.abRiskMsdsDefMsdsTabsParent.disableTab("details");
	
	var gripPanel = View.panels.get(panelName);
    var rowIndex = gripPanel.rows[gripPanel.selectedRowIndex];
    var site_id = rowIndex["msds_location.site_id"];
    var bl_id = rowIndex["msds_location.bl_id"];
    var fl_id = rowIndex["msds_location.fl_id"];
    var rm_id = rowIndex["msds_location.rm_id"];
    var aisle_id = rowIndex["msds_location.aisle_id"];
    var cabinet_id = rowIndex["msds_location.cabinet_id"];
    var eq_id = rowIndex["msds_location.eq_id"];
    var count_msds = rowIndex["msds_location.count_msds_id"];
    var restriction = "";
    if(site_id){
    	restriction+="msds_location.site_id='"+site_id+"'";
    }
    else {
    	restriction+=" and msds_location.site_id IS NULL";
    }
    if(bl_id){
    	restriction+=" and msds_location.bl_id='"+bl_id+"'";
    }
    else if(bl_id=='') {
    	restriction+=" and msds_location.bl_id IS NULL";
    }
    if(fl_id){
    	restriction+=" and msds_location.fl_id='"+fl_id+"'";
    }
    else if(fl_id=='') {
    	restriction+=" and msds_location.fl_id IS NULL";
    }
    if(rm_id){
    	restriction+=" and msds_location.rm_id='"+rm_id+"'";
    }
    else if(rm_id=='') {
    	restriction+=" and msds_location.rm_id IS NULL";
    }
    if(aisle_id){
    	restriction+=" and msds_location.aisle_id='"+aisle_id+"'";
    }
    else if(aisle_id=='') {
    	restriction+=" and msds_location.aisle_id IS NULL";
    }
    if(cabinet_id){
    	restriction+=" and msds_location.cabinet_id='"+cabinet_id+"'";
    }
    else if(cabinet_id=='') {
    	restriction+=" and msds_location.cabinet_id IS NULL";
    }
    
    if(eq_id){
    	restriction+=" and msds_location.eq_id='"+eq_id+"'";
    }
    abRiskMsdsDefMsdsByLocationController.abRiskMsdsDefMsdsGrid.refresh(restriction);
    //for 'MSDS Locations List' process, reselect tab .
    if(abRiskMsdsDefMsdsByLocationController.abRiskMsdsDefMsdsTabsParent){
    	abRiskMsdsDefMsdsByLocationController.abRiskMsdsDefMsdsTabsParent.selectTab("msds", null, false, false, false);
    }
    
}
/**
 * event handler when click one record of grid.
 */
function popUpDetails(){
	var gripPanel = View.panels.get("abRiskMsdsDefMsdsGrid");
    var rowIndex = gripPanel.rows[gripPanel.selectedRowIndex];
    var msds_id = rowIndex["msds_location.msds_id"];
	var restriction = 'msds_id = '+msds_id;
	View.openDialog("ab-msds-rpt-map-msds-tab.axvw",restriction, false);
}
/**
 * event handler when click one record of grid.
 */
function linkToDetailsTab(){

	var gripPanel = View.panels.get("abRiskMsdsDefMsdsGrid");
	var rowIndex = gripPanel.rows[gripPanel.selectedRowIndex];
	var msds_id = rowIndex["msds_location.msds_id"];
	var restriction = 'msds_id = '+msds_id;
	
	abRiskMsdsDefMsdsByLocationController.abRiskMsdsDefMsdsTabsParent.selectTab("details", restriction, false, false, false);
	abRiskMsdsDefMsdsByLocationController.msdsDetailsTabs.refresh(restriction);
	abRiskMsdsDefMsdsByLocationController.msdsDetailsTabs.selectTab("identification", restriction, false, false, false);
	//add manual refresh for constituents
	abRiskMsdsDefMsdsByLocationController.abRiskMsdsRptMsdsConstGrid.refresh(restriction);
}
/**
 * The showDocument command does the job.
 */
function showDocument() {

	abRiskMsdsDefMsdsByLocationController.msdsDetailsTabs.selectTab("document", null, false, false, false);
	
	var form=abRiskMsdsDefMsdsByLocationController.abRiskMsdsRptMsdsDocForm;
	var keys = {"msds_id": form.getFieldValue("msds_data.msds_id")};//form.getDocSvcPrimaryKeyFieldValues();
	var tableName = "msds_data";
	var fieldName = "doc";
	var fileName = form.getFieldValue("msds_data.doc");
	DocumentService.show(keys, tableName, fieldName, fileName, '', true, 'showDocument', {
        callback: function(fileTransfer) {
            dwr.engine.openInDownload(fileTransfer);
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}

