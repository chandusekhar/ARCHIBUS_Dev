/**
*	used for:
*	 Manage Compliance Requirements
*    Compliance Notification Templates
*/
var abCompSelectProgramController = View.createController('abCompSelectProgramController', {
    
	// parent tabs 
	tabs: null,
	
	//key field name
	key: "regprogram.reg_program",

    //console restriction
	programRes:" 1=1 ", 
	
	//restriction of select program grid
	selectRes: " 1=1 ", 

    //----------------event handle--------------------
    afterViewLoad: function(){
    },
    
    afterInitialDataFetch: function(){
    	this.mainController=View.getOpenerView().controllers.get(0);
		this.tabs = this.mainController.sbfDetailTabs;
		
		if(this.tabs.configureForAssignProgram){
			this.configureForAssignProgram();
		}
		else{
			this.configureForDefault();
		}
		this.abCompSelectProgram.refresh();  
		
		//if there is a console exists, put current controller to the console controller array
		 if (typeof controllerConsole != "undefined") {
			 controllerConsole.controllers.push(abCompSelectProgramController);
			 controllerConsole.getVnRespComplevelResForRequireOrProgram = getCustomFieldsResForProgram;
		 }
    },
    
    /**
	 * filter console show button click.
	 */
	refreshFromConsole:function(){
		//add restriction for programRes
		this.programRes = generateProgramRestriction("program");
		
		//Add location restriction for this.regulationRes which use for regulation tab.
		addConsoleLocationResToTabRes(abCompSelectProgramController,null,this.programRes,null);
		
		this.abCompSelectProgram.addParameter('programRes', this.programRes);
		
		this.abCompSelectProgram.refresh(this.getCostomFieldsRes());
		
		//store restriction for select program grid
		this.selectRes = this.programRes + " and " + this.getCostomFieldsRes();
	},
	
	/**
	 * special logic for custom fields.
	 */
	getCostomFieldsRes: function(){
		
		var restriction ="1=1 ";
		var date_start = this.abCompSelectProgramConsole.getFieldValue("regprogram.date_start");
		var date_end = this.abCompSelectProgramConsole.getFieldValue("regprogram.date_end");

		var dataRes="";
		
		//kb 3036550 
		//condition 1: WHERE ((date_end>DateFrom OR date_end IS NULL OR dateFrom IS NULL) 
		//condition 2: AND (date_start<DateTo OR date_start IS NULL OR dateTo IS NULL))
		if(!(date_start==''&&date_end=='')){
			
			var condition1 = " and ( regprogram.date_end >= ${sql.date('"+date_start+"')} or regprogram.date_end is null) ";
			var condition2 = " and (regprogram.date_start < ${sql.date('"+date_end+"')} or  regprogram.date_start is null)";
			
			if(date_start&&date_end){
				dataRes = condition1+condition2;
			}else if(date_start&&!date_end){// dateTo IS NULL --- condition 1
				dataRes = condition1;
			}else if(date_end&&!date_start){// dateFrom IS NULL --- condition 2
				dataRes = condition2;
			}
		}
		return restriction + dataRes;
	},
	
    /**
     * filter console show button click.
     */
    abCompSelectProgramConsole_onShow: function(){
    	
    	 if (typeof controllerConsole != "undefined") {
    		 controllerConsole.abCompDrilldownConsole = this.abCompSelectProgramConsole;
    		 controllerConsole.abCompDrilldownConsole_onShow();
    	 }
    },

    /**
     * first tab row record button click change to tab2 edit form.
     */
    clickSelectButtonEdit: function(){
    	var grid = this.abCompSelectProgram;
    	var row = grid.rows[grid.selectedRowIndex];

        var program = row[this.key];
        var regulation = row["regprogram.regulation"];
		this.tabs.regprogram = program;
		this.tabs.regulation = regulation;
        this.mainController.regulation = regulation;
        this.mainController.regprogram = program;
        this.mainController.project_id = row["regprogram.project_id"];
        
        var restriction = new Ab.view.Restriction();
    	restriction.addClause(this.key, program, '=');
    	restriction.addClause('regprogram.regulation', regulation, '=');

		  this.mainController.newRecord = false;
    	this.mainController.setOthersTabRefreshObj("select", 1);
    	
    	this.tabs.selectTab("define", restriction, false, false, true);

        var viewTitle = getMessage("manageCompProgram")+": "+program;
        this.mainController.view.setTitle(viewTitle);
		this.tabs.setAllTabsEnabled(true);
//		this.tabs.disableTab('select');
    },
    
    /**
     * when add new button click.
     */
    abCompSelectProgram_onAddNew: function(){
 	    this.mainController.newRecord = true;
		this.mainController.copyRecord = false;
		      	
    	this.mainController.setOthersTabRefreshObj("select", 1);
    	
			var tabs = this.tabs;
		
			if( tabs.findTab('define')){
			  tabs.selectTab("define", null, true);
			
				this.mainController.view.setTitle(getMessage("addNewProgram"));
			 this.tabs.enableTab('select');
			}

			var defineTab = tabs.findTab('define');
			defineTab.restriction = null;
		
    },

    /**
     * handler for 'Assign Selected' button click.
     */
    abCompSelectProgram_onAssignSelected: function(){
		if(this.abCompSelectProgram.getSelectedRows().length==0){
			View.showMessage(getMessage("selectNone"));
		} else{
			var templateIds = this.tabs.selectedTemplates;
			try{
				var programs = this.abCompSelectProgram.getSelectedRecords();
				var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-createNotifyTemplateAssignments', this.tabs.selectedTemplateIds, programs, "program");
				if(result.code == 'executed'){
					//If no error, display temporary message (like when Saving)
					var instructions = "<span style='color:green'>" + getMessage("assignedProgram") + "</span>";
					this.abCompSelectProgram.setInstructions(instructions);
					this.abCompSelectProgram.setInstructions.defer(2000, this.abCompSelectProgram);
					//refresh grid in tab1 of Manage Notification Template tabs
					var index = View.getOpenerView().controllers.length-1;
					var topController = View.getOpenerView().controllers.get(index);
					if(topController){
						topController.needRefreshSelectList=true;				
					}
				}
			}catch(e){
				
				Workflow.handleError(e);
				return false;
			}
		}

    },

    /**
     * handler for 'Close' button click.
     */
    abCompSelectProgram_onClose: function(){
		//Hide Tab 5.  Enable, refresh, and switch to Tab 1.
		this.mainController.needRefreshSelectList=true;
		this.tabs.selectTab("selectTemplate");
		this.abCompSelectProgram.setAllRowsSelected(false);
    },

    configureForDefault: function(){
		this.abCompSelectProgram.actions.get('assignSelected').show(false);
		this.abCompSelectProgram.actions.get('close').show(false);
		showHideColumns(this.abCompSelectProgram, "multipleSelectionColumn", true);
	},

    configureForAssignProgram: function(){
		this.abCompSelectProgram.setTitle(getMessage("selectToAssign"));
		this.abCompSelectProgram.actions.get('addNew').show(false);
		showHideColumns(this.abCompSelectProgram, "selectButton",true);
	},

	/**
	* Event Handler of action "Doc"
	*/
	abCompSelectProgram_onDoc : function(){
		var	parameters = {};
		parameters.consoleRes = this.selectRes;
		View.openPaginatedReportDialog("ab-comp-prog-paginate-rpt.axvw" ,null, parameters);
	}
}); 