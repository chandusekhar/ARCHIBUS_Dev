function createHPatternsRmstdNoSort(){
	try {
		var parameters = {
			tableName : 'rmstd',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsRmstdNoSortOnlyColors (){
	try {
		var parameters = {
			tableName : 'rmstd',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : true,
			sortField : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}


function createHPatternsLegendBitmaps(){
	try {
		var parameters = {
			tableName : 'rmstd',
			highlightPatternField : 'hpattern_acad',
			clientRestrictions : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPatternLegend',parameters);
        View.showMessage(getMessage('legendCreated'));
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function clearHPatterns(){
	View.confirm(getMessage("confirmMessage"), function(button){
		if (button == 'no') {
			return;
		}
		else{
			try {
				var tableName = 'rmstd';
				var fieldName =  'hpattern_acad';
				var result = Workflow.callMethod('AbCommonResources-HighlightPatternService-clearHatchPatternLegends', tableName, fieldName  ,null);
				View.controllers.get('createHPatternGridController').createHPatternsRmstd_detailsPanel.refresh();
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	});
}

var createHPatternGridController = View.createController('createHPatternGridController', {
	patternString: null, 
	selRecord: null, 

    createHPatternsRmstd_detailsPanel_onCreateHPatternsRmstd_refresh: function(){
		View.reload();
    },

    createHPatternsRmstd_detailsPanel_edit_onClick: function(row){
        this.selRecord = row.getRecord();
        View.patternString = this.selRecord.getValue("rmstd.hpattern_acad");
		View.openDialog('ab-hpattern-dialog.axvw', null, true, {
			width: 700,
			height: 530,
			closeButton: false
		});
    },

    afterSaveHPattern: function(patternValue){
		this.selRecord.setValue("rmstd.hpattern_acad", patternValue);
		View.dataSources.get('createHPatternsRmstd_ds_0').saveRecord(this.selRecord);
		this.createHPatternsRmstd_detailsPanel.refresh();
    }
})


function selectHPattern(){
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}





