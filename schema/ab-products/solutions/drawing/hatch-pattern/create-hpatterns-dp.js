
function createHPatternsDp(){
	try {
		var parameters = {
			tableName : 'dp',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : 'dv_id'
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
			sortField : null
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
			sortField : 'dv_id'
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
			sortField : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}


function createHPatternLegendBitmaps(){
	try {
		var parameters = {
			tableName : 'dp',
			highlightPatternField : 'hpattern_acad',
			clientRestrictions : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPatternLegend',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}



