//ab-mobile-exec-pagenav-cost-summary.js

function setDrilldownRestriction(obj) {
	if (obj.restriction.clauses.length > 0) {                         
		var grid = View.getControl('', 'panel_aabMobileExecPagenavLeaseSummary_popup');                       
		var restriction = '';                       
		var clauses = obj.restriction.clauses;                       
		for (var i = clauses.length-1; i > -1; i--) {                            
			if (i != clauses.length - 1) {                               
				restriction += ' AND ';                            
			}

			var name = clauses[i].name;
			if (name == 'cost_tran.ls_id') {                               
				restriction += "cost_tran.ls_id = '" + clauses[i].value + "' ";                           
			}
			else if (name == 'cost_tran.ac_id') {                               
				restriction += "cost_tran.ac_id = '" + clauses[i].value + "' "; 
			}                       
		}
	
		grid.refresh(restriction);
		grid.show(true);
		grid.showInWindow({                         
			width: 600,                         
			height: 400                       
		});                   
	}                  
}               