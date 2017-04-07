// Adds a blank space as the first option for an enum field and sets the focus
function setup_enum_field(table, field){
    var field = $(table + "." + field);
    
    var newOption = document.createElement('option');
    newOption.value = "";
    newOption.appendChild(document.createTextNode(""));
    field.insertBefore(newOption, field.firstChild);
    field.options[0].selected = "0";
}


// Shows or hides the to and from fields for a date field
function console_checkDateRange(table, field){
    var field_value = document.getElementsByName(field)[0].value;
    var enabled = (field_value == 'Date Range');
    var fromField = "AFMCALENDAR_" + table + "." + field + ".from";
    var toField = "AFMCALENDAR_" + table + "." + field + ".to";
    var console = AFM.view.View.getControl('', 'consolePanel');
    
    console.enableField("'" + table + "." + field_value + ".from'", enabled);
    console.enableField("'" + table + "." + field_value + ".to'", enabled);
    
    if (field_value != 'Date Range') {
        $(toField).parentNode.style.display = "none";
        $(toField).parentNode.previousSibling.style.display = "none";
        $(fromField).parentNode.style.display = "none";
        $(fromField).parentNode.previousSibling.style.display = "none";
        $(fromField).value = "";
        $(toField).value = "";
    }
    else {
        $(fromField).parentNode.style.display = "";
        $(fromField).parentNode.previousSibling.style.display = "";
        $(toField).parentNode.style.display = "";
        $(toField).parentNode.previousSibling.style.display = "";
    }
}


function add_restriction_clause_for_date_field(table, field, console, restriction){
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    var field_name = table + "." + field;
    
    var field_value = document.getElementsByName(field)[0].value;
    if (field_value == 'Date Range') {
        var dateRequestedFrom = console.getFieldValue(field_name + ".from");
        if (dateRequestedFrom != '') {
            restriction.addClause(field_name, dateRequestedFrom, '&gt;=');
        }
        
        var dateRequestedTo = console.getFieldValue(field_name + ".to");
        if (dateRequestedTo != '') {
            restriction.addClause(field_name, dateRequestedTo, '&lt;=');
        }
        
    }
    else 
        if (field_value == 'Today') {
            restriction.addClause(field_name, console.formatDate(day, month, year));
            
        }
        else 
            if (field_value == 'This Week') {
                var thisWeekStartDate = new Date(today.getTime() - 24 * 60 * 60 * 1000 * today.getDay());
                var thisWeekEndDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 * (6 - today.getDay()));
                restriction.addClause(field_name, console.formatDate(thisWeekStartDate.getDate(), thisWeekStartDate.getMonth() + 1, thisWeekStartDate.getFullYear()), '&gt;=');
                restriction.addClause(field_name, console.formatDate(thisWeekEndDate.getDate(), thisWeekEndDate.getMonth() + 1, thisWeekEndDate.getFullYear()), '&lt;=');
                
            }
            else 
                if (field_value == 'This Month') {
                    var daysInThisMonth = GetMonthMaxDays(month, year);
                    restriction.addClause(field_name, console.formatDate(1, month, year), '&gt;=');
                    restriction.addClause(field_name, console.formatDate(daysInThisMonth, month, year), '&lt;=');
                    
                }
                else 
                    if (field_value == 'This Year') {
                        restriction.addClause(field_name, console.formatDate(1, 1, year), '&gt;=');
                        restriction.addClause(field_name, console.formatDate(31, 12, year), '&lt;=');
                        
                    }
                    else 
                        if (field_value == 'Last Week') {
                            var lastWeekStartDate = new Date(today.getTime() - 24 * 60 * 60 * 1000 * (today.getDay() + 7));
                            var lastWeekEndDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 * (6 - today.getDay() - 7));
                            restriction.addClause(field_name, console.formatDate(lastWeekStartDate.getDate(), lastWeekStartDate.getMonth() + 1, lastWeekStartDate.getFullYear()), '&gt;=');
                            restriction.addClause(field_name, console.formatDate(lastWeekEndDate.getDate(), lastWeekEndDate.getMonth() + 1, lastWeekEndDate.getFullYear()), '&lt;=');
                            
                        }
                        else 
                            if (field_value == 'Last Month') {
                            	if(month == 1){
                            		restriction.addClause(field_name, console.formatDate(1, 12, year-1), '&gt;=');
                            		restriction.addClause(field_name, console.formatDate(31, 12, year-1) + '%', '&lt;=');
                            	} else {
                            		var daysInThisMonth = GetMonthMaxDays(month - 1, year);
                            		restriction.addClause(field_name, console.formatDate(1, month - 1, year), '&gt;=');
                            		restriction.addClause(field_name, console.formatDate(daysInThisMonth, month - 1, year) + '%', '&lt;=');
                            	}                               
                            }
                            else 
                                if (field_value == 'Last Year') {
                                    restriction.addClause(field_name, console.formatDate(1, 1, year - 1), '&gt;=');
                                    restriction.addClause(field_name, console.formatDate(31, 12, year - 1), '&lt;=');
                                    
                                }
                                else 
                                    if (field_value == 'Next Week') {
                                        var nextWeekStartDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 * (7 - today.getDay()));
                                        var nextWeekEndDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 * (7 + today.getDay()));
                                        restriction.addClause(field_name, console.formatDate(nextWeekStartDate.getDate(), nextWeekStartDate.getMonth() + 1, nextWeekStartDate.getFullYear()), '&gt;=');
                                        restriction.addClause(field_name, console.formatDate(nextWeekEndDate.getDate(), nextWeekEndDate.getMonth() + 1, nextWeekEndDate.getFullYear()), '&lt;=');
                                        
                                    }
                                    else 
                                        if (field_value == 'Next Month') {
                                            var daysInThisMonth = GetMonthMaxDays(month - 1, year);
                                            restriction.addClause(field_name, console.formatDate(1, month + 1, year), '&gt;=');
                                            restriction.addClause(field_name, console.formatDate(daysInThisMonth, month + 1, year), '&lt;=');
                                            
                                        }
                                        else 
                                            if (field_value == 'Next Year') {
                                                restriction.addClause(field_name, console.formatDate(1, 1, year + 1), '&gt;=');
                                                restriction.addClause(field_name, console.formatDate(31, 12, year + 1), '&lt;=');
                                            }
}
