View.createController('abLocalizationAnalysisGlosCounts', {
    
    afterInitialDataFetch: function() {
    	this.generateTotals();    	
    },
    
    generateTotals: function() {
    	
    	// add up totals
    	var grid = this.panel_abLocalizationAnalysisGlosCounts_data;
    	var currentRows = grid.rows;
    	
    	// create new row to display totals 
    	/*  	
    	var newRow = new Object();
    	newRow['lang_glossary.language'] = getMessage('total');
    	newRow['lang_glossary.string_count_sum'] = string_total.toString();
    	newRow['lang_glossary.word_count_sum'] = word_total.toString();
    	
    	grid.addGridRow(newRow, grid.rows.length);
    	grid.update();
    	*/
    	
    	// style
    	if(grid.rows.length > 0){
    		var total_label_cell = grid.getCellElement(grid.rows.length-1, 0);
    		var string_total_cell = grid.getCellElement(grid.rows.length-1, 1);
    		var word_total_cell = grid.getCellElement(grid.rows.length-1, 2);
    		
    		total_label_cell.innerHTML = getMessage('Total');
    		total_label_cell.style.font.bold = true;
    		total_label_cell.style.fontWeight = 'bold';
    		total_label_cell.style.fontStyle = 'italic';
    		total_label_cell.style.color = '#000080';
    		
    		string_total_cell.style.font.bold = true;
    		//string_total_cell.style.fontWeight = 'bold';
    		string_total_cell.style.fontStyle = 'italic';
    		string_total_cell.style.color = '#000080';
    		
    		word_total_cell.style.font.bold = true;
    		//word_total_cell.style.fontWeight = 'bold';
    		word_total_cell.style.fontStyle = 'italic';
    		word_total_cell.style.color = '#000080';
    	}
    }    
               
});

