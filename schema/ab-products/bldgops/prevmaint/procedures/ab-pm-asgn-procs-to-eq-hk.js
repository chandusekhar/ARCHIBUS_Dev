/**
 * @author keven.xi
 *
 * Bali3 :  1. Add support for multiple-selection of Location grid. 
 *				2. Totally refactoring the JS codes and  related WFRs on server side.  
 * By Zhang Yi.
 */
var assignPMController = View.createController('assignPM', {
    /**
     * Restriction of filter.
     */
    searchRestriction: null,
    /*
     * Datasource of Pm Schedule
     */
    dataSourcePms: null,
    /*
     * Current Procedure Type: {'EQ','HK'}
     */
    pmpType: "EQ",
    /*
     * Current Selected Tab: "EQTab" or "HKTab"
     */
    curTab: "EQTab",  
    /*
     * Const String
     */
    EQPms: "EQ",
    LocationPms: "HK",
    
    afterViewLoad: function(){
        this.searchRestriction = new Ab.view.Restriction();
        this.dataSourcePms = View.dataSources.get("ds_ab-pm-asgn-procs-to-eq-hk_set_pms");

		//Override the selectAll method for solving the performance issue. Added for PM Release 2
        this.eq_select.selectAll = this.selectAllEquipments;
        this.rm_select.selectAll = this.selectAllLocations;
		
		//Bind event handler
		this.eq_select.addEventListener('onMultipleSelectionChange', this.onSelectMultipleEquipments.createDelegate(this) );
		this.rm_select.addEventListener('onMultipleSelectionChange', this.onSelectMultipleLocations.createDelegate(this) );
		this.Select_Equipment_Location.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
    },
        
    /**
     * When switch the tab, refresh the 'Equipment' and 'location' grid in tab pages. 	 
     */
    beforeTabChange: function(tabPanel, selectedTabName, newTabName){
        if (newTabName == "rm_tab") {
            this.curTab = "HKTab";
        }
        else {
            this.curTab = "EQTab";
        }
        this.filterEqOrRmPanel_onShow();
    },

    /**
     * Customized reportGrid.selectAll() function for Equipment grid. 
     */
    selectAllEquipments: function(selected) {
		//here 'this' refers to Equipment grid control
    	this.addEventListener('onMultipleSelectionChange', null );
    	this.setAllRowsSelected(selected);  
		this.addEventListener('onMultipleSelectionChange', assignPMController.onSelectMultipleEquipments.createDelegate(assignPMController) );
		assignPMController.onSelectMultipleEquipments();
    },    

    /**
     * Customized reportGrid.selectAll() function for Location grid. 
     */
    selectAllLocations: function(selected) {
 		//here 'this' refers to Location grid control
	   	this.addEventListener('onMultipleSelectionChange', null );
    	this.setAllRowsSelected(selected);  
		this.addEventListener('onMultipleSelectionChange', assignPMController.onSelectMultipleLocations.createDelegate(assignPMController) );
		assignPMController.onSelectMultipleLocations();
    },    

    /**
     * Allow select multiple equipments. 	 
	 * Added for PM Release 2. 
     */
	onSelectMultipleEquipments:function(row){
			//Guo adden 2009-08-28 to fix bug(the two panels in the right can not show when select the checkbox in the left) caused by build change
			this.pmp_select.show(true);

			var records = this.eq_select.getSelectedRecords();
			if(records && records.length>0){
				// if there are selected row(s)
				this.pmpType = this.EQPms;
				try {
					//	ZY added on 2010-12-06 for kb3024888, construct equipment codes and equipment standards string
					var eqIds = "",eqStds="";
					for(var i=0; i<records.length;i++){
						eqIds +=records[i].values['eq.eq_id']+";"
						eqStds +=records[i].values['eq.eq_std']+";"
					}

					// Call WFR to get pm schedules attached to all selected equipments, and set the result to 	 'Assigned Procedures' grid.
					var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-getSchedulesForEquipments', eqIds);
					this.pmp_select.clear();
					this.pmp_select.setRecords(result.dataSet.records, result.dataSet.hasMoreRecords);

					//	ZY changed on 2010-12-06 for kb3024888, don't manually call WFR, but refresh the 'Available Procedure' grid and implicitly execute refresh WFR method on server side 
					this.pmp_list.refresh(eqIds+"&;plus&;"+eqStds);

					//Set title of Assigned Procedures panel
					if(records.length>1){
						var title = getMessage("assignedProceduresMulti");
						setPanelTitle('pmp_select', title);
					}
					else{
						var title = getMessage("assignedProcedures")+records[0].getValue("eq.eq_id");
						setPanelTitle('pmp_select', title);
					}
				} 
				catch (e) {
					Workflow.handleError(e);
				}
			}
			else{	
					// if all rows are unselected then hide Available Procedure grid and Assigned Procedures grid as well as clear them.
 					this.pmp_select.clear();
 					this.pmp_list.clear();
					this.pmp_select.show(false);
					this.pmp_list.show(false);
			}

			//kb3026576: disable sort for custom records set.
	        this.pmp_select.removeSorting();
	},

    /**
     * Allow select multiple locations. 	 
	 * Added for Bali3 By Zhang Yi. 
     */
	onSelectMultipleLocations:function(row){
			//Guo adden 2009-08-28 to fix bug(the two panels in the right can not show when select the checkbox in the left) caused by build change
			this.pmp_select.show(true);

			var records = this.rm_select.getSelectedRecords();
			if(records && records.length>0){
				// if there are selected row(s)
				this.pmpType = this.LocationPms;
				try {
					// Call WFR to get pm schedules attached to all selected locations, and set the result to 	 'Assigned Procedures' grid.
					var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-getSchedulesForLocations', records);
					this.pmp_select.clear();
					this.pmp_select.setRecords(result.dataSet.records, result.dataSet.hasMoreRecords);

					//	ZY changed on 2010-12-06 for kb3024888, don't manually call WFR, but refresh the 'Available Procedure' grid and implicitly execute refresh WFR method
					this.pmp_list_for_rm.refresh(records);

					//Set title of Assigned Procedures panel
					if(records.length>1){
						var title = getMessage("assignedProceduresMultiLoc");
						setPanelTitle('pmp_select', title);
					}
					else{
						var title = getMessage("assignedProcedures")+records[0].getValue("rm.bl_id");
						if ( records[0].getValue("rm.fl_id") ) {
							title = title+"-"+records[0].getValue("rm.fl_id") ;
						}
						if ( records[0].getValue("rm.rm_id") ) {
							title = title+"-"+records[0].getValue("rm.rm_id");
						}
						setPanelTitle('pmp_select', title);
					}
				} 
				catch (e) {
					Workflow.handleError(e);
				}
			}
			else{ 
					// if all rows are unselected then hide Available Procedure grid and Assigned Procedures grid as well as clear them.
 					this.pmp_select.clear();
 					this.pmp_list_for_rm.clear();
					this.pmp_select.show(false);
					this.pmp_list_for_rm.show(false);
			}

			//kb3026576: disable sort for custom records set.
	        this.pmp_select.removeSorting();
	},

    /**
     * After the 'Available Procedure' grid is refreshed, set the rows which are attached to part of selected equipments to be bold style.	 
     */
	pmp_list_afterRefresh: function(){
        var assignedGrid = View.panels.get('pmp_select');
        var availGrid = View.panels.get('pmp_list');

	   //get all selected equipments
        var selEqRows = this.eq_select.getPrimaryKeysForSelectedRows();
		var eqIds = new Array();
		for (var j = 0; j < selEqRows.length; j++) {
		  eqIds.push( selEqRows[j]["eq.eq_id"]);
		}

	   //construct restriction from ids of all selected equipments
        var restriction = new Ab.view.Restriction();
		if (eqIds.length != 0) {
			restriction.addClause('pms.eq_id', eqIds, 'in');
		}else{
			restriction.addClause('pms.pmp_id', "", 'IS NULL');  
		}
				  
		//KB3033679 - use one database query to improve the performance
		//get all procedures that are attached to selected equipments
        var dataSourceGroupPms = View.dataSources.get("ds_ab-pm-asgn-procs-to-eq-hk_group_eq_pms");
		var recs = dataSourceGroupPms.getRecords(restriction);
		var pmpList = new Ext.util.MixedCollection();
		for(var i = 0; i < recs.length; i++){
			pmpList.add(recs[i].getValue('pms.pmp_id'),recs[i].getValue('pms.pmp_id'));
		}

		//loop all  procedure rows to set the ones match the condition to be bold style.
		for (var i = 0; i < availGrid.rows.length; i++) {
			var row = availGrid.rows[i];
			var pmpId = row["pmp.pmp_id"];
			var rowEl = Ext.get(row.row.dom);
			//when recs is null return;
			if (valueExists(pmpList.get(pmpId))) {
					rowEl.setStyle('font-weight', 'bold');
			}
		}
	},
 
    /**
     * After the 'Available Procedure' grid for Locations is refreshed, set the rows which are attached to part of selected locations to be bold style.	 
     */
	pmp_list_for_rm_afterRefresh: function(){
        var assignedGrid = View.panels.get('pmp_select');
        var availGrid = View.panels.get('pmp_list_for_rm');

	   //get all selected locations
        var selLocRows = this.rm_select.getSelectedRows();

	   //construct restriction from ids of all selected equipments
        var restriction = this.getPmsRestrictionFromLocations( selLocRows );
				  
		//KB3033679 - use one database query to improve the performance
		//get all procedures that are attached to selected equipments
        var dataSourceGroupPms = View.dataSources.get("ds_ab-pm-asgn-procs-to-eq-hk_group_hk_pms");
		var recs = dataSourceGroupPms.getRecords(restriction);
		var pmpList = new Ext.util.MixedCollection();
		for ( var i = 0; i < recs.length; i++ ) {
			pmpList.add( recs[i].getValue('pms.pmp_id'), recs[i].getValue('pms.pmp_id') );
		}

		//loop all  procedure rows to set the ones match the condition to be bold style.
		for (var i = 0; i < availGrid.rows.length; i++) {
			var row = availGrid.rows[i];
			var pmpId = row["pmp.pmp_id"];
			var rowEl = Ext.get(row.row.dom);
			if ( valueExists( pmpList.get(pmpId) ) )
				rowEl.setStyle('font-weight', 'bold');
		}
	},

	/**
     * After the 'Equipment' grid is refreshed, loop through all equipment rows to bold the ones assigned to procedure(s).	 
     */
    eq_select_afterRefresh: function(){
        this.boldAllGridRows(this.eq_select, "eq.is_assigned");
    },
    
    /**
     * After the 'Location' grid is refreshed, loop through all location rows to bold the ones assigned to procedure(s).	 
     */
    rm_select_afterRefresh: function(){
        this.boldAllGridRows(this.rm_select, "rm.is_assigned");
    },
    
    /**
     *Un-assign all selected procedures in the 'Assigned Procedures' grid.
     */
    pmp_select_onDeleteRecord: function(){
        var pmsGrid = View.panels.get('pmp_select');
        var rows = pmsGrid.getSelectedRows();
		//if exists selected row(s) then try to un-assign procedures 
        if (rows.length > 0) {
			if(this.pmpType == this.LocationPms){
				this.deleteLocationSchedules();
				//this.rm_select_afterRefresh();
			}
			else if(this.pmpType == this.EQPms){
				this.deleteEquipmentSchedules();
				this.eq_select_afterRefresh();
			}
        }
		//if not exist selected row(s) then alert user 
        else {
            alert(getMessage("errorSelectPMS"));
        }
    },

    /**
     * Private function: Delete PM schedules by selected equipments in 'Equipment' grid and selected procedures in 'Assigned Procedures' grid.
     */
	deleteEquipmentSchedules:function(){
		//get selected equipments
		var eqIds = this.eq_select.getPrimaryKeysForSelectedRows();

		//get selected procedures already assigned
		var pmpRecs =this.pmp_select.getSelectedRecords();
        var pmpIds = new Array();
        for (var i = 0; i < pmpRecs.length; i++) {
	        var pmpRow = new Object();
            pmpRow["pmp.pmp_id"] = pmpRecs[i].getValue("pmp.pmp_id");
			pmpIds.push(pmpRow);
		}

		if ( eqIds &&  eqIds.length )
			// if exists selected equipments
			// call a WFR to delete PM Schedules for multiple equipments and procedures, 'PreventiveMaintenanceCommonHandler.java'
			try {
				Workflow.callMethod('AbBldgOpsPM-PmEventHandler-deleteEquipmentSchedules', eqIds, pmpIds);
				this.onSelectMultipleEquipments(null);
				this.boldSelectedGridRows( this.eq_select, "eq.is_assigned");
			} 
			catch (e) {
				Workflow.handleError(e);
			}
	},

    /**
	 * Private function: Delete PM schedules by selected locations in 'Location' grid and selected procedures in 'Assigned Procedures' grid.
     */
	deleteLocationSchedules:function(){
		var locRecs = this.rm_select.getSelectedRecords();
		var pmpRecs =this.pmp_select.getSelectedRecords();

		try {			
			 Workflow.callMethod('AbBldgOpsPM-PmEventHandler-deleteLocationSchedules',locRecs, pmpRecs);
			this.onSelectMultipleLocations(null);
			this.boldSelectedGridRows( this.rm_select, "rm.is_assigned");
		} catch (e) {
				 Workflow.handleError(e);
		}
	},

    /**
     * Create new Equipment Schedules.
     */
    pmp_list_onAddNew: function(){    
        //get all rows of selected available procedures
		var rows = this.pmp_list.getSelectedRows();
        if (rows.length > 0) {
				this.createEquipmentSchedules();
        }
        else {
            alert(getMessage("errorSelectPMP"));
        }
    },
	
    /**
     * Create new PM Schedules from selected equipment(s) and selected available procedures .
     */
	createEquipmentSchedules:function(){
		//get selected available procedures
		var pmpRecs =this.pmp_list.getSelectedRecords();
        var pmpIds = new Array();
        for ( var i = 0; i < pmpRecs.length; i++ ) {
	        var pmpRow = new Object();
            pmpRow["pmp.pmp_id"] = pmpRecs[i].getValue("pmp.pmp_id");
			pmpIds.push(pmpRow);
		}

		var eqIds = this.eq_select.getPrimaryKeysForSelectedRows();
		if ( eqIds &&  eqIds.length ) {
			try {
				Workflow.callMethod('AbBldgOpsPM-PmEventHandler-addSchedulesForProceduresAndEquipments',eqIds, pmpIds);
			} 
			catch (e) {
				 Workflow.handleError(e);
			}
			this.onSelectMultipleEquipments(null);
			this.boldSelectedGridRows( this.eq_select, "eq.is_assigned");
		}
	},

    /**
     * Create new Location Schedules.
     */
    pmp_list_for_rm_onAddNew: function(){
        //get all rows of selected available procedures for location
        var rows = this.pmp_list_for_rm.getSelectedRows();
        if (rows.length > 0) {
			this.createLocationSchedules();
        }
        else {
            alert(getMessage("errorSelectPMP"));
        }
    },

    /**
     * Create new PM Schedules from selected location(s) and selected available procedures .
     */
	createLocationSchedules:function(){
		var locRecs = this.rm_select.getSelectedRecords();
		var pmpRecs =this.pmp_list_for_rm.getSelectedRecords();

		try {			
			 result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-addSchedulesForProceduresAndLoctions',locRecs, pmpRecs);
		} catch (e) {
				 Workflow.handleError(e);
		}

		this.onSelectMultipleLocations(null);
		this.boldSelectedGridRows( this.rm_select, "rm.is_assigned");
	},

    /**
     * Open a dialog to edit the pm schedule(s) in Create new Location Schedules, those schedules are retrieved by selected equipments or locations and selected assigned procedure.
     */
    pmp_select_schedule_onClick: function(row, action){
		//get the single selected procedure in 'Assigned Procedure' grid
        var record = row.getRecord();
		var pmpID = record.getValue("pmp.pmp_id");
		if (this.pmpType == this.EQPms){
			//edit equipment schedules
			var eqIds = this.eq_select.getPrimaryKeysForSelectedRows();
			var restriction = "";
			restriction = " pms.pmp_id='"+pmpID+"'";
			var restriction = new Ab.view.Restriction();
			for (var i = 0; i < eqIds.length; i++) {
				restriction.addClause('pms.eq_id', eqIds[i]["eq.eq_id"], '=', 'or');
			}              
            restriction.addClause('pms.pmp_id', pmpID, '=', ')AND(');
		}	
		else{
		   //get all selected locations	  and then get schedule restrictions 
			var selLocRows = this.rm_select.getSelectedRows();
			var restriction = this.getPmsRestrictionFromLocations( selLocRows );
			restriction	+= " and pms.pmp_id='"+pmpID+"' ";
		}
		View.resFromAsign = restriction;
		View.pmpType = this.pmpType;
		
		//Check if console enable, if true, reference new define schedule file to enable multiple storage location.
		var isConsoleEnabled=View.activityParameters['AbBldgOpsOnDemandWork-UseBldgOpsConsole'];
		if(isConsoleEnabled=='1'){
			View.openDialog('ab-pm-def-sched-mpsl.axvw');
		}else{
			View.openDialog('ab-pm-def-sched.axvw');
		}
		
    },

    /**
     * Update the style of each row in equipment or location grid panel after
     * those two grid panel are refreshed: set rows assigned to procedures to bold
     *
     * @param {Ab.Grid} grid
     * @param {String} fieldName
     */
	boldAllGridRows: function( grid, fieldName ){
		grid.gridRows.each(function(row) {
			var record = row.getRecord();
			var isAssigned = record.getValue(fieldName);

			if ( isAssigned==1 )	
				Ext.get(row.dom).setStyle('font-weight', 'bold');
			else 
				Ext.get(row.dom).setStyle('font-weight', 'normal');
			});
	},
    
    /**
     * Update the 'bold' style of the selected rows in equipment or location grid panel after	deleting or creating PM schedules.
     *
     * @param {Ab.Grid} grid
     * @param {String} fieldName
     */
	boldSelectedGridRows: function( grid, fieldName ){
		if ( grid==this.eq_select ) {
			var eqIds = this.eq_select.getPrimaryKeysForSelectedRows();
			var restriction = new Ab.view.Restriction();
			for ( var i=0; i<eqIds.length; i++ ) {
				restriction.addClause( "eq.eq_id", eqIds[i]['eq.eq_id'], "=", "OR" );
			}
			var dsEq = View.dataSources.get("ds_ab-pm-asgn-procs-to-eq-hk_show_eq");
			var records = dsEq.getRecords(restriction);
			for ( var i=0; i<grid.getSelectedRows().length; i++ ) {
				var row = grid.getSelectedRows()[i];
				for ( var i=0; i<records.length; i++ ) {
					var record = 	 records[i];
					if (  record.getValue("eq.eq_id") == row['eq.eq_id'] )	{
						var isAssigned = record.getValue(fieldName);
						if ( isAssigned==1 )	
							Ext.get(row.row.dom).setStyle('font-weight', 'bold');
						else 
							Ext.get(row.row.dom).setStyle('font-weight', 'normal');
						break;
					}
				}
			}
		}	 
		else  if ( grid==this.rm_select  ) {
			var locs = this.rm_select.getSelectedRows();
			var restriction = " 1=0 ";
			for ( var i=0; i<locs.length; i++ ) {
				restriction = restriction + this.addLocRestriction(locs[i]);
			}
			var dsLoc = View.dataSources.get("ds_ab-pm-asgn-procs-to-eq-hk_show_rm");
			var records = dsLoc.getRecords(restriction);
			for ( var i=0; i<grid.getSelectedRows().length; i++ ) {
				var row = grid.getSelectedRows()[i];
				for ( var j=0; j<records.length; j++ ) {
					var record = 	 records[j];
					if (  record.getValue("bl.site_id") == row['bl.site_id'] 
						&& record.getValue("rm.bl_id") == row['rm.bl_id'] 
						&& record.getValue("rm.fl_id") == row['rm.fl_id'] 
						&& record.getValue("rm.rm_id") == row['rm.rm_id'] )	{
						var isAssigned = record.getValue(fieldName);
						if ( isAssigned==1 )	
							Ext.get(row.row.dom).setStyle('font-weight', 'bold');
						else 
							Ext.get(row.row.dom).setStyle('font-weight', 'normal');
						break;
					}
				}
			}
		}
	},

	/**
     * Private function: Add given location to restriction.	 
     */
    addLocRestriction: function( locationRow ){
		var res = " or ( rm.bl_id='"+locationRow['rm.bl_id']+ "'  "; 

		 var siteId = locationRow['bl.site_id'];
		 if ( siteId ) {
			res = res+" and rm.site_id='" +siteId+ "'  "; 
		 }	 else {
			res =res+ "and rm.site_id is null "; 
		 }

		 var flId = locationRow['rm.fl_id'];
		 if ( flId ) {
			res += " and rm.fl_id='" +flId+ "'  "; 
		 }	 else {
			res += " and rm.fl_id is null "; 
		 }


		 var rmId = locationRow['rm.rm_id'];
		 if ( rmId ) {
			res += " and rm.rm_id='" +rmId+ "'  "; 
		 }	 else {
			res += " and rm.rm_id is null  "; 
		 }
		
		res += ") "; 
		return res;
	},

	/**
     * Private function: Clear and hide 'Available Procedures' and 'Assigned Procedures' grid.	 
     */
    updateTitleAndRefreshPmpPanel: function(){
        this.pmp_select.clear();
        this.pmp_select.show(false);
        
        this.pmp_list.clear();
        this.pmp_list.show(false);
        this.pmp_list_for_rm.clear();
        this.pmp_list_for_rm.show(false);        
    },

    /**
     * Refresh the 'Equipment' or 'Location' grid and filter them by console's restriction.	 
     */
    filterEqOrRmPanel_onShow: function(){
        var console = View.panels.get('filterEqOrRmPanel');
		var report = null;  
        // generate and apply restriction to the report
        if (this.curTab == "EQTab") {
            report = View.panels.get('eq_select');
			restriction = this.genRestrictionFromFilter(true,console);
        }
        else {
            report = View.panels.get('rm_select');
			restriction = this.genRestrictionFromFilter(false,console);
        }
        report.refresh(restriction);
        
        // show the report
        report.show(true);
        
        //update panel title and refresh two grid panel
        this.updateTitleAndRefreshPmpPanel();
    },

    /**
     * Clear filter.	 
     */
    filterEqOrRmPanel_onClear: function(){
		this.filterEqOrRmPanel.clear();
		document.getElementById('no_proc').checked=false;
	},

    /**
     * Private function: construct the restriction from filter for restricting Equipment or Location grid.	 
     */
    genRestrictionFromFilter:function(isEq, console){
		var restriction = " 1=1 ";
		var proRes = null;
		if(document.getElementById('no_proc').checked){
			if (isEq) {
				restriction +=" AND NOT EXISTS (SELECT 1 FROM pms WHERE pms.eq_id = eq.eq_id) ";
			}
			else{
				restriction +=" AND NOT EXISTS (SELECT 1 FROM pms WHERE pms.rm_id = rm.rm_id AND  pms.bl_id = rm.bl_id AND  pms.fl_id = rm.fl_id ) ";
				restriction +=" AND NOT EXISTS (SELECT 1 FROM pms WHERE pms.rm_id IS NULL AND  pms.bl_id = rm.bl_id AND  pms.fl_id = rm.fl_id AND rm.rm_id IS NULL) ";
				restriction +=" AND NOT EXISTS (SELECT 1 FROM pms WHERE pms.rm_id IS NULL AND  pms.bl_id = rm.bl_id AND  pms.fl_id IS NULL AND rm.rm_id IS NULL AND rm.fl_id IS NULL ) ";
			}
		}

		var bl_id = console.getFieldValue('eq.bl_id');
		if (bl_id) {
			if (isEq) {
				restriction += " AND eq.bl_id='" +	bl_id +"' ";
			}
			else{
				restriction += " AND rm.bl_id='" +	bl_id +"' ";
			}
		}

        var fl_id = console.getFieldValue('eq.fl_id');
		if (fl_id) {
			if (isEq) {
				restriction += " AND eq.fl_id='" +	fl_id +"' ";
			}
			else{
				restriction += " AND rm.fl_id='" +	fl_id +"' ";
			}
		}

        var rm_id = console.getFieldValue('eq.rm_id');
		if (rm_id) {
			if (isEq) {
				restriction += " AND eq.rm_id='" +	rm_id +"' ";
			}
			else{
				restriction += " AND rm.rm_id='" +	rm_id +"' ";
			}
		}

		var eq_std = console.getFieldValue('eq.eq_std');
		if (eq_std) {
			if (isEq) {
				restriction += " AND eq.eq_std='" +	eq_std +"' ";
			}
		}
		return restriction;
	},

    /**
     * Private function: construct the restriction from selected location rows for schedules.	 
     */
    getPmsRestrictionFromLocations:function(locRows){
	   //construct restriction from ids of all selected equipments
        var restriction = " pms.eq_id is null ";
		if ( locRows.length != 0 ) {
			restriction = restriction+" and (";
			for ( var i = 0; i < locRows.length; i++ ) {
				if ( i>0 )
					restriction	+=" or ";
				var row = locRows[i];
				restriction = restriction+" pms.bl_id='" +row['rm.bl_id']+ "'  "; 

				var siteId = row['bl.site_id'];
				 if ( siteId ) {
					restriction = restriction+" and pms.site_id='" +siteId+ "'  "; 
				 }	 else {
					restriction =restriction+ "and pms.site_id is null "; 
				 }

				 var flId = row ['rm.fl_id'];
				 if ( flId ) {
					restriction += " and pms.fl_id='" +flId+ "'  "; 
				 }	 else {
					restriction += " and pms.fl_id is null "; 
				 }

				 var rmId = row['rm.rm_id'];
				 if ( rmId ) {
					restriction += " and pms.rm_id='" +rmId+ "'  "; 
				 }	 else {
					restriction += " and pms.rm_id is null  "; 
				 }
			}
			restriction	+=" ) ";
		} else {
			restriction+= " and pms.pmp_id IS NULL";  
		}
		return 	restriction;
	}
});