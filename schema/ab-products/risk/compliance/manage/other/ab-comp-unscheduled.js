/**
* Added for 20.2 "View Unscheduled Compliance Items".
* 
* @author Zhang Yi
*
*/
var abCompUnscheduledController = View.createController('abCompUnscheduledController',
{
	//array of restriction fields
	requirementFieldsArraysForRes: new Array(['regrequirement.reg_requirement'], ['regrequirement.regreq_type'],['regrequirement.priority']),		
	programFieldsArraysForRes: new Array(['regrequirement.reg_program',' ','regprogram.reg_program'],['regprogram.priority']),
	regulationFieldsArraysForRes: new Array(['regrequirement.regulation',' ','regulation.regulation'],['regulation.reg_rank']),	
	
	//restriction variables
	regrequirementRes:"",
	regprogramRes:"",
	regulationRes:"",
	
	//restriction for "Results For" filter field
	radioRes:"",

	//restriction applied for three tabs
	regulationTabRes:"",
	programTabRes:"",
	requirementTabRes:"",

	/**
     * @inherit
     */
    afterInitialDataFetch: function(){
    	this.console_onShow();
    },

	/**
	* Event handler for "Show" button of Console
	* Apply filter to Panel 2 and 3. 
	*/
	console_onShow : function() {

		var res="1=1 ";

		//Retrieve restrictions based on according field array 
		var regrequirementRes = getRestrictionStrFromConsole(this.console, this.requirementFieldsArraysForRes);
		var regprogramRes = getRestrictionStrFromConsole(this.console, this.programFieldsArraysForRes);
		var regulationRes = getRestrictionStrFromConsole(this.console, this.regulationFieldsArraysForRes);

		//get radio selection of "Results For"
		var radio=getRadioValue("noResult");
		this.radioRes=" 1=1 ";

		//Set proper restriction to grid by radio selection
		switch (radio){
			case "noReq":
				this.setGridRestrictionForNoRequirement(regulationRes, regprogramRes);
				break;

			case "noEve":
				this.setGridRestrictionForNoEvent(regulationRes, regprogramRes,regrequirementRes);
			break;

			case "noNot":
				this.setGridRestrictionForNoNotification(regulationRes, regprogramRes,regrequirementRes);
			break;
		}
		
		//Set proper restriction to tree by console and radio selection
		this.regulationLevel.addParameter("regulationRes",this.regulationTabRes);
		this.regulationLevel.addParameter("regprogramRes",this.programTabRes);
		this.regulationLevel.addParameter("regrequirementRes",this.requirementTabRes);
		this.regulationLevel.refresh();
	},

	/**
	* Private Function: Set SQL restriction of grid for "No Requirement" option.
	*
	*@param regulationRes regulation restriction
	*@param regprogramRes program restriction
	*@param requirementRes requirement restriction
	*/
	setGridRestrictionForNoRequirement:function(regulationRes, regprogramRes,requirementRes){
		//No Requirements: matches Programs (and their Regulations) with no regrequirement records.  Also matches Regulations with no Programs.
		this.requirementTabRes = " 1=0 ";
		this.programTabRes = regprogramRes +" and NOT EXISTS(SELECT 1 FROM regrequirement WHERE regprogram.reg_program=regrequirement.reg_program and regprogram.regulation=regrequirement.regulation) ";
		this.regulationTabRes = regulationRes +" and ( NOT EXISTS(SELECT 1 FROM regrequirement WHERE regulation.regulation=regrequirement.regulation) " +
				" OR NOT EXISTS(SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation)  " +
				" OR regulation.regulation IN (SELECT regprogram.regulation FROM regprogram WHERE " + this.programTabRes +" ) )";

		 // Select Regulations tab  if ¡°No Requirements¡± radio button is selected, otherwise select Requirements tab
		this.refreshTabs();
		this.compTabs.selectTab('regulations');
	},

	/**
	* Private Function: Set SQL restriction of grid for "No Event" option.
	*
	*@param regulationRes regulation restriction
	*@param regprogramRes program restriction
	*@param requirementRes requirement restriction
	*/
	setGridRestrictionForNoEvent:function(regulationRes, regprogramRes,regrequirementRes){
		//No Events: matches Requirements (and their Programs and Regulations) with no activity_log records
		this.requirementTabRes = regrequirementRes+ " AND "+this.getSqlForNoEvent("regrequirement", "reg_requirement"); 
		this.programTabRes = regprogramRes +" AND ( "+this.getSqlForNoEvent("regprogram", "reg_program") + 
				" OR  regprogram.reg_program IN (SELECT regrequirement.reg_program FROM regrequirement WHERE " + this.requirementTabRes +" ) )  ";
		this.regulationTabRes = regulationRes + " AND ( "+this.getSqlForNoEvent("regulation", "regulation")+ 
				" OR  regulation.regulation IN (SELECT regprogram.regulation FROM regprogram WHERE " + this.programTabRes +" )  )";
				" OR  regulation.regulation IN (SELECT regrequirement.regulation FROM regrequirement WHERE " + this.requirementTabRes +" ) )  )";

		 // Select Regulations tab  if ¡°No Requirements¡± radio button is selected, otherwise select Requirements tab
		this.refreshTabs();
		this.compTabs.selectTab('requirements');
	},

	/**
	* Private Function: Set SQL restriction of grid for "No Notification" option.
	*
	*@param regulationRes regulation restriction
	*@param regprogramRes program restriction
	*@param requirementRes requirement restriction
	*/
	setGridRestrictionForNoNotification:function(regulationRes, regprogramRes,regrequirementRes){
		//No Notifications:  matches Requirements (and their Programs and Regulations) with activity_log records but no corresponding notifications table records for any of those activity_log records.
		this.requirementTabRes = regrequirementRes+ " AND "+this.getSqlForNoNotification("regrequirement"); 
		this.programTabRes = regprogramRes +" AND ( "+this.getSqlForNoNotification("regprogram") + 
				" OR  regprogram.reg_program IN (SELECT regrequirement.reg_program FROM regrequirement WHERE " + this.requirementTabRes +" ) )  ";
		this.regulationTabRes = regulationRes + " AND ( "+this.getSqlForNoNotification("regulation")+ 
				" OR  regulation.regulation IN (SELECT regprogram.regulation FROM regprogram WHERE " + this.programTabRes +" )  )";
				" OR  regulation.regulation IN (SELECT regrequirement.regulation FROM regrequirement WHERE " + this.requirementTabRes +" ) )  )";

		 // Select Regulations tab  if ¡°No Requirements¡± radio button is selected, otherwise select Requirements tab
		this.refreshTabs();
		this.compTabs.selectTab('requirements');
	},

	/**
	* Private Function: refresh grid in tabs
	*/
	refreshTabs:function(){
		this.regulationGrid.refresh(this.regulationTabRes+ this.regulationRes);
		this.programGrid.refresh(this.programTabRes+this.regprogramRes);
		this.requirementGrid.refresh(this.requirementTabRes+this.regrequirementRes);
	},

	/**
	* Private Function: get SQL sentence as restriction to event based on given table.
	*
	*@param table table name
	*/
	getSqlForNoEvent:function(table){
		var res = " NOT EXISTS(SELECT 1 FROM activity_log WHERE activity_log.regulation=" + table+".regulation ";
		if("regprogram" ==table){
			res += " AND activity_log.reg_program=" +table+".reg_program ";
		} else if("regrequirement" ==table){
			res += " AND activity_log.reg_program=" +table+".reg_program ";
			res += " AND activity_log.reg_requirement=" +table+".reg_requirement ";
		}
		res +=" ) ";
		return res;
	},

	/**
	* Private Function: get SQL sentence as restriction to notification based on given table
	*
	*@param table table name
	*/
	getSqlForNoNotification:function(table){
		var res = " NOT EXISTS(SELECT 1 FROM notifications left outer JOIN activity_log ON activity_log.activity_log_id=notifications.activity_log_id " + 
																" WHERE activity_log.regulation=" + table+".regulation ";
		if("regprogram" ==table){
			res += " AND activity_log.reg_program=" +table+".reg_program ";
		} else if("regrequirement" ==table){
			res += " AND activity_log.reg_program=" +table+".reg_program ";
			res += " AND activity_log.reg_requirement=" +table+".reg_requirement ";
		}
		res +=" ) ";
		return res;
	},

	/**
	* Public Function: called when click tree's regulation node
	* construct restriction and refresh tab
	*
	*@param regulation regulation code
	*/
	onClickRegulationNode:function(regulation){
		this.regrequirementRes = " AND regrequirement.regulation='"+regulation+"' ";
		this.regprogramRes = " AND regprogram.regulation='"+regulation+"' ";
		this.regulationRes = " AND regulation.regulation='"+regulation+"' ";
		this.refreshTabs();
	},

	/**
	* Public Function: called when click tree's program node
	* construct restriction and refresh tabs
	*
	*@param regulation regulation code
	*@param program program code
	*/
	onClickProgramNode:function(regulation,program){
		this.regrequirementRes = " AND regrequirement.regulation='"+regulation+"' AND regrequirement.reg_program='"+program+"' ";
		this.regprogramRes = " AND regprogram.regulation='"+regulation+"' AND regprogram.reg_program='"+program+"' ";;
		this.regulationRes = " AND regulation.regulation='"+regulation+"' ";
		this.refreshTabs();
	},

	/**
	* Public Function: called when click tree's requirement node
	* construct restriction and refresh tabs
	*
	*@param regulation regulation code
	*@param program program code
	*@param requirement requirement code
	*/
	onClickRequirementNode:function(regulation,program,requirement){
		this.regrequirementRes = " AND regrequirement.regulation='"+regulation+"' AND regrequirement.reg_program='"+program+"'  AND regrequirement.reg_requirement='"+requirement+"' ";
		this.regprogramRes = " AND regprogram.regulation='"+regulation+"' AND regprogram.reg_program='"+program+"' ";;
		this.regulationRes = " AND regulation.regulation='"+regulation+"' ";
		this.refreshTabs();
	},

	/**
	* Event Handler of action "Doc" on Requlation grid
	*/
	regulationGrid_onDoc: function(){
		var	parameters = {};
		parameters.consoleRes = this.regulationTabRes+ this.regulationRes;

		View.openPaginatedReportDialog("ab-comp-reg-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	* Event Handler of action "Doc" on Requirement grid
	*/
	programGrid_onDoc: function(){
		var	parameters = {};
		parameters.consoleRes = this.programTabRes+ this.regprogramRes;

		View.openPaginatedReportDialog("ab-comp-prog-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	* Event Handler of action "Doc" on Requlation grid
	*/
	requirementGrid_onDoc: function(){
		var	parameters = {};
		parameters.consoleRes = this.requirementTabRes+ this.regrequirementRes;
		View.openPaginatedReportDialog("ab-comp-req-paginate-rpt.axvw" ,null, parameters);
	}
});

/**
 * Get radio button value.
 * @param name radio button name
 */
function getRadioValue(name){
	
	var objRadio = document.getElementsByName(name);
	if(objRadio){
		for( var i = 0; i < objRadio.length; i++ ){
			var optRadio = objRadio[i];
			if(optRadio.checked){
				return optRadio.value;
			}
		}
	}
	return "";
}
