// CHANGE LOG:
// 2012/02/15 - ASO - add in totals for Approve/Reject count (new function: getApproveCountTotal,getRejectCountTotal,getTotalFromFld

var ucApprovedCount = View.createController('ucApprovedCount', {
	

    afterViewLoad: function() {
        var date = new Date();

		if (date.getMonth() == 11) {
			$('restConsole_monthSelect').value = 1;
			date.setFullYear(date.getFullYear() + 1);
			$('restConsole_yearSelect').value = date.getFullYear();
        } else {
			$('restConsole_monthSelect').value = date.getMonth()+2;
			$('restConsole_yearSelect').value = date.getFullYear();
		}


        var grid = Ab.view.View.getControl('', 'reportGridSql_grid');

        grid.buildPreFooterRows = function(parentElement) {
            var message = grid.rows.length > 0 ? grid.rows.length + ' records' : 'No records to display';
			
			var rowElement = document.createElement('tr');
            var cellElement = document.createElement('td');
            cellElement.className = 'message';
            cellElement.colSpan = this.getNumberOfColumns() - 2; //2012.02.15 modify colspan in order to display the 2 new total cell correctly
            cellElement.appendChild(document.createTextNode(message));
            rowElement.appendChild(cellElement);
            parentElement.appendChild(rowElement);
			
			//2012.02.15 total for approved count
			var cellElement = document.createElement('td');
			cellElement.className = 'message';
			cellElement.style.textAlign = 'right';
            cellElement.appendChild(document.createTextNode(ucApprovedCount.getApproveCountTotal()));
            rowElement.appendChild(cellElement);
			//2012.02.15 total for rejected count
			var cellElement = document.createElement('td');
			cellElement.className = 'message';
			cellElement.style.textAlign = 'right';
            cellElement.appendChild(document.createTextNode(ucApprovedCount.getRejectCountTotal()));
            rowElement.appendChild(cellElement);
			parentElement.appendChild(rowElement);

        }

    },

    afterInitialDataFetch: function() {
        applyConsoleRestriction();
    },
	
	//2012.02.15 get total for Approved count
	getApproveCountTotal: function(){
		return this.getTotalFromFld(this.reportGridSql_grid.rows,'pmdd.approv_count');
	},
	
	//2012.02.15 get total for Rejected count
	getRejectCountTotal: function(){
		return this.getTotalFromFld(this.reportGridSql_grid.rows,'pmdd.reject_count');
	},
	
	//2012.02.15 generic method to get the total count
	getTotalFromFld: function(rows,fieldName){
		var result = 0;
		for(var i = 0; i < rows.length; i++){
			result = result + parseInt(rows[i][fieldName]);
		}
		return result;
	}
});

function applyConsoleRestriction() {
    var restriction = "1=1";
    var month = $('restConsole_monthSelect').value;
    var year = $('restConsole_yearSelect').value;
    restriction = "month(pmdd.date_todo) = "+month+" AND year(pmdd.date_todo) = "+year;
    var grid = View.panels.get('reportGridSql_grid');
    grid.addParameter('rest', restriction);
    grid.refresh();

    var detailsGrid = View.panels.get('pmddGridPanel');
    detailsGrid.addParameter('rest', restriction);
}

function openDetails(row) {
    var detailsGrid = View.panels.get('pmddGridPanel');

    var pmp_id = row.row.getFieldValue('pmp.pmp_id');
    detailsGrid.refresh("pms.pmp_id = '"+pmp_id.replace(/'/g,"''")+"'");
    detailsGrid.showInWindow({newRecord: false, closeButton: true});
}
