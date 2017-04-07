function createHPatternsDvOnlyHatches(){
	try {
		var parameters = {
			tableName : 'dv',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsDvOnlyColors(){
	try {
		var parameters = {
			tableName : 'dv',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : true,
			sortField : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsDvLegendBitmaps(){
	try {
		var parameters = {
			tableName : 'dv',
			highlightPatternField : 'hpattern_acad',
			clientRestrictions : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPatternLegend',parameters);
		View.controllers.get('createHPatternGridController').createHPatternsDv_detailsPanel.refresh();
        View.showMessage(getMessage('legendCreated'));
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function clearDvHPatterns(){
	View.confirm(getMessage("confirmMessage"), function(button){
		if (button == 'no') {
			return;
		}
		else{
			try {
				var tableName = 'dv';
				var fieldName =  'hpattern_acad';
				var result = Workflow.callMethod('AbCommonResources-HighlightPatternService-clearHatchPatternLegends', tableName, fieldName  ,null);
				View.controllers.get('createHPatternGridController').createHPatternsDv_detailsPanel.refresh();
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	});
}


function createHPatternsDp(){
	try {
		var parameters = {
			tableName : 'dp',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : 'dv_id',
			clientRestrictions:View.controllers.get('createHPatternGridController').dvRes
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsDpNoSort(){
	try {
		var parameters = {
			tableName : 'dp',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : null,
			clientRestrictions:View.controllers.get('createHPatternGridController').dvRes
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsDpOnlyColors(){
	try {
		var parameters = {
			tableName : 'dp',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : true,
			sortField : 'dv_id',
			clientRestrictions:View.controllers.get('createHPatternGridController').dvRes
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsDpNoSortOnlyColors(){
	try {
		var parameters = {
			tableName : 'dp',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : true,
			sortField : null,
			clientRestrictions:View.controllers.get('createHPatternGridController').dvRes
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}


function createHPatternsLegendBitmaps(){
	try {
		var parameters = {
			tableName : 'dp',
			highlightPatternField : 'hpattern_acad',
			clientRestrictions : null,
			clientRestrictions:View.controllers.get('createHPatternGridController').dvRes
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPatternLegend',parameters);
		View.controllers.get('createHPatternGridController').createHPatternsDp_detailsPanel.refresh();
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
				var tableName = 'dp';
				var fieldName =  'hpattern_acad';
				var result = Workflow.callMethod('AbCommonResources-HighlightPatternService-clearHatchPatternLegends', tableName, fieldName  ,View.controllers.get('createHPatternGridController').dvRes);
				View.controllers.get('createHPatternGridController').createHPatternsDp_detailsPanel.refresh();
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	});
}

var createHPatternGridController = View.createController('createHPatternGridController', {
	patternString: null, 
	selRecord: null, 

    createHPatternsDv_detailsPanel_onCreateHPatternsDv_refresh: function(){
		View.reload();
    },
    
    createHPatternsDp_detailsPanel_onCreateHPatternsDp_refresh: function(){
		View.reload();
    },

	createHPatternsDv_detailsPanel_edit_onClick: function(row){
        this.selRecord = row.getRecord();
        View.patternString = this.selRecord.getValue("dv.hpattern_acad");
		View.openDialog('ab-hpattern-dialog.axvw', null, true, {
			width: 700,
			height: 530,
			closeButton: false
		});
    },
    
    createHPatternsDp_detailsPanel_edit_onClick: function(row){
        this.selRecord = row.getRecord();
        View.patternString = this.selRecord.getValue("dp.hpattern_acad");
		View.openDialog('ab-hpattern-dialog.axvw', null, true, {
			width: 700,
			height: 530,
			closeButton: false
		});
    },

    afterSaveHPattern: function(patternValue){
		if(this.selRecord.getValue("dp.dp_id")){
			this.selRecord.setValue("dp.hpattern_acad", patternValue);
			View.dataSources.get('createHPatternsDp_ds_1').saveRecord(this.selRecord);
			this.createHPatternsDp_detailsPanel.refresh();
		}
		else{
			this.selRecord.setValue("dv.hpattern_acad", patternValue);
			View.dataSources.get('createHPatternsDp_ds_0').saveRecord(this.selRecord);
			this.createHPatternsDv_detailsPanel.refresh();
		}
    },
    
    createHPatternsDp_detailsPanel_onShowAll:function(){
		this.dvRes = null;
		this.createHPatternsDp_detailsPanel.refresh(null,null,true);
	}
});


function selectHpattern(){
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}

function onSelectDV(){
    var grid = View.panels.get('createHPatternsDv_detailsPanel');
    var dvId = grid.rows[grid.selectedRowIndex]["dv.dv_id"];
    var restriction = " dp.dv_id='"+dvId+"' ";
	View.controllers.get('createHPatternGridController').dvRes = restriction;
    View.panels.get('createHPatternsDp_detailsPanel').refresh(restriction);
}
