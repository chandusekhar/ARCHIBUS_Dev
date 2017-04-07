var projFcpmWipPjnController = View.createController('projFcpmWipPjn', {
	restriction:null,
	afterViewLoad: function() {
        var grid = this.projFcpmWipPjnGrid;
        var controller = this;

        grid.afterCreateDataRows = function(parentElement, columns) {    	
	    	for (var mo = 1; mo <= 12; mo++) {
	    		var j = grid.findColumnIndex('work_pkgs.cost_yearMonth' + mo);
	    		var yearMonth = grid.parameters['yearMonth' + mo];
	    		var year = yearMonth.substring(0, 4);
	    		var month = Number(yearMonth.substring(5, 7));
	        	columns[j].name = yearMonth
	        	grid.fieldDefs[j].title = yearMonth;
	        	var text = grid.headerRows[0].cells[j].innerHTML;
	        	text = '<div>' + getMessage('mo' + month) + "<br/>" + year + '</div>' + (text.indexOf('</div>') == -1?text.substring(text.indexOf('</DIV>')+6):text.substring(text.indexOf('</div>')+6));
	        	grid.headerRows[0].cells[j].innerHTML = text;
	    	}
        }  
        
        grid.afterCreateCellContent = function(row, column, cellElement) {
        	if (column.id == 'work_pkgs.revised_cost' ) {
	    	    var cost_forecast = row['work_pkgs.cost_forecast'];
	    	    var revised_cost = row['work_pkgs.revised_cost'];
	    		if (cost_forecast != revised_cost)	{
	    			cellElement.style.background = '#FF8B73';//Red
	    		} else {
	    			cellElement.style.background = 'transparent';
	    		}
        	}
    	}
	},
	
	projFcpmWipPjnGrid_afterRefresh: function() {
		var openerController = View.controllers.get('projFcpmWip');
		var title = '[' + openerController.project_id + '] ' + openerController.project_name;
    	if (openerController.work_pkg_id) title += ' - ' + openerController.work_pkg_id;
		this.projFcpmWipPjnGrid.appendTitle(title);
    },
    
    openPjnItems: function(obj) {
    	var work_pkg_id = obj.restriction['work_pkgs.work_pkg_id'];
    	var project_id = View.controllers.get('projFcpmWip').project_id;
    	var proj_forecast_id = View.controllers.get('projFcpmWip').proj_forecast_id;
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('proj_forecast_item.proj_forecast_id', proj_forecast_id);
    	restriction.addClause('proj_forecast_item.project_id', project_id);
    	restriction.addClause('proj_forecast_item.work_pkg_id', work_pkg_id);
    	this.restriction = restriction;
    	var pkgRestriction = new Ab.view.Restriction();
    	pkgRestriction.addClause('work_pkgs.project_id', project_id);
    	pkgRestriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
    	View.openDialog('ab-proj-fcpm-wip-pjn-items.axvw', pkgRestriction);
    }
});
