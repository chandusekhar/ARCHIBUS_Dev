/**
* Added for 2.1 Compliance: used by a few Manage views and Operational Reports
*
* @author Shi Lei, Zhang Yi
*
*/
var commLogController = View.createController('commLogController',
{	
	//top controller
	mainController:'',
	
	//restriction from select grid in first tab
	selectRes: " 1=1 ", 

	//restriction from select grid in first tab
	consoleRes: " 1=1 ", 

	/**
     * @inherit
     */
    afterInitialDataFetch: function(){
		//set main controller
		this.mainController=View.getOpenerView().controllers.get(0);
		if(this.mainController){
			this.mainController.commLogController=commLogController;
		}
		
		//set grid sql parameter for restriction and refresh it
		this.setRestriction();
		this.commGrid.refresh();

		//set proper title to grid and form
		this.setProperTitle();
    },

    /**
	 * Private Function: hide the forms after tab change (IE will crash if panels are hidden beforeTabChange).
     */
	afterTabChange: function(){    	
		this.commForm.show(false);
	},

	/**
     * Event Handler for afterRefresh event of grid.
	 * configure grid and form for report mode and set proper instruction text.
     */
    commGrid_afterRefresh:function(){
    	
		if("report"==this.mainController.mode){
			this.setReportMode();
		}

    	//kb 3036062 Undefined string in Manage Regulation & Initiative
    	if(this.mainController.instructionStr){
    		var labels="<span>" + this.mainController.instructionStr + "</span>"; 
    		View.panels.get('commGrid').setInstructions(labels);
    	}
    },

	/**
     * Event Handler for afterRefresh event of form.
     */
    commForm_afterRefresh:function(){

		this.setProperRestrictionFieldValue();
    },

	/**
     * Event Handler for acton "Show" of console.
	 * construct restriction from console and refresh grid
     */
	commConsole_onShow: function(){

        var inputRestriction = this.commConsole.getFieldRestriction();
		var restPart = "1=1 ";
		for (var i = 0; i < inputRestriction.clauses.length; i++) {
			var clause = inputRestriction.clauses[i];
			if (clause.value==''||clause.value==0) {
				restPart = restPart + " AND " + clause.name +" "+clause.op+" ";
			} else {
				if(clause.name.indexOf('date_of_comm')!=-1){
					continue;
				}
				if(clause.op == "IN"){
					restPart = restPart + " AND " + clause.name +" "+clause.op + "(" + this.changeFormatForSqlIn(clause.value) + ")";
				}else{
					restPart = restPart + " AND " + clause.name +" "+clause.op + " '" + clause.value + "'";
				}
			}
		}
		
		var dateStart = this.commConsole.getFieldValue("ls_comm.date_of_comm.from");
		var dateTo = this.commConsole.getFieldValue("ls_comm.date_of_comm.to");
		if(valueExistsNotEmpty(dateStart)){
			restPart+=" AND (ls_comm.date_of_comm >= ${sql.date('"+dateStart+"')} )";
		}		
		if(valueExistsNotEmpty(dateTo)){
			restPart+=" AND (ls_comm.date_of_comm <= ${sql.date('"+dateTo+"')} )";
		}
		this.consoleRes = restPart;
		this.commGrid.refresh(restPart);
		
	}, 

	/**
     * Private Function: change array to String[key=value]
	 *
	 * @param array
     */
    changeFormatForSqlIn: function(array){
   	 var result = "";
   	 if(array.length>1){
   		for(var i=0;i<array.length;i++){
   			result+="'"+array[i]+"',"
   		}
   		return result.substring(0,result.length-1);
   	 }
   	 return array;
    },

	/**
     * EventHandler for action 'Add New' of grid
     */
	commGrid_onAddNew:function(){
		var commForm = this.commForm;
		commForm.show(true);
		commForm.newRecord = true;
		
		commForm.setFieldValue("ls_comm.hcm_labeled",1);
		commForm.refresh();
	},
	
	/**
     * EventHandler for action 'Copy As New' of form
     */
	commForm_onCopyAsNew:function(){
		var comm_id=this.commForm.getFieldValue("ls_comm.comm_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.comm_id' ,comm_id);
		var records=this.dsCommForm.getRecords(restriction);
		var record=records[0];
		this.commForm.newRecord = true;
		this.commForm.setRecord(record);
		this.commForm.setFieldValue('ls_comm.auto_number','');

		this.setProperRestrictionFieldValue();
	},

	/**
     * EventHandler for row action 'Details' of grid
     */
	commGrid_onDetails: function(){
	    var commGrid = this.commGrid;
	    var rowIndex = commGrid.rows[commGrid.selectedRowIndex];
	    var auto_number = rowIndex["ls_comm.auto_number"];
		var restriction = {
			'ls_comm.auto_number': auto_number
		};

		this.commRpt.refresh(restriction);
		this.commRpt.show(true);
		this.commRpt.showInWindow({
			width: 800,
			height: 500
		});
	},
	
	/**
	 * Private Function: set proper restriction for loading in different Views 
	 */
	setRestriction: function(){

		//kb 3036236 Value for location_id is missing . add location restriction.
		if(this.mainController.location_id){
			this.selectRes = "ls_comm.location_id="+this.mainController.location_id; 
    	}else{
    		//for 'ab-comp-regulation.axvw'
    		if(this.mainController.regulation){
    			this.selectRes = "ls_comm.reg_program IS NULL and ls_comm.regulation='"+this.mainController.regulation+"' ";
    		}
    		//for 'ab-comp-regprogram.axvw'
    		if(this.mainController.regprogram){
    			this.selectRes = "ls_comm.reg_requirement IS NULL and ls_comm.reg_program='"+this.mainController.regprogram+"' and ls_comm.regulation='"+this.mainController.regulation+"' ";
    		}
    		if(this.mainController.regrequirement){
    			this.selectRes = " ls_comm.reg_requirement='"+this.mainController.regrequirement+"' and ls_comm.reg_program='"+this.mainController.regprogram+"' and ls_comm.regulation='"+this.mainController.regulation+"' ";
    		}
    		
    		if(this.mainController.event){
    			this.selectRes = "ls_comm.activity_log_id="+this.mainController.event;
    		}
    	}
		this.commGrid.addParameter('resFromTab2', this.selectRes  );
	},


	/**
	 * Set proper title to grid and form for loading in different View.
	 */
	setProperTitle:function(){
		if(commLogController.mainController.regulation){
			commLogController.commForm.setTitle(getMessage('formTitleRegulation'));
			commLogController.commGrid.setTitle(getMessage('gridTitleRegulation'));
		}
		//for 'ab-comp-regprogram.axvw'
		if(commLogController.mainController.regprogram){
			commLogController.commForm.setTitle(getMessage('formTitleProgram'));
			commLogController.commGrid.setTitle(getMessage('gridTitleProgram'));
		}
		if(commLogController.mainController.regrequirement){
			commLogController.commForm.setTitle(getMessage('formTitleRequirement'));
			commLogController.commGrid.setTitle(getMessage('gridTitleRequirement'));
		}

		//for 'ab-comp-all-events.axvw'
		if(commLogController.mainController.event){
			commLogController.commGrid.setTitle(getMessage("gridTitleEvent"));
			commLogController.commForm.setTitle(getMessage("formTitleEvent"));
		}

		//for 'ab-comp-location.axvw'
		if(this.mainController.id=='manageLocationMainController'){
			commLogController.commGrid.setTitle(getMessage("gridTitleLocation"));
			commLogController.commForm.setTitle(getMessage("formTitleLocation"));
		}
	},

	/**
     * Private function: apply proper restriction to grid panel for loading in different View
     */
	setProperRestrictionFieldValue: function(){
		
		this.commForm.showField("ls_comm.project_id", true);//initialize set project_id show 
		
		//kb 3036236 Value for location_id is missing . add location restriction.
		if(this.mainController.location_id){
			this.commForm.setFieldValue("ls_comm.location_id", this.mainController.location_id);			
		}
		if(this.mainController.regulation&&!this.mainController.regprogram){
			this.commForm.setFieldValue("ls_comm.regulation",this.mainController.regulation);
			this.commForm.showField("ls_comm.project_id", false);
		}
    	//for 'ab-comp-regprogram.axvw'
    if(this.mainController.regprogram){
			this.commForm.setFieldValue("ls_comm.regulation",this.mainController.regulation);
			this.commForm.setFieldValue("ls_comm.reg_program",this.mainController.regprogram);
			this.commForm.setFieldValue("ls_comm.project_id",this.mainController.project_id);
    }
    	//for 'ab-comp-regprogram.axvw' and Event views
    if(this.mainController.regrequirement){
			this.commForm.setFieldValue("ls_comm.reg_requirement",this.mainController.regrequirement);
    }
		//for Event View
    if(this.mainController.event){
    	this.commForm.setFieldValue("ls_comm.activity_log_id", this.mainController.event);
		if (this.mainController.event_location_id) {
			this.commForm.setFieldValue("ls_comm.location_id", this.mainController.event_location_id);
		}
    }
   	if(this.mainController.event || this.commForm.getFieldValue("ls_comm.activity_log_id")) {
		  //hide field 'location_id' for loading in event related views and reports
		  this.commForm.showField("ls_comm.location_id", false);
    }
    else {    
		//disable location_id field but enable its select-value button
		this.commForm.enableField("ls_comm.location_id",false);
		this.commForm.enableFieldActions("ls_comm.location_id",true);
		this.commForm.showField("ls_comm.location_id", true);
    }
	},

	/**
	 * Private Function: configure grid and form to report mode. 
	 */
	setReportMode:function(){
		hideActionsOfPanel(this.commGrid, new Array("addNew") ,false);
	},
	
	/**
     * Refresh the grid when there are restriction condition changes
     */
	onRefresh:function(){
		if(this.mainController.event){
			this.selectRes = "ls_comm.activity_log_id="+this.mainController.event;
    		this.commGrid.addParameter("resFromTab2","ls_comm.activity_log_id="+this.mainController.event);
    	}
		this.commForm.show(false);
		this.commGrid.refresh();
	},

	/**
	* Event Handler of action "Doc"
	*/
	commGrid_onDoc: function(){
		var	parameters = {};
		parameters.selectRes = this.selectRes + " AND " +this.consoleRes;

		var location_id = this.mainController.location_id;
		if(location_id){
			View.openPaginatedReportDialog("ab-comp-loc-log-tab-paginate-rpt.axvw" ,null, parameters);
		}
		else{
			//for 'ab-comp-all-events.axvw'
			if(this.mainController.event){
				View.openPaginatedReportDialog("ab-comp-event-log-paginate-rpt.axvw" ,null, parameters);
			}
			//for 'ab-comp-regulation.axvw'
			else if(this.mainController.regrequirement){
				View.openPaginatedReportDialog("ab-comp-req-log-paginate-rpt.axvw" ,null, parameters);
			}
			//for 'ab-comp-regprogram.axvw
			else if(this.mainController.regprogram){
				View.openPaginatedReportDialog("ab-comp-prog-log-paginate-rpt.axvw" ,null, parameters);
			}
			//for 'ab-comp-regrequirement.axvw'
			else if(this.mainController.regulation){
				View.openPaginatedReportDialog("ab-comp-reg-log-paginate-rpt.axvw" ,null, parameters);
			}
		}
	}
});

/**
 * Public function called from axvw: set current user to field "ls_comm.recorded_by".
 *
 */
function saveCurrentUser(){
	commLogController.commForm.setFieldValue("ls_comm.recorded_by", View.user.employee.id);
}