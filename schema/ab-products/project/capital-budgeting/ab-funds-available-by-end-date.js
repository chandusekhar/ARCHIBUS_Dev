var fundsAvailableByEndDateController = View.createController('fundsAvailableByEndDate', {
	
    afterViewLoad : function() {
    	this.fundsAvailableByEndDateReport.afterCreateCellContent = function(row, column, cellElement) {
    		var d = new Date();
    		var date_current = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    		var date_plus_1 = new Date(d.getFullYear()+1, d.getMonth(), d.getDate());
    		var date_plus_1_offset = Math.round((date_current.getTime() - date_plus_1.getTime())/(24*60*60*1000));
    		var date_plus_3 = new Date(d.getFullYear()+3, d.getMonth(), d.getDate());
    		var date_plus_3_offset = Math.round((date_current.getTime() - date_plus_3.getTime())/(24*60*60*1000));
        	var date_end = row['funding.date_avail_end'];
        	var date_end_offset = '-100000';
    		if(valueExistsNotEmpty(date_end)){
    			if (row['funding.date_end_offset.raw'] != undefined){
    				date_end_offset = parseInt(row['funding.date_end_offset.raw']);
    			} else {
    				date_end_offset = parseInt(row['funding.date_end_offset']);
    			}
				if (column.id == 'funding.date_avail_end')	{
					if (date_end_offset > 0)	{
						cellElement.style.background = '#FF3333'; // Expired -- Red
					}
					else if (date_end_offset > date_plus_1_offset) {
						cellElement.style.background = '#FFCC00'; // Expires w/in 1 year -- Yellow
					}
					else if (date_end_offset > date_plus_3_offset) {
						cellElement.style.background = '#00CC66'; // Expires w/in 3 years -- Green
					}
				}
	    	}
        }
    }
});


