/**
 * Added for 22.1 Compliance and Building Operations Integration: Compliance Work History report - Service Tab.
 */
var abAllocDefSpReqSelCtrl = View.createController('abAllocDefSpReqSelCtrl', {

	abAllocDefSpReqSelConsole_onShow: function(){
		var restriction = new Ab.view.Restriction();
		var sbLevel = this.abAllocDefSpReqSelConsole.getFieldValue("sb.sb_level");
		if ( sbLevel ) {
			restriction.addClause('sb.sb_level', sbLevel);
		}

		var isShowRequirement = $('showRequirement').checked;
		var isShowForecast = $('showForecast').checked;
		if ( isShowRequirement && !isShowForecast )	{
			restriction.addClause('sb.sb_type', "Space Requirements");
		} 
		else if ( !isShowRequirement && isShowForecast ) {
			restriction.addClause('sb.sb_type', "Space Forecast");
		}

		this.abAllocDefSpReqSelGrid.refresh(restriction);
	},

	onAddNewRequirement: function(){
		this.openNewDialog("Space Requirements", getMessage('titleCreateReq'));
	},

	onAddNewForecast: function(){
		this.openNewDialog("Space Forecast", getMessage('titleCreateFor'));
	},

	openNewDialog: function(sbType, newTitle){
		var me = this;
		var texts = {};
		texts.newTitle = newTitle;
		texts.helpTextForLevel = getMessage('helpTextForLevel');
		texts.helpTextForAlloc = getMessage('helpTextForAlloc');
		texts.helpTextForLoc = getMessage('helpTextForLoc');
		this.texts = 	texts;
		this.sbType = sbType;

		View.openDialog('ab-eam-define-sb.axvw', null, true, {
			title: newTitle,
			width: 800,
			height:630,
			closeButton:false,
			callback: function(sbName){
				View.closeDialog();
				me.abAllocDefSpReqSelGrid.refresh();
				me.showEditTab(sbName);
			}
		});
	},

	abAllocDefSpReqSelGrid_delete_onClick: function(row){
		var confirmMessage = getMessage("messageConfirmDelete")+" "+row.record['sb.sb_name']+".";
		var me = this;

		//add confirm when on delete.
		View.confirm(confirmMessage, function(button){

			if (button == 'yes') {
				try{
					var result  = Workflow.callMethod("AbRPLMGroupSpaceAllocation-PortfolioForecastingService-deleteSpaceRequirement",row.record['sb.sb_name']);
				}catch(e){
					
					Workflow.handleError(e);
					return false;
				}
				me.abAllocDefSpReqSelGrid.refresh();
			}
		});
	},

	storeSbName: function(){
		var row = this.abAllocDefSpReqSelGrid.rows[this.abAllocDefSpReqSelGrid.selectedRowIndex];
		View.parentTab.parentPanel.scnName = row['sb.sb_name'];
	},

	showEditTab: function(sbName){
		View.parentTab.parentPanel.scnName = sbName;		
		View.parentTab.parentPanel.selectTab('editRequirement');	
	}
});

