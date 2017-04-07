/**
 * Controller for the Craftperson Edit.
 */
var assingTeamsToCfCtrl = View.createController('assingTeamsToCfCtrl', {

	/**
	 * Maps DOM events to event listeners.
	 */
	events : {

		/**
		 * Event handler for Indicate on Drawing.
		 * 
		 * @param event
		 */
		"click input[type=radio][id^=assignedTeams_row]" : 'setMainTeam'

	},

	cfId : null,

	afterInitialDataFetch : function() {
		this.cfId = View.getOpenerView().currentCfId;
		this.refreshGrids();
		View.setTitle(getMessage('viewTitle')+" " + this.cfId)
	},

	refreshGrids : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('cf_work_team.cf_id', this.cfId);
		this.assignedTeams.refresh(restriction);
		this.availableTeams.refresh("not exists(select 1 from cf_work_team where cf_work_team.work_team_id= work_team.work_team_id and cf_work_team.cf_id='" + this.cfId.replace(/\'/g, "''") + "')")
	},

	assignedTeams_afterRefresh : function() {
		this.markMainTeam();
	},

	markMainTeam : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('cf.cf_id', this.cfId);
		var cfRecord = this.cfQueryDS.getRecord(restriction);
		var mainTeam = cfRecord.getValue('cf.work_team_id');
		if (mainTeam) {
			this.assignedTeams.gridRows.each(function(row) {
				var team = row.getRecord().getValue('cf_work_team.work_team_id');
				if (team == mainTeam) {
					$('assignedTeams_row' + row.getIndex() + '_setMainTeam').checked = true;
				} else {
					$('assignedTeams_row' + row.getIndex() + '_setMainTeam').checked = false;
				}
			});
		}
	},

	availableTeams_onAssign : function() {
		var teams = this.availableTeams.getSelectedRecords();
		if (teams.length > 0) {
			for ( var i = 0; i < teams.length; i++) {
				var team = teams[i].getValue('work_team.work_team_id');
				// create new employee record with same user_name
				record = new Ab.data.Record();
				record.setValue('cf_work_team.work_team_id', team);
				record.setValue('cf_work_team.cf_id', this.cfId);
				this.cfWorkTeamDS.saveRecord(record);
			}

			this.refreshGrids();
			this.autoSetMainTeam();
			this.refreshParentView();
		}
	},

	setMainTeam : function() {
		View.confirm(getMessage('confirmChangeMainTeam'), function(button) {
			if (button == 'yes') {
				var grid = assingTeamsToCfCtrl.assignedTeams;
				var rowIndex = grid.selectedRowIndex;
				var team = grid.gridRows.get(rowIndex).getFieldValue('cf_work_team.work_team_id');
				var cfDS = View.dataSources.get('cfQueryDS');
				var record = new Ab.data.Record({
					"cf.cf_id" : assingTeamsToCfCtrl.cfId,
					"cf.work_team_id" : team
				}, false);
				record.oldValues = {
					"cf.cf_id" : assingTeamsToCfCtrl.cfId,
					"cf.work_team_id" : ''
				};
				cfDS.saveRecord(record);
				assingTeamsToCfCtrl.refreshParentView();
			} else {
				assingTeamsToCfCtrl.markMainTeam();
			}
		});
	},

	autoSetMainTeam : function() {
		var cfDS = View.dataSources.get('cfQueryDS');
		var restriction = "cf.cf_id = '" + this.cfId + "'" + " AND (cf.work_team_id IS NULL or not exists(select 1 from cf_work_team where cf_work_team.cf_id = cf.cf_id and cf_work_team.work_team_id = cf.work_team_id))"
		var records = cfDS.getRecords(restriction);
		if (records.length > 0) {
			if (this.assignedTeams.gridRows.length > 0) {
				records[0].setValue("cf.work_team_id", this.assignedTeams.gridRows.get(0).getFieldValue('cf_work_team.work_team_id'));
				records[0].isNew = false;
				cfDS.saveRecord(records[0]);
				this.markMainTeam()
			} else {
				records[0].setValue("cf.work_team_id", '');
				records[0].isNew = false;
				cfDS.saveRecord(records[0]);
			}
		}
	},

	refreshParentView : function() {
		var openerView = View.getOpenerView();
		openerView.panels.get('treePanel').refresh();
		openerView.panels.get('detailsPanel').refresh();
	}

});

function afterUnAssign() {
	assingTeamsToCfCtrl.refreshGrids();
	assingTeamsToCfCtrl.autoSetMainTeam();
	assingTeamsToCfCtrl.refreshParentView();
}
