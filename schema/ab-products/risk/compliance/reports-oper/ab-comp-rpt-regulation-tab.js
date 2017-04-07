
var abReportRegulationController = View.createController('abReportRegulationController', {
		
	afterInitialDataFetch: function(){
		
		var openerView = View.getOpenerView().getOpenerView();
		if(!openerView){
			openerView = View.getOpenerView();;
		}
		
		//for default datasource.
		var query=this.getQuerySqlForPopUp();
		this.abCompSelectRegulation.addParameter('query', query);
		
		if(openerView.whichView){
			this.abCompSelectRegulation.actions.get('doc').show(false);
			if(openerView.whichView=='countregulationbylocandrank'){
				//for count program and requirement tasks.
				query=this.getQuerySqlForPopUp(openerView,openerView.whichView);
				this.abCompSelectRegulation.addParameter('query', query);
			}else{
				this.abCompSelectRegulation.addParameter('consoleResRegulation', openerView.popUpRestrictionForRegulation);
			}
		}

		 //Modified for 22.1 Compliance and Building Operations Integration: for pop up from Location and Regulation Rank and Regulation Rank and Category
    	this.addParentRestrictionIfPopUp();

		this.abCompSelectRegulation.refresh();
	},

    //Modified for 22.1 Compliance and Building Operations Integration
    addParentRestrictionIfPopUp: function(){
    	var openerView = View.getOpenerView();
    	if(openerView.popUpRestriction){
    		this.abCompSelectRegulation.addParameter('consoleResRegulation', openerView.popUpRestriction);
    	}
    },
    
    /**
     * Modified for 22.1 Compliance and Building Operations Integration.
     */
	abCompSelectRegulationConsole_onShow: function(){	  
		var restriction = abCompRptConsoleController.getConsoleRestriction();
		this.abCompSelectRegulation.refresh(restriction);
	},
	
	/**
	 * Generate custom datasource for popup from chart .
	 */
	getQuerySqlForPopUp:function(openerView,whichView){
		var query='';
		if(whichView&&whichView=='countregulationbylocandrank'){
			
			 query = ' select distinct '

				    + '       regloc.regulation AS regulation,regulation.reg_rank AS reg_rank, '
					+ ' 	regulation.reg_name AS	reg_name ,	regulation.reg_class AS	reg_class ,	'
					+ ' 	regulation.reg_cat AS	reg_cat ,	regulation.reg_type AS	reg_type ,	regulation.authority AS	authority ,'
					+ ' 	regulation.citation AS	citation ,	regulation.date_compliance AS	date_compliance ,	regulation.date_start AS	date_start ,'
					+ ' 	regulation.date_end AS	date_end ,	regulation.related_reg AS	related_reg '
					
					+ ' from regloc '
				    + '         left join compliance_locations on compliance_locations.location_id = regloc.location_id'
				    + '         left join regulation on regulation.regulation = regloc.regulation'
				    + '         left join regprogram on regprogram.reg_program = regloc.reg_program and regprogram.regulation = regloc.regulation'
				    + '         left join regrequirement on regrequirement.reg_program = regloc.reg_program and regrequirement.regulation = regloc.regulation and regrequirement.reg_requirement = regloc.reg_requirement'
			  		+'  WHERE  '
			  		+'  CONSOLE-AND-PARANET-RESTRICTION ';
		  	  query = query.replace(/CONSOLE-AND-PARANET-RESTRICTION/g, openerView.popUpRestrictionForConsoleAndParent);
			  
		}else{
			query=	 ' SELECT '
				+'	regulation.regulation,'
				+'	regulation.reg_name,'
				+'	regulation.reg_class,'
				+'	regulation.reg_rank,'
				+'	regulation.reg_cat,'
				+'	regulation.reg_type,'
				+'	regulation.authority,'
				+'	regulation.citation,'
				+'	regulation.date_compliance,'
				+'	regulation.date_start,'
				+'	regulation.date_end,'
				+'	regulation.related_reg'
		
				+'	FROM regulation '
				+'  WHERE  ${parameters[\'consoleResRegulation\'] }';
		}
		return query
	},   

	
    /**
     * first tab row record button click change to tab2 edit form.
     */
	abCompSelectRegulation_onSelect: function(row){

		var record = row.getRecord();
		var regulation = record.getValue("regulation.regulation");
		var commonRptController=View.controllers.get('commonRptController');
		if(!commonRptController){
			commonRptController = View.getOpenerView().controllers.get('commonRptController');
		}
		commonRptController.exportRes = "program";
		commonRptController.objRestrictions.regulation = regulation;
		commonRptController.objRestrictions.reg_program = null;
		commonRptController.objRestrictions.reg_requirement = null;

		// Mark all other tabs for refresh
		commonRptController.setOthersTabRefreshObj("regulation", 1);
		
		commonRptController.sbfDetailTabs.selectTab("comprogram");
		commonRptController.sbfDetailTabs.setAllTabsEnabled(true);
  },
    
	abCompSelectRegulation_onView: function(row){
		
		var record = row.getRecord();
		var regulation = record.getValue("regulation.regulation");
		var restriction = {
			'regulation.regulation': regulation
		};
		Ab.view.View.openDialog('ab-comp-rpt-regulation-form.axvw', restriction, false, 0, 0, 700, 400);  
	},
	
	/**
	* Event Handler of action "Doc"
	*/
	abCompSelectRegulation_onDoc : function(){
		var	parameters = {};
		parameters.consoleRes = this.abCompSelectRegulation.restriction?this.abCompSelectRegulation.restriction:'1=1';
		View.openPaginatedReportDialog("ab-comp-reg-paginate-rpt.axvw" ,null, parameters);
	}
	
});

