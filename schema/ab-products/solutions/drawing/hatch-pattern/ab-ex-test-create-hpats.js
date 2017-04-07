function createHPatterns(){
	try {
		var parameters = {
			tableName : 'rmcat',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : true,
			sortField : null
		} 
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
			//"rmcat", "hpattern_acad", true, null);
			
		
	} catch (e) {
    	Workflow.handleError(e);
	}

}

function createHPatternsGpStd(){
	try {
		var parameters = {
			tableName : 'gpstd',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : null
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}

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

function createHPatternsRoomType(){
	try {
		var parameters = {
			tableName : 'rmtype',
			highlightPatternField : 'hpattern_acad',
			useOnlyColors : false,
			sortField : 'rm_cat'
		}
		var result = Workflow.call('AbCommonResources-HighlightPatternService-createHatchPattern',parameters);
	} catch (e) {
    	Workflow.handleError(e);
	}
}