var abSpPfolioMarkItemCtrl = View.createController('abSpPfolioMarkItemCtrl', {
    events: {
        'click input[type=checkbox]': function() {
            this.abSpPfolioMarkItemConsole_onCheckBoxClicked();
        }
    },
	
	scenarioId: '',
	scenarioName: '',
							   
	projectId: null,

	actionId:"",
	blId:"",
	flId:"",
			
	afterViewLoad: function(){
		if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
			this.callback = View.parameters.callback;
			this.scenarioId = View.parameters.scenarioId;
			this.scenarioName = View.parameters.scenarioName;
			this.blId = View.parameters.blId;
			this.flId = View.parameters.flId;
		}	 	
	},
	
	afterInitialDataFetch: function(){
		this.initialProject();
		this.abSpPfolioMarkItemConsole.setFieldValue('fl.bl_id', this.blId);
		this.abSpPfolioMarkItemConsole.setFieldValue('fl.fl_id', this.flId);
		this.abSpPfolioMarkItemConsole_onShow();
	},

	/*
	*Detect if a project exists that is linked to the scenario (portfolio_scenario.portfolio_scenario_id = project.project_id).  If there is not, then the application will automatically create a project.
	*/
	initialProject: function(){
		var projRestriction = new Ab.view.Restriction();
		projRestriction.addClause('project.project_name', this.scenarioName, '=');

		var records = this.abSpPfolioProjectDS.getRecords(projRestriction);
		if (records.length==0) {
			var scenarioRestriction = new Ab.view.Restriction();
			scenarioRestriction.addClause('portfolio_scenario.portfolio_scenario_id', this.scenarioId, '=');
			var scenarioRecord = this.abSpPfolioDS.getRecord(scenarioRestriction);
            var newRecord = new Ab.data.Record({
                    'project.project_id' : this.scenarioId.toUpperCase(),
                    'project.project_name' : scenarioRecord.getValue('portfolio_scenario.scn_name'),
                    'project.requestor' : Ab.view.View.user.employee.id,
                    'project.contact_id' : 'TBD',
                    'project.project_type' : 'N/A',
                    'project.status' : 'Proposed'
                    }, true);
			this.abSpPfolioProjectDS.saveRecord(newRecord);
			this.projectId = this.scenarioId.toUpperCase();
		}
		else {
			if (records.length==1){
				this.projectId = records[0].getValue("project.project_id");
			}	
			else {
				this.abSpPfolioMarkItemGrid.show(false);
				// get dropdown list by itemSelectId
				var itemSelect = $("projectId");
				//populate select items to dropdown list and set default value
				itemSelect.innerHTML = '';
				for (var i = 0; i < records.length; i++) {
					var item = records[i];
					var option = document.createElement('option');
					option.value = item.getValue("project.project_id");
					option.appendChild(document.createTextNode(item.getValue("project.project_id")));
					itemSelect.appendChild(option);
				}
				//set default value to dropdown list
				itemSelect.options[0].setAttribute('selected', true);
				this.abSpAllocProjectSelectDialog.showInWindow({
					x: 500, 
					y: 200,
					modal: true,
					width: 600,
					height: 100
				});
			}
		}
	},

	abSpAllocProjectSelectDialog_onSave: function(){
		this.projectId =  $("projectId").value;
    	this.abSpAllocProjectSelectDialog.closeWindow();
		this.abSpPfolioMarkItemConsole_onShow();
	},

	abSpPfolioMarkItemConsole_onShow: function(){
		var restriction = this.abSpPfolioMarkItemConsole.getFieldRestriction();
		restriction.addClause("activity_log.project_id", this.projectId);
		this.abSpPfolioMarkItemGrid.refresh(restriction);
	},

	abSpPfolioMarkItemConsole_onCheckBoxClicked: function(){
		var isFloorNotRequired = $('noFloor').checked;
		if (isFloorNotRequired==true)	{
			this.abSpPfolioMarkItemConsole.clear();
			this.abSpPfolioMarkItemConsole.enableField("fl.bl_id", false);
			this.abSpPfolioMarkItemConsole.enableField("fl.fl_id", false);
			this.abSpPfolioMarkItemConsole_onShow();
		} 
		else {
			this.abSpPfolioMarkItemConsole.enableField("fl.bl_id", true);
			this.abSpPfolioMarkItemConsole.enableField("fl.fl_id", true);
		}
	},

	abSpPfolioMarkItemGrid_afterRefresh: function(){
		var me = this;
		var grid = this.abSpPfolioMarkItemGrid;
		grid.gridRows.each(function(row) {
			var hadRedline = row.getRecord().getValue('activity_log.hadRedline');
			if (hadRedline==1) {
				row.actions.get("markUp").setTitle(getMessage("edit")); 
			}
			else {
				row.actions.get("markUp").setTitle(getMessage("create")); 
				row.actions.get("delete").show(false);
			}
		});		
	},

	abSpPfolioMarkItemGrid_markUp_onClick: function(row){
		this.actionId= row.record["activity_log.activity_log_id.key"];
		this.blId = row.record["activity_log.bl_id"];
		this.flId = row.record["activity_log.fl_id"];
		
		this.openMarkUpDialog();
	},

	abSpPfolioMarkItemGrid_onAddNew: function(){
		this.abSpPfolioMarkItemForm.refresh(null, true);
		var blId = this.abSpPfolioMarkItemConsole.getFieldValue('fl.bl_id');
		var flId =  this.abSpPfolioMarkItemConsole.getFieldValue('fl.fl_id');
		this.abSpPfolioMarkItemForm.setFieldValue("activity_log.bl_id",blId);	
		this.abSpPfolioMarkItemForm.setFieldValue("activity_log.fl_id",flId);	
		this.abSpPfolioMarkItemForm.showInWindow( {x: 400, y: 200, width: 800, height: 600, title: getMessage("add"), modal: true});
	},		
		
	abSpPfolioMarkItemForm_onSave: function(){
		this.abSpPfolioMarkItemForm.setFieldValue("activity_log.project_id", this.projectId);

		var isCreateNew = this.abSpPfolioMarkItemForm.newRecord;

		if ( !this.checkExistingFloor() ) {
			View.alert(getMessage('noExistingFloor'));
			return false;
		}

		if (this.abSpPfolioMarkItemForm.canSave()){
			var result = this.abSpPfolioMarkItemDS.saveRecord(this.abSpPfolioMarkItemForm.getRecord());
			this.abSpPfolioMarkItemForm.closeWindow();
			//after saving a new action item, directly open the mark up view.
			if (isCreateNew){
				var restriction =  "activity_log_id="+result.getValue("activity_log.activity_log_id");
				var record = this.abSpPfolioMarkItemDS.getRecords(restriction)[0]; 
				this.openMarkUpView(result.getValue("activity_log.activity_log_id"), this.abSpPfolioMarkItemForm.getFieldValue("activity_log.bl_id"), this.abSpPfolioMarkItemForm.getFieldValue("activity_log.fl_id"));
			}
			this.abSpPfolioMarkItemGrid.refresh();
		}
	},

	checkExistingFloor: function(){
		var blId = this.abSpPfolioMarkItemForm.getFieldValue('activity_log.bl_id');
		var flId = this.abSpPfolioMarkItemForm.getFieldValue('activity_log.fl_id');
		if ( !blId && !flId ) {
			return true;
		}
		else {
			var restriction = new Ab.view.Restriction();
			if ( blId ) {
				restriction.addClause('fl.bl_id', blId, '=');
			}
			if ( flId ) {
				restriction.addClause('fl.fl_id', flId, '=');
			}
			var records = this.abSpPfolioMarkItemConsoleDS.getRecords(restriction);
			if ( !records || records.length==0 ) {
				return false ;
			} 
			else {
				return true;
			}
		}
	},

	openMarkUpView: function(actionId, blId, flId){
		this.actionId= actionId;
		this.blId = blId;
		this.flId = flId;
		this.openMarkUpDialog();
	},

	openMarkUpDialog: function(){
		var me = this;
		View.openDialog('ab-sp-pfolio-mark-act-item-svg.axvw', null, true, {
			maximize: true, 
			closeButton:false,
			callback: function(){
				View.closeDialog();
				me.abSpPfolioMarkItemGrid.refresh();
			}
		});
	}
});