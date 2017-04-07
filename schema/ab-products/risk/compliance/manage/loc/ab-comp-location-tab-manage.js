/**

* @author lei

*/
var manageLocationController = View.createController('manageLocationController',
{
	mainController:'',
	consoleRes:'',
	enableTabsArr: new Array(['events',true],['docs',true],['commLogs',true]),
	disableTabsArr: new Array(['events',false],['docs',false],['commLogs',false]),
	
	consoleReglocArraysForRes: new Array(['regloc.regulation'], ['regloc.reg_program'], ['regloc.reg_requirement']),
	consoleRegulationArraysForRes: new Array(),
	consoleRegprogramArraysForRes: new Array(),
	consoleRegrequireArraysForRes: new Array(['regrequirement.regreq_type']),
	
	//- Check Compliance Level in regloc, regrequirement, and regprogram tables, using an OR operator.
	//- Search Vendor Code, Responsible Person in both regloc, regrequirement and regprogram, using an OR operator.
	compLevelForResLoc: new Array(['regloc.comp_level','','regloc.comp_level']),
	compLevelForProgram: new Array(['regloc.comp_level','','regprogram.comp_level']),
	compLevelForRequire: new Array(['regloc.comp_level','','regrequirement.comp_level']),
	
	respPersonForRegLoc: new Array(['regloc.resp_person','','regloc.resp_person']),
	respPersonForProgram: new Array(['regloc.resp_person','','regprogram.em_id']),
	respPersonForRequire: new Array(['regloc.resp_person','','regrequirement.em_id']),
	
	vnForRegLoc: new Array(['regloc.vn_id','','regloc.vn_id']),
	vnForProgram: new Array(['regloc.vn_id','','regprogram.vn_id']),
	vnForRequire: new Array(['regloc.vn_id','','regrequirement.vn_id']),
	
	mainTabs:'',	
	
	consoleRes:'',
	
	afterInitialDataFetch: function(){
		this.manageLocationGrid.refresh();
		this.mainController=View.getOpenerView().controllers.get(0);
		this.mainTabs = View.parentTab.parentPanel;
		hideEmptyColumnsByPrefix(this.manageLocationGrid,'compliance_locations');
        this.manageLocationGrid.update();
		View.parentTab.parentPanel.manageLocationController=manageLocationController;
		
  },
  
  northConsole_afterRefresh:function(){
  	this.northConsole.clear();
  },
  
  /**
   * Add add new button for add a new compliance location and regulation location
   */
  manageLocationGrid_onAddNew:function(){
	  //Set which page should refresh when we add a view.
	  manageLocationController.mainController.setTabRefreshObj('editLocation', 1);
	  
		var grid = manageLocationController.manageLocationGrid;
		
		var compLocationTabs=manageLocationController.mainController.compLocationTabs;
		//for when we add a new record from manage tab
		compLocationTabs.creatNewRecord='newRecord';
		
		compLocationTabs.location_id='newRecord';
		
		
		enableAndDisableTabs(compLocationTabs,manageLocationController.disableTabsArr);
		
		manageLocationController.mainTabs.selectTab("editLocation", null, false, false, true);
		
		
  },
	/**
	* This event handler is called by show button in abWasteDefMainfestsConsole.
	*/
  northConsole_onFilter : function() {
    	var locationStr=" 1=1 "
    	if(View.locationRestriction!=''&&View.locationRestriction!=undefined){
    		locationStr=locationStr+View.locationRestriction;
    	}
		var consoleReglocForRes = getRestrictionStrFromConsole(this.northConsole, this.consoleReglocArraysForRes);
		var consoleRegulationRes = getRestrictionStrFromConsole(this.northConsole, this.consoleRegulationArraysForRes);
		var consoleRegprogramRes= getRestrictionStrFromConsole(this.northConsole, this.consoleRegprogramArraysForRes);
		var consoleRegrequireRes = getRestrictionStrFromConsole(this.northConsole, this.consoleRegrequireArraysForRes);
		
		
		//- Search Compliance Level in regloc, regrequirement, and regprogram tables, using an OR operator.

		//- Search Vendor Code, Responsible Person in both regrequirement and regprogram, using an OR operator.

	
		//for compliance level
		var compLevelForResLoc = getRestrictionStrFromConsole(this.northConsole, this.compLevelForResLoc);
		var compLevelForProgram = getRestrictionStrFromConsole(this.northConsole, this.compLevelForProgram);
		var compLevelForRequire = getRestrictionStrFromConsole(this.northConsole, this.compLevelForRequire);
		
		var compLevelRes=" (( "+compLevelForResLoc+ " ) or ( regloc.comp_level is null AND "+compLevelForRequire+" )or ( regloc.comp_level is null AND  regrequirement.comp_level is null AND "+ compLevelForProgram+") )";
		
		//response person
		var respPersonForRegLoc = getRestrictionStrFromConsole(this.northConsole, this.respPersonForRegLoc);
		var respPersonForProgram = getRestrictionStrFromConsole(this.northConsole, this.respPersonForProgram);
		var respPersonForRequire = getRestrictionStrFromConsole(this.northConsole, this.respPersonForRequire);
		var respPersonRes=" (( "+respPersonForRegLoc+ " ) or ( regloc.resp_person is null AND "+respPersonForRequire+" )or ( regloc.resp_person is null AND  regrequirement.em_id is null AND "+ respPersonForProgram+") )";
	
		//for vn
		var vnForRegLoc = getRestrictionStrFromConsole(this.northConsole, this.vnForRegLoc);
		var vnForProgram = getRestrictionStrFromConsole(this.northConsole, this.vnForProgram);
		var vnForRequire = getRestrictionStrFromConsole(this.northConsole, this.vnForRequire);
		var vnRes=" (( "+vnForRegLoc+ " ) or ( regloc.vn_id is null AND "+vnForRequire+" )or ( regloc.vn_id is null AND  regrequirement.vn_id is null AND "+ vnForProgram+") )";
		
		var orRes=" 1=1 ";
			
		if(compLevelRes.indexOf('AND')!=-1){
			orRes=" 1=1 AND "+compLevelRes ;
			
		}
		if(respPersonRes.indexOf('AND')!=-1){
			orRes=orRes+ " AND "+respPersonRes;
		}
		
		if(vnRes.indexOf('AND')!=-1){
			orRes=orRes+ " AND "+vnRes;
		}
		
		var locationFor = $('locationFor').value;
		var locationForRes=' 1=1 ';
		if(locationFor=="Requirements"){
			locationForRes= 'regloc.reg_requirement IS NOT NULL';
		}else if(locationFor=="Programs"){
			locationForRes= 'regloc.reg_program IS NOT NULL AND regloc.reg_requirement IS NULL';
		}else if(locationFor=="Regulations"){
			locationForRes= 'regloc.regulation IS NOT NULL AND regloc.reg_program IS NULL AND regloc.reg_requirement IS NULL';
		}
		
		var locationRes=" 1=1 ";

		//from visual field location restriction
		if(View.locationRestriction!=''&&View.locationRestriction!=undefined){
			locationRes=" 1=1 "+View.locationRestriction;
    	}
		
		
		var res= locationForRes+" AND "+ locationRes+" AND "+ consoleReglocForRes+" AND "+consoleRegulationRes+" AND " +consoleRegprogramRes +" AND "+consoleRegrequireRes+" AND  ( "+orRes+")";
		this.consoleRes=res;
		this.manageLocationGrid.refresh(res);
		hideEmptyColumnsByPrefix(this.manageLocationGrid,'compliance_locations');
        this.manageLocationGrid.update();		 
	},
	
	/**
	 * Edit sample event handler.
	 */
	northConsole_onClear: function(){
		this.northConsole.clear();
		$('locationFor').value='All';
		clearConsoleFields();
		
	},

    /**
     * update we select records
     */
    manageLocationGrid_onUpdateSelection:function(){
        updateCompLocSelections(View.panels.get('manageLocationGrid'));
    },
	
	/**
	 * Print paginate report
	 */
	onPaginatedReport: function(commandObject, pagRepName){
		var paramteters="";
		if(this.consoleRes){
			parameters = {
					'consoleRestriction': this.consoleRes
			    };
		}else{
			parameters = {
					 'consoleRestriction': ' 1=1 '
			        
			    };
		}
		
		View.openPaginatedReportDialog(pagRepName, null, parameters);
	}
});

