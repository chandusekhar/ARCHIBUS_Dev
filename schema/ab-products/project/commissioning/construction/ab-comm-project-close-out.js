var commProjectCloseOutController = View.createController('commProjectCloseOut', {
	project_id : '',
	
	afterViewLoad : function() {
		this.inherit();
		
		this.commProjectCloseOut_gridPackages.afterCreateCellContent = function(row, column, cellElement) {
        	var pct_complete = row['work_pkgs.pct_complete'];
			if (pct_complete < 75)	{
				cellElement.style.background = '#FF8B73';//Red
			}
			else if (pct_complete >= 100) {
				cellElement.style.background = '#8BEA00';//Green
			}
			else {
				cellElement.style.background = '#FFE773';//Yellow
			}
        }
		
		this.commProjectCloseOut_gridTypes.afterCreateCellContent = function(row, column, cellElement) {
        	var pct_complete = row['activity_log.percent_complete'];
			if (pct_complete < 75)	{
				cellElement.style.background = '#FF8B73';//Red
			}
			else if (pct_complete >= 100) {
				cellElement.style.background = '#8BEA00';//Green
			}
			else {
				cellElement.style.background = '#FFE773';//Yellow
			}
        }
	},
	
	commProjectCloseOut_console_onClear : function() {
		this.commProjectCloseOut_console.clear();
	},
	
	commProjectCloseOut_console_onFilter : function() {
		var restriction = this.commProjectCloseOut_console.getFieldRestriction();
		this.commProjectCloseOutTabs.selectTab('commProjectCloseOut_page1', restriction);
		
		this.project_id = this.commProjectCloseOut_console.getFieldValue('work_pkgs.project_id');
		var title = '';
		if (this.project_id) title = getMessage('projectCode') + ": " + this.project_id;
		this.commProjectCloseOut_gridPackages.appendTitle(title);
	},
	
	commProjectCloseOut_gridPackages_onEditPackage : function(row, action) {
		var project_id = row.record['activity_log.project_id'];
		var work_pkg_id = row.record['activity_log.work_pkg_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', project_id);
		restriction.addClause('activity_log.work_pkg_id', work_pkg_id);
		
		this.commProjectCloseOut_formPackage.refresh(restriction);
		this.commProjectCloseOut_formPackage.showInWindow({
		    width: 600,
		    height: 500
		});
	},
	
	commProjectCloseOut_gridPackages_onSelectPackage : function(row) {
		var project_id = row.record['activity_log.project_id'];
		var work_pkg_id = row.record['activity_log.work_pkg_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', project_id);
		restriction.addClause('activity_log.work_pkg_id', work_pkg_id);
		this.commProjectCloseOutTabs.selectTab('commProjectCloseOut_page2', restriction);
		
		var title = getMessage('projectCode') + ": " + project_id + " - " + getMessage('package') + ": " + work_pkg_id;
		this.commProjectCloseOut_gridTypes.appendTitle(title);
	},
	
	commProjectCloseOut_gridTypes_onSelectType : function(row) {
		var activity_type = row.record['activity_log.activity_type'];
		var restriction = this.commProjectCloseOut_gridTypes.restriction;
		restriction.addClause('activity_log.activity_type', activity_type);
		this.commProjectCloseOutTabs.selectTab('commProjectCloseOut_page3', restriction);
		
		var project_id = restriction.findClause('activity_log.project_id').value;
		var work_pkg_id = restriction.findClause('activity_log.work_pkg_id').value;
		var title = getMessage('projectCode') + ": " + project_id + " - " + getMessage('package') + ": " + work_pkg_id + " - " + getMessage('type') + ": " + activity_type;
		this.commProjectCloseOut_gridItems.appendTitle(title);
	}
});

function getValidValue(fieldValue)
{
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}
