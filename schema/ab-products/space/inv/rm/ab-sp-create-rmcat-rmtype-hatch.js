function createHPatternsType(){
	try {
		var parameters = {
			tableName : 'rmtype',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : 'rm_cat',
			clientRestrictions:View.controllers.get('createHPatternGridController').catRes
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsTypeNoSort(){
	try {
		var parameters = {
			tableName : 'rmtype',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : null,
			clientRestrictions:View.controllers.get('createHPatternGridController').catRes
	}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsTypeOnlyColors(){
	try {
		var parameters = {
			tableName : 'rmtype',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : true,
			sortField : 'rm_cat',
			clientRestrictions:View.controllers.get('createHPatternGridController').catRes
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsTypeNoSortOnlyColors (){
	try {
		var parameters = {
			tableName : 'rmtype',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : true,
			sortField : null,
			clientRestrictions:View.controllers.get('createHPatternGridController').catRes
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}


function createHPatternTypeLegendBitmaps(){
	try {
		var parameters = {
			tableName : 'rmtype',
			highlightPatternField : 'hpattern_acad',
			clientRestrictions : null,
			clientRestrictions:View.controllers.get('createHPatternGridController').catRes
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPatternLegend',parameters);
		View.reload();
        View.showMessage(getMessage('legendCreated'));
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function clearTypeHPatterns(){
	View.confirm(getMessage("confirmMessage"), function(button){
		if (button == 'no') {
			return;
		}
		else{
			try {
				var tableName = 'rmtype';
				var fieldName =  'hpattern_acad';
				var result = Workflow.callMethod('AbCommonResources-HighlightPatternService-clearHatchPatternLegends', 
								tableName, fieldName  ,View.controllers.get('createHPatternGridController').catRes);
				View.controllers.get('createHPatternGridController').createHPatternsType_detailsPanel.refresh();
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	});
}

var createHPatternGridController = View.createController('createHPatternGridController', {
	patternString: null, 
	selRecord: null, 
	catRes:null, 

    createHPatternsCat_detailsPanel_onCreateHPatternsCat_refresh: function(){
		View.reload();
    },

    createHPatternsType_detailsPanel_onCreateHPatternsType_refresh: function(){
		View.reload();
    },

    createHPatternsType_detailsPanel_edit_onClick: function(row){
        this.selRecord = row.getRecord();
        View.patternString = this.selRecord.getValue("rmtype.hpattern_acad");
		View.openDialog('ab-hpattern-dialog.axvw', null, true, {
			width: 700,
			height: 530,
			closeButton: false
		});
    },

    createHPatternsCat_detailsPanel_edit_onClick: function(row){
        this.selRecord = row.getRecord();
        View.patternString = this.selRecord.getValue("rmcat.hpattern_acad");
		View.openDialog('ab-hpattern-dialog.axvw', null, true, {
			width: 700,
			height: 530,
			closeButton: false
		});
    },

	afterSaveHPattern: function(patternValue){
		if(this.selRecord.getValue("rmtype.rm_type")){
			this.selRecord.setValue("rmtype.hpattern_acad", patternValue);
			View.dataSources.get('createHPatternsType_ds_0').saveRecord(this.selRecord);
			this.createHPatternsType_detailsPanel.refresh();
		}
		else{
			this.selRecord.setValue("rmcat.hpattern_acad", patternValue);
			View.dataSources.get('createHPatternsCat_ds_0').saveRecord(this.selRecord);
			this.createHPatternsCat_detailsPanel.refresh();
		}
    },

	createHPatternsType_detailsPanel_onShowAll:function(){
		this.catRes = null;
		this.createHPatternsType_detailsPanel.refresh(null,null,true);
	}
})

function createHPatternsCatOnlyHatches(){
	try {
		var parameters = {
			tableName : 'rmcat',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsCatOnlyColors(){
	try {
		var parameters = {
			tableName : 'rmcat',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : true,
			sortField : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function createHPatternsCatLegendBitmaps(){
	try {
		var parameters = {
			tableName : 'rmcat',
			highlightPatternField : 'hpattern_acad',
			clientRestrictions : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPatternLegend',parameters);
		View.reload();
        View.showMessage(getMessage('legendCreated'));
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function clearCatHPatterns(){
	View.confirm(getMessage("confirmMessage"), function(button){
		if (button == 'no') {
			return;
		}
		else{
			try {
				var tableName = 'rmcat';
				var fieldName =  'hpattern_acad';
				var result = Workflow.callMethod('AbCommonResources-HighlightPatternService-clearHatchPatternLegends', tableName, fieldName  ,null);
				View.controllers.get('createHPatternGridController').createHPatternsCat_detailsPanel.refresh();
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	});
}


function onSelectRmcat(){
    var rmcatGrid = View.panels.get('createHPatternsCat_detailsPanel');
    rmcatId = rmcatGrid.rows[rmcatGrid.selectedRowIndex]["rmcat.rm_cat"].replace(/'/g, "''");
    var restriction = " rmtype.rm_cat='"+rmcatId+"' ";
	View.controllers.get('createHPatternGridController').catRes = restriction;
    View.panels.get('createHPatternsType_detailsPanel').refresh(restriction);
}






