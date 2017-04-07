function user_form_onload()
{
	setConsoleTimeframe();
}

function filterValues() {
	onCalcEndDates();
	  		
    var restriction = getConsoleRestrictionForActions();
    var timeframeRestriction = "";
    var date_start, date_end;
    if ($('timeframe_type_years').checked)
    {
    	var from_year = $('from_year').value;
    	var to_year = $('to_year').value;
    	date_start = from_year + "-" + "01-01";
   	    date_end = to_year + "-12-31";
    	timeframeRestriction = getDateSchedRestriction(date_start, date_end,'timeframe1');
    } else if ($('timeframe_type_days').checked)
    {
    	var num_days = $('num_days').value;
    	var curdate = new Date();
  	  	date_start = dateAddDays(curdate, 0);
  	  	date_end = dateAddDays(curdate, num_days);
  	  	timeframeRestriction = getDateSchedRestriction(date_start, date_end,'timeframe1');
    }    
    restriction += timeframeRestriction;

	renderView('brg-proj-review-costs-by-activity-type-mdx.axvw', 'detailsFrame', restriction);
}