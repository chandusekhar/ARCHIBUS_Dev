/**
* @author Zhang Yi
*/
var commlogRptController = View.createController('commlogRptController', 
{	
	//restriction of console
	consoleRes: " 1=1 ", 
	
	//restriction of tree
	treeRes: ' 1=1 ',

	//Comm Log restriction from table ls_comm
	commRes:" 1=1 ",
	commFieldsArraysForRes: new Array(['ls_comm.comm_type'],['ls_comm.priority'], ['ls_comm.summary','like'], 
			['ls_comm.comm_id'], ['ls_comm.contact_id'], ['ls_comm.recorded_by'], 
			['ls_comm.regulation'], ['ls_comm.reg_program'], ['ls_comm.reg_requirement'],
			['ls_comm.description','like']),

	//Comm Log restriction from table ls_comm only related to date
	commDateRes:" 1=1 ",
	commDateFieldsArraysForRes: new Array( ['ls_comm.date_of_comm']),

	//Requirement restriction from table regrequirement
	reqRes:" 1=1 ",
	requirementFieldsArraysForRes: new Array(['regrequirement.regreq_type']),	

	//restriction from list box on grid's title bar
	listOptionRes:" 1=1",

	//list box options 
	listOptions: new Array("all","reg","prog","req","event"),
	//array of restrictions for list box options
	listOptionRestrictions: new Array(),

	afterInitialDataFetch : function() {
		
		//initial list box on title bar of select panel
		this.initialListOptionRestrictions();
		this.initialListBoxOnPanelTitle();

		this.abCompCommlogConsole_onShow();
	},

	/**
	* Initial restrictions array according to list box options.
	*/
	initialListOptionRestrictions:function(){
		this.listOptionRestrictions[0] = " 1=1 ";
		this.listOptionRestrictions[1] = " ls_comm.regulation IS NOT NULL and ls_comm.reg_program IS NULL ";
		this.listOptionRestrictions[2] = " ls_comm.reg_program IS NOT NULL and ls_comm.reg_requirement IS NULL ";
		this.listOptionRestrictions[3] = " ls_comm. reg_requirement IS NOT NULL ";
		this.listOptionRestrictions[4] = " ls_comm.activity_log_id IS NOT NULL and " + 
			" exists ( select 1 from activity_log where activity_log.activity_type ='COMPLIANCE - EVENT' and ls_comm.activity_log_id=activity_log.activity_log_id ) ";
	},

	/**
	* Construct and Show list box on title bar of Grid
	*/
	initialListBoxOnPanelTitle: function(){
		var panelTitleNode = this.commlogsGrid.getTitleEl().dom.parentNode.parentNode;
		var cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'listBox'
		});
		this.lableDom = cell;

		var tn = Ext.DomHelper.append(cell, '<p>' + View.getLocalizedString(getMessage("listTitle")) + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'list_options_td'
		});
		
		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'list_options'
		}, true);
		this.dropDownDom = options.dom;
		
		for(var i=0;i<this.listOptions.length;i++){
			options.dom.options[i] = new Option(getMessage(this.listOptions[i]), this.listOptions[i]);
		}
		options.dom.selectedIndex = 0;
		options.on('change', this.onChangeListBox, this, {
			delay : 100,
			single : false
		});
	},

	/**
	* Event handler when selection of list box is change
	*/
	onChangeListBox : function(e, selectEl) {
		//get proper permanent restriction and apply it to grid
		this.listOptionRes = this.listOptionRestrictions[selectEl.selectedIndex];
		this.commlogsGrid.refresh(this.treeRes+" and "+ this.consoleRes +" and "+this.listOptionRes);
	},

	/**
	* Event handler for action "Show" of console.
	*/
	abCompCommlogConsole_onShow: function(){
		//reset restriction from tree
		this.treeRes = " 1=1 ";

		//get normal restriction by comm log, requirement from console
		this.commRes = getRestrictionStrFromConsole(this.abCompCommlogConsole, this.commFieldsArraysForRes);
		this.commDateRes =  getDatesRestrictionFromConsole(this.abCompCommlogConsole, this.commDateFieldsArraysForRes);
		this.reqRes = getRestrictionStrFromConsole(this.abCompCommlogConsole, this.requirementFieldsArraysForRes);
		
		//Search Responsible Person in both regrequirement and regprogram using OR
		var responsePerson = this.abCompCommlogConsole.getFieldValue("regrequirement.em_id");
		if(responsePerson){
			//KB3036965 - support em_id with single quotes
			responsePerson = responsePerson.replace(/\'/g, "''");
			this.commRes += " and ( regrequirement.em_id='"	+ responsePerson+"' or regprogram.em_id='"+responsePerson+"') ";
		}

		//get proper location restiction
		if(View.locationRestriction){
			this.commRes = this.commRes  + View.locationRestriction;
		}

		//construct console restriction
		this.consoleRes = this.commRes + " and "+ this.commDateRes+" and "+ this.reqRes;

		this.onRefresh();
    },

	 /**
      * event handle when search button click.
      */
	abCompCommlogConsole_onClear: function(){
		this.abCompCommlogConsole.clear();
		$("virtual_location").value="";
		View.locationRestriction = "";
		
		//clear restriction variables of select controller
		this.listOptionRes = this.listOptionRestrictions[0];
		setOptionValue("list_options",this.listOptions[0]);
	},

	/**
	*  Public function: refresh the tree and grid
	*/
	onRefresh : function(controller) {
		//set sql parameter values to tree
		this.regulationLevel.addParameter("regulationRes",  
			" 	exists ( select 1 from ls_comm " + 
			"	left outer join regprogram on ls_comm.reg_program=regprogram.reg_program and ls_comm.regulation=regprogram.regulation " +
			"	left outer join regrequirement on ls_comm.reg_program=regrequirement.reg_program and ls_comm.regulation=regrequirement.regulation and ls_comm.reg_requirement=regrequirement.reg_requirement " +
			"	left outer join compliance_locations on ls_comm.location_id=compliance_locations.location_id " +
			"	where ls_comm.regulation=regulation.regulation "+
			"	and  "+this.consoleRes + " ) ");

		this.regulationLevel.addParameter("regprogramRes", 
			" exists ( select 1 from ls_comm,regrequirement,compliance_locations  " +
			" where ls_comm.regulation=regprogram.regulation and  ls_comm.reg_program=regprogram.reg_program "+
			" and  "+this.consoleRes + " ) ");

		this.regulationLevel.addParameter("regrequirementRes", 
			" exists ( select 1 from ls_comm,regprogram, compliance_locations  " +
			" where ls_comm.regulation=regrequirement.regulation and  ls_comm.reg_program=regrequirement.reg_program and  ls_comm.reg_requirement=regrequirement.reg_requirement  "+
			" and  "+this.consoleRes + " ) ");

		this.regulationLevel.refresh();
		this.commlogsGrid.refresh(this.consoleRes + " and" + this.treeRes +" and" + this.listOptionRes);

		// after grid is refreshed hide lacation columns if all are empty.
		hideEmptyColumnsByPrefix(this.commlogsGrid, "compliance_locations.");
	},

	/**
	* Public function: Called when click on regulation node on tree
	* refresh grid with given regulation
	*
	@param regulation:  regulation code
	*/
	onClickRegulationNode:function(regulation){
		this.treeRes = " ls_comm.regulation='"+regulation+"'  ";
		this.commlogsGrid.refresh(this.treeRes+" and "+ this.consoleRes+" and "+ this.listOptionRes);
		// after grid is refreshed hide lacation columns if all are empty.
		hideEmptyColumnsByPrefix(this.commlogsGrid, "compliance_locations.");
	},


	/**
	* Public function: Called when click on program node on tree
	* refresh grid with given program
	*
	@param regulation:  regulation code
	@param program:  program code
	*/
	onClickProgramNode:function(regulation,program){
		this.treeRes = " ls_comm.regulation='"+regulation+"'  AND ls_comm.reg_program='"+program+"'  ";
		this.commlogsGrid.refresh(this.treeRes+" and "+ this.consoleRes+" and "+ this.listOptionRes);

		// after grid is refreshed hide lacation columns if all are empty.
		hideEmptyColumnsByPrefix(this.commlogsGrid, "compliance_locations.");
	},

	/**
	* Public function: Called when click on requirement node on tree
	* refresh grid with given program
	*
	@param regulation:  regulation code
	@param program:  program code
	@param program:  requirement code
	*/
	onClickRequirementNode:function(regulation,program,requirement){
		this.treeRes = " ls_comm.regulation='"+regulation+"'  AND ls_comm.reg_program='"+program+"'  AND ls_comm.reg_requirement='"+requirement+"' ";
		this.commlogsGrid.refresh(this.treeRes+" and "+ this.consoleRes+" and "+ this.listOptionRes);

		// after grid is refreshed hide lacation columns if all are empty.
		hideEmptyColumnsByPrefix(this.commlogsGrid, "compliance_locations.");
	},

	/**
	* Event Handler of action "Doc"
	*/
	commlogsGrid_onDoc : function(){
		var	parameters = {};
		parameters.consoleRes = this.consoleRes + " and" + this.treeRes +" and" + this.listOptionRes;
		View.openPaginatedReportDialog("ab-comp-commlog-paginate-rpt.axvw" ,null, parameters);
	}
});
