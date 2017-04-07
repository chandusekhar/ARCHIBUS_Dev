
/**
 * Controller for creating move orders from proposed moves of portfolio.
 *
 * Added by ZY for Bali5, 2015-11-16.
 */
var abSpProposedMovesCreateWoCtrl = View.createController('abSpProposedMovesCreateWoCtrl', {	
	groupOption: null,

	gridForShow: null,

	portfolioResatriction: null,
	
	selectedRow: null,

	createdForNone: false,

	events: {		
		"click #eventDate": function() {
			this.showGroupMovesGrid('eventDate');
		},
		
		"click #eventDateOrg": function() {
			this.showGroupMovesGrid('eventDateOrg');
		},
		
		"click #org": function() {
			this.showGroupMovesGrid('org');
		},

		"click #date": function() {
			this.showGroupMovesGrid('date');
		},
		
		"click #none": function() {
			this.showGroupMovesGrid('none');
		},
			
		"click #createMoveOrder": function() {
			this.createMoveOrdersForNoneGroup();
		}
	},
	
	/**
	 * Displaying the correct form according to the type.
	 */
	afterInitialDataFetch: function() {
		this.refreshAllGrids();
		this.showGroupMovesGrid('eventDate');
	},
						 
	afterViewLoad: function(){
		if ( valueExists(View.parameters.portfolioResatriction) ) {
			this.portfolioResatriction = View.parameters.portfolioResatriction;
		}
	},

	/**
	 * On the view load, firstly refresh all grids.
	 */
	refreshAllGrids: function() {
		this.event_date_org_moveGroupsGrid.refresh(this.portfolioResatriction);
		this.event_date_moveGroupsGrid.refresh(this.portfolioResatriction);
		this.org_moveGroupsGrid.refresh(this.portfolioResatriction);
		this.none_moveGroupsGrid.refresh(this.portfolioResatriction);
		this.date_moveGroupsGrid.refresh(this.portfolioResatriction);
	},

	/**
	 * Set values for the unavailable group record.
	 */
	showGroupMovesGrid: function(option) {
		this.groupOption = option;

		this.event_date_org_moveGroupsGrid.show(false);
		this.event_date_moveGroupsGrid.show(false);
		this.org_moveGroupsGrid.show(false);
		this.none_moveGroupsGrid.show(false);
		this.date_moveGroupsGrid.show(false);
		jQuery("#createMoveOrder").addClass("x-hide-display");

		if ( 'eventDate'==option ) {
			this.gridForShow = this.event_date_moveGroupsGrid;
			this.event_date_moveGroupsGrid.show(true);
		} 
		else if ('eventDateOrg'==option)	{
			this.gridForShow = this.event_date_org_moveGroupsGrid;
			this.event_date_org_moveGroupsGrid.show(true);
		}
		else if ('date'==option)	{
			this.gridForShow = this.date_moveGroupsGrid;
			this.date_moveGroupsGrid.show(true);
		}
		else if ('org'==option)	{
			this.gridForShow = this.org_moveGroupsGrid;
			this.org_moveGroupsGrid.show(true);
		}
		else if ('none'==option)	{
			this.gridForShow = null;
			if ( !this.createdForNone ) {
				jQuery("#createMoveOrder").removeClass("x-hide-display");
			}
		}
	},

	createGroupMoveOrderForm_afterRefresh: function(){
		if ( this.groupOption ) {
			//TODO:  Building Code can be filled by the From Location if the set of group move orders all have the same From Location (building)
			var restriction = this.gridForShow.restriction;

			if  ('none'!=this.groupOption ){
				var row = this.gridForShow.gridRows.get(this.gridForShow.selectedRowIndex);
				this.selectedRow = row;
				if ( 'eventDate'==this.groupOption ||  'eventDateOrg'==this.groupOption || 'date'==this.groupOption ) {
					var dateStart = row.record["gp.date_start"];
					this.createGroupMoveOrderForm.setFieldValue("project.date_start", dateStart);
					if ( dateStart ) {
						restriction+=" and ${sql.yearMonthDayOf('gp.date_start')}='"+getDateWithISOFormat(dateStart)+"' ";
					} else {
						restriction+=" and gp.date_start is null ";
					}
				}

				if ( 'eventDate'==this.groupOption ||  'eventDateOrg'==this.groupOption ) {
					var eventName = row.getFieldValue("gp.event_name");
					this.createGroupMoveOrderForm.setFieldValue("project.description", eventName);
					restriction+=" and gp.event_name='"+eventName+"' ";
				}
				
				if ( 'eventDateOrg'==this.groupOption ||  'org'==this.groupOption ) {
					var org = row.getFieldValue("gp.org");
					restriction+= " and (case when portfolio_scenario.scn_level='bu' then gp.planning_bu_id "
													+" when portfolio_scenario.scn_level='dv' then gp.dv_id  "
													+" when portfolio_scenario.scn_level='dp' then gp.dv_id ${sql.concat}'-'${sql.concat} gp.dp_id " 
													+" else gp.dv_id ${sql.concat}'-'${sql.concat} gp.dp_id end)='"
													+org+"'";
				} 

				this.setInitialRequestStartDate(restriction);
				this.setInitialLocation(restriction);
			}

			this.setInitialProjectDescription(restriction);
		}
	},

	setInitialLocation: function(restriction){
		var records = this.groupDS.getRecords(restriction);
		if ( records && records.length>0 ) {
			var blId = records[0].getValue('gp.fromBl');
			var isSameBl = true;
			for ( var i=1; i<records.length; i++ ){
				if ( isSameBl && records[i].getValue('gp.fromBl')!= blId) {
					isSameBl = false;
				}		
			}

			if (isSameBl) {
				this.createGroupMoveOrderForm.setFieldValue("project.bl_id", blId);
			}
		}		
	},

	setInitialProjectDescription: function(restriction){
		var records = this.groupDS.getRecords(restriction);
		if ( records && records.length>0 ) {
			var eventName = records[0].getValue('gp.event_name');
			var isSameEvent = true;
			for ( var i=1; i<records.length; i++ ){
				if ( isSameEvent && records[i].getValue('gp.event_name')!= eventName) {
					isSameEvent = false;
				}		
			}

			if (isSameEvent) {
				this.createGroupMoveOrderForm.setFieldValue("project.description", eventName);
			}
		}		
	},

	setInitialRequestStartDate: function(restriction){
		var records = this.groupDS.getRecords(restriction);
		if ( records && records.length>0 ) {
			var startDate = records[0].getValue('gp.date_start');
			var isSameDate = true;
			for ( var i=1; i<records.length; i++ ){
				if ( isSameDate && records[i].getValue('gp.date_start').getTime()!= startDate.getTime() ) {
					isSameDate = false;
				}		
			}

			if (isSameDate) {
				this.createGroupMoveOrderForm.setFieldValue("project.date_start", getIsoFormatDate(startDate));
			}
		}		
	},

	createMoveOrdersForNoneGroup: function(){
		this.createGroupMoveOrderForm.clear();
		this.setInitialRequestStartDate(this.portfolioResatriction);
		this.setInitialProjectDescription(this.portfolioResatriction);
		this.setInitialLocation(this.portfolioResatriction);

		this.createGroupMoveOrderForm.showInWindow({
			x: 500, 
			y: 200,
			modal: true,
			newRecord: true,
			closeButton: false,
			buttonsPosition: "top", 
			width: 600,
			height: 400
		});
	},

	/**
	 * Handle the click event of OK button in view.
	 */
	onCreateGroupMoveOrder: function() {
		var me = this; 
		//get all license
		AdminService.getProgramLicense({
			callback: function(license) {
				var licenseIds = [];
				var licenses = license.licenses;
				
				//check AbBldgOpsHelpDesk license
				for(i in licenses){
					licenseIds.push(licenses[i].id);
					if(licenses[i].enabled && ( licenses[i].id == 'AbMoveManagement' || licenses[i].id == 'AbMove') ){
						me.saveGroupMoveOrder();
						return true;
					}
				}

				View.alert(getMessage('noMoveLicense'));
				return false;
			},				
			errorHandler: function(m, e) {
				View.showException(e);
			}
		});
	},
	
	/**
	 * Handle the click event of OK button in view.
	 */
	saveGroupMoveOrder: function() {
		if (this.createGroupMoveOrderForm.canSave()) {
			//Validate the dates
			var startDate = this.createGroupMoveOrderForm.getFieldValue('project.date_start');
			var endDate = this.createGroupMoveOrderForm.getFieldValue('project.date_end');
			if (startDate > endDate) {
				View.alert(getMessage('wrongDates'));
				return false;
			}
			var projectCode = this.createGroupMoveOrderForm.getFieldValue("project.project_id");
			var restriction = new Ab.view.Restriction();
			restriction.addClause('project.project_id', projectCode, '=');
			var records = this.createGroupMoveOrderDs.getRecords(restriction);
			if (records.length > 0) {
				View.alert(getMessage('project') + " " + projectCode +" "+ getMessage('projetAlreadyExists'));
				return false;
			}
			var groupMoveOrder = this.constructGroupMoveOrder();

			var pendingAssignments = this.constructMoveOrderPendingAssignments();
			
			try {
				Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-insertMoProjectRecordsFromPendingAssignments", groupMoveOrder, pendingAssignments);

				 if ('none'==this.groupOption)	{
					jQuery("#createMoveOrder").addClass("x-hide-display");
					this.createdForNone = true;
				 } 
				 else {
					this.selectedRow.actions.get('create').enable(false);
				 }
				var confirmMessages= getMessage('created');
				View.alert(confirmMessages);
				return true;
			}catch(e) {
				Workflow.handleError(e);
				return false;
			}
		}
	},	

	/**
	 * Create group order json object to be passed to WFR 'insertMoProjectRecordsFromPendingAssignments'.
	 */
	constructGroupMoveOrder: function() {
		
		var groupMoveOrder = {};
		groupMoveOrder['project_id'] = this.createGroupMoveOrderForm.getFieldValue("project.project_id");
		groupMoveOrder['description'] = this.createGroupMoveOrderForm.getFieldValue("project.description");
		groupMoveOrder['bl_id'] = this.createGroupMoveOrderForm.getFieldValue("project.bl_id");
		groupMoveOrder['dept_contact'] = this.createGroupMoveOrderForm.getFieldValue("project.dept_contact");
		groupMoveOrder['requestor'] = this.createGroupMoveOrderForm.getFieldValue("project.requestor");
		groupMoveOrder['date_start'] = this.createGroupMoveOrderForm.getFieldValue("project.date_start");
		groupMoveOrder['date_end'] = this.createGroupMoveOrderForm.getFieldValue("project.date_end");
		groupMoveOrder['contact_id'] = this.createGroupMoveOrderForm.getFieldValue("project.contact_id");
		groupMoveOrder['project_type'] = this.createGroupMoveOrderForm.getFieldValue("project.project_type");
		
		return groupMoveOrder;
	},
	
	/**
	 * Create pending assignments for group move orders.
	 */
	constructMoveOrderPendingAssignments: function() {
		var emRecords = null;
		if ( this.groupOption ) {
			var gpRestriction = this.portfolioResatriction;
			if ( 'eventDate'==this.groupOption || 'eventDateOrg'==this.groupOption || 'date'==this.groupOption ) {
				var dateStart = this.createGroupMoveOrderForm.getFieldValue("project.date_start");
				gpRestriction = gpRestriction + " 	AND ${sql.yearMonthDayOf('gp.date_start')} ='" + dateStart + "' ";
			} 

			if ( 'eventDate'==this.groupOption ||  'eventDateOrg'==this.groupOption ) {
				var eventName = this.selectedRow.getFieldValue('gp.event_name');
				gpRestriction = gpRestriction + " 	AND gp.event_name='" + eventName + "' ";
			}

			if ( 'eventDateOrg'==this.groupOption ||  'org'==this.groupOption ) {
				var org = this.selectedRow.getFieldValue('gp.org');
				gpRestriction+= " and (case when portfolio_scenario.scn_level='bu' then gp.planning_bu_id "
												+" when portfolio_scenario.scn_level='dv' then gp.dv_id  "
												+" when portfolio_scenario.scn_level='dp' then gp.dv_id ${sql.concat}'-'${sql.concat} gp.dp_id " 
												+" else gp.dv_id ${sql.concat}'-'${sql.concat} gp.dp_id end)='"
												+org+"'";
			} 

			this.gpEmDs.addParameter('gpRestriction', gpRestriction); 
			emRecords = this.gpEmDs.getRecords();
		}

		return this.convertRecordsToAssignments(emRecords);
	}, 

	convertRecordsToAssignments: function(emRecords) {
		var assignments = [];
		if ( emRecords )	{
			for ( var i=0; i < emRecords.length; i++ ) {
				var emRecord = emRecords[i];

				var record = {};
				record['from_bl_id'] = emRecord.getValue('em.from_bl_id');
				record['from_fl_id'] = emRecord.getValue('em.from_fl_id');
				record['from_rm_id'] = emRecord.getValue('em.from_rm_id');
				record['to_fl_id'] = emRecord.getValue('em.to_fl_id');
				record['to_bl_id'] = emRecord.getValue('em.to_bl_id');
				record['em_id'] = emRecord.getValue('em.em_id');
				
				var foundEm = false;
				for ( var j=0; j<assignments.length; j++ ) {
					if ( record['em_id']===assignments[j]['em_id'] ) {
						foundEm = true;
						if ( record['to_bl_id']!=assignments[j]['to_bl_id'] ) {
							assignments[j]['to_bl_id']=""; 
						}
						if ( record['to_fl_id']!=assignments[j]['to_fl_id'] ) {
							assignments[j]['to_fl_id']=""; 
						}
						break;
					}
				}
				if ( !foundEm ) {
					assignments.push(record);
				} 
			}
		}

		return assignments;
	}
});