function editCompLoc(){
	//Set other tabs refresh except the array['assignLocation','manageLocation'] which contain .
	manageLocationController.mainController.setOthersTabRefreshObj(['assignLocation','manageLocation'], 1);
	var grid = manageLocationController.manageLocationGrid;
	var rowIndex = grid.rows[grid.selectedRowIndex];
    var location_id = rowIndex["regloc.location_id"];
    var regulation = rowIndex["regloc.regulation"];
    var regprogram = rowIndex["regloc.reg_program"];
    var regrequirement = rowIndex["regloc.reg_requirement"];
	//this.sbfDetailTabs.enableTab('select');
	manageLocationController.mainTabs.location_id=location_id;
	
	//manageLocationController.mainTabs.findTab("editLocation").isContentLoaded=false;
	manageLocationController.mainTabs.selectTab("editLocation", null, false, false, true);
	
	var compLocationTabs=manageLocationController.mainController.compLocationTabs;
	enableAndDisableTabs(compLocationTabs,manageLocationController.enableTabsArr);
	
	var recordComLoc=manageLocationController.dsCompLocForm.getRecords('location_id='+location_id)[0];
	var instructionStr=generateInstruction(regulation,regprogram,regrequirement,recordComLoc);

	manageLocationController.mainController.instructionStr=instructionStr;
	manageLocationController.mainController.location_id=location_id;
	manageLocationController.mainController.regulation=regulation;
	manageLocationController.mainController.regprogram=regprogram;
	manageLocationController.mainController.regrequirement=regrequirement;
	manageLocationController.mainController.project_id=rowIndex["regprogram.project_id"];
	
}

