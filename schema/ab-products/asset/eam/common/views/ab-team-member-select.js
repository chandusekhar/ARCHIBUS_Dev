View.createController('teamSelectMemberController', {
    callbackMethod: null,
    afterViewLoad: function () {
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)) {
            this.callbackMethod = this.view.parameters.callback;
        }
    },
    onSelectRowRecord: function(sourceTable, record) {
        if(valueExists(this.callbackMethod)){
            this.callbackMethod(sourceTable, record);
        }
        
    }
});

function selectMember(context) {
	var parentPanel = View.panels.get(context.command.parentPanelId);
	var sourceTable = View.dataSources.get(parentPanel.config.dataSourceId).mainTableName;
	var selectedRecord = parentPanel.gridRows.get(parentPanel.selectedRowIndex).getRecord();
	View.controllers.get('teamSelectMemberController').onSelectRowRecord(sourceTable, selectedRecord);
}