
var abReportRequirementController = View.createController('abReportRequirementController', {
	
	isReport: true,

	afterViewLoad: function(){
		Ab.recurring.RecurringControl.addField({
			panel: this.abCompSelectRequirement,
			fields: new Array("regrequirement.recurring_rule"),
			exportButtons: new Array({id: "xls", type: "XLS"})
		});		
	},

	afterInitialDataFetch: function(){
    	
		//change back to get 'common controller'.
		commonRptController = View.getOpenerView().controllers.get(0);
		
		//if this view is opend as popup, get the restriction from parent view and refresh the reuirement grid
		var openerView = View.getOpenerView().getOpenerView();
		//for default datasource.
		
		//for default datasource.
		var query=this.getQuerySqlForPopUp();
		
		this.abCompSelectRequirement.addParameter('query', query);
		
		if(openerView.popUpRestriction){
			//hide DOC button when open as pop up 
			this.abCompSelectRequirement.actions.get('doc').show(false);
			
			this.abCompSelectRequirement.addParameter('consoleResRegcompliance', openerView.popUpRestriction);
		}else if(openerView.whichView){
			this.abCompSelectRequirement.actions.get('doc').show(false);
			//For hide select button of pop-up requirement tab.
			if(openerView.whichView=='countregulationbylocandrank'||openerView.whichView=='countregulationbyrankandcat'){
					this.abCompSelectRequirement.showColumn('select', false);
			}
			
			//for count program and requirement tasks.
			if(openerView.whichView&&(openerView.whichView=='countprogrambylevelandloc'||openerView.whichView=='countprogrambyregulationandloc'||openerView.whichView=='countregulationbylocandrank')){
				var query=this.getQuerySqlForPopUp(openerView,openerView.whichView);
				this.abCompSelectRequirement.addParameter('query',query);
				
			}else {
				this.abCompSelectRequirement.addParameter('requirementRes', openerView.popUpRestrictionForRequirement);
			}
		}
		
		// change do not use 'firstTabTable' in mainController because mainController load later then first select sub-tab.
		if(commonRptController.sbfDetailTabs.findTab("regulation")==null){
			if(commonRptController.sbfDetailTabs.findTab("comprogram")==null){
				if(commonRptController.sbfDetailTabs.findTab("requirement")!=null){
					
					this.abCompSelectRequirement.refresh();
					
					//set grid title by default.
					this.abCompSelectRequirement.setTitle(getMessage("gridTitle"));
				}
			}
		}
		
		if(commonRptController.isPermit && commonRptController.isPermit==true){
			
			var permanentParameter = " regrequirement.regreq_type in ('License','Permit') AND regrequirement.status = 'Active' ";
			this.abCompSelectRequirement.addParameter('permanentParameter', permanentParameter);

			this.abCompSelectRequirement.refresh();
			//records should order by date_expire (asc)
			this.abCompSelectRequirement.onClickSort(8);	
			this.setGridColor();
		}

		//Modified for 22.1 Compliance and Building Operations Integration: if there is a console exists, put current controller to the console controller array
		 if (typeof controllerConsole != "undefined") {
			 controllerConsole.controllers.push(abReportRequirementController);
		 }

	},

	/**
	 * Generate custom datasource for popup from chart .
	 */
	getQuerySqlForPopUp:function(openerView,whichView){
		//KB3037263 - please remove the location and compliance level restriction only for the requirements tab in the popup
		var query=
		     ' SELECT regrequirement.regulation AS regulation,regrequirement.reg_requirement AS reg_requirement,'
  			+' regrequirement.comp_level AS comp_level,regrequirement.reg_program AS reg_program,regrequirement.status AS status,'
  			+' regrequirement.regreq_type AS regreq_type,regrequirement.date_expire AS date_expire,regprogram.priority AS priorityforprogram,'
  			+' regrequirement.priority AS priorityforrequirement,regrequirement.em_id AS em_id,regrequirement.regreq_cat AS regreq_cat,'
  			+' regrequirement.date_start AS date_start,regrequirement.date_end AS date_end,regrequirement.date_required AS date_required,'
  			+' regrequirement.vn_id AS vn_id,regrequirement.criteria_type AS criteria_type,regprogram.project_id AS project_id,'
  			+' regrequirement.citation AS citation,regprogram.contact_id AS contact_id, regrequirement.recurring_rule AS recurring_rule'
		    +' FROM regrequirement left outer join regulation on regrequirement.regulation=regulation.regulation '
			+' left outer join regprogram on regrequirement.regulation=regprogram.regulation AND regrequirement.reg_program=regprogram.reg_program'
			+' WHERE ${parameters[\'requirementRes\']}and ${parameters[\'consoleResRegcompliance\']} and ${parameters[\'permanentParameter\']}';
		
		return query
	},
	
	/**
	 * set grid color by compare with field 'date_expire'.
	 */
	setGridColor: function(){
		
			var rows = this.abCompSelectRequirement.rows;
			var currentDate = getCurrentDate();
			for (var i = 0; i < rows.length; i++) {
				var row=rows[i];
				var date_expire  = row['regrequirement.date_expire'];
				if(date_expire){
					if(bDateIsBefore(date_expire,currentDate)){
						Ext.get(row.row.dom).setStyle('background-color', 'red');
					}else if(!bDateIsBefore(date_expire,currentDate)&&bDateIsBefore(date_expire,getCurrentDatePlusMonth3())){
						Ext.get(row.row.dom).setStyle('background-color', 'yellow');
					}
				}
		}
	},
	
    /**
     * first tab row record button click change to tab2 edit form.
     */
	abCompSelectRequirement_onSelect: function(row){
		
		var record = row.getRecord();
		var regulation = record.getValue("regrequirement.regulation");
		var regprogram = record.getValue("regrequirement.reg_program");
		var requirement = record.getValue("regrequirement.reg_requirement");
				
		commonRptController.objRestrictions.regulation = regulation;
		commonRptController.objRestrictions.reg_program = regprogram;
		commonRptController.objRestrictions.reg_requirement = requirement;
		
		// Mark all other tabs for refresh
		commonRptController.setOthersTabRefreshObj("regrequirement", 1);
		
		commonRptController.sbfDetailTabs.selectTab("events");
		commonRptController.sbfDetailTabs.setAllTabsEnabled(true);
    },
    
	abCompSelectRequirement_onView: function(row){
		
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var regulation = record.getValue("regrequirement.regulation");
		var reg_program = record.getValue("regrequirement.reg_program");
		var reg_requirement = record.getValue("regrequirement.reg_requirement");
		var restriction = {
			'regrequirement.regulation': regulation,
			'regrequirement.reg_program': reg_program,
			'regrequirement.reg_requirement': reg_requirement
		};
		Ab.view.View.openDialog('ab-comp-rpt-requirement-form.axvw', restriction, false, 0, 0, 1100, 500);  
	},
	
	/**
	* Event Handler of action "Doc"
	*/
	abCompSelectRequirement_onDoc : function(){
		var	parameters = {};
		
		var commonRptController = View.getOpenerView().controllers.get(0);
		
		//if this tab view is used as first tab in ab-comp-rpt-requirement.axvw, get restriction from grid parameters
		if(commonRptController.sbfDetailTabs.findTab("regulation")==null && commonRptController.sbfDetailTabs.findTab("comprogram")==null){
			if(commonRptController.sbfDetailTabs.findTab("requirement")!=null){
				var restriction = '1=1';
				if(this.abCompSelectRequirement.parameters['requirementRes']){
					restriction+=' and '+this.abCompSelectRequirement.parameters['requirementRes'];
				}
				
				if(this.abCompSelectRequirement.parameters['permanentParameter']){
					restriction+=' and '+this.abCompSelectRequirement.parameters['permanentParameter'];
				}
				
				parameters.consoleRes = restriction;
					
			}
		}else{//if this tab view is used as not first tab, get restriction from grid restriction
			parameters.consoleRes = this.abCompSelectRequirement.restriction?this.abCompSelectRequirement.restriction:'1=1';
		}
		
		//initializeReccuringParametersRpt(parameters);
		View.openPaginatedReportDialog("ab-comp-req-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	 * Modified for 22.1 Compliance and Building Operations Integration: called by console method : 'abCompDrilldownConsole_onShow'
	 */  
	refreshFromConsole: function(){
		//add restriction for requirementRes
		this.requirementRes = generateRequirementRestriction();
		this.abCompSelectRequirement.addParameter('requirementRes', this.requirementRes);
		this.abCompSelectRequirement.refresh();
		
		//Add location restriction for this.regulationRes which use for regulation tab.
		//addConsoleLocationResToTabRes(mainController,null,null,this.requirementRes);
		
		//kb 3036320 after click Show in filter, supposed to switch back to first tab and disable all other tabs.  This is not implemented.
		if (View.parentTab.parentPanel) {
			var parentTabs = View.parentTab.parentPanel;
			parentTabs.setAllTabsEnabled(false);
			parentTabs.enableTab('requirement');
			parentTabs.selectTab('requirement');
		}
		
		if (typeof permitController != "undefined") {
			if(permitController.isPermit){
				//set grid color by compare with field 'date_expire' for View 'Permits and Licenses'
				this.setGridColor();
			}
		}
	}
});

function getCurrentDate() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return ((month < 10) ? "0" : "") + month + "/" + ((day < 10) ? "0" : "") + day + "/" +year;
}
function getCurrentDatePlusMonth3() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	curDate = new Date(year,month+3,day); 

	 month = curDate.getMonth() + 1;
	 day = curDate.getDate();
	 year = curDate.getFullYear();
	return ((month < 10) ? "0" : "") + month + "/" + ((day < 10) ? "0" : "") + day + "/" +year;
}




