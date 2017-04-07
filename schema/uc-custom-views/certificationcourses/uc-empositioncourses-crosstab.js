var cntrl = View.createController('cntrl',{
	console_onShow: function() {
		if (this.console.getFieldValue("uc_position.position") == ""){
			View.showMessage('Please select a Position.');
			return false;
		}
		var restriction =new Ab.view.Restriction()
		restriction.addClause('em.position',  this.console.getFieldValue("uc_position.position"), '=');
		this.courses.refresh(restriction)
		this.legend.show()
	},
	
	
	
	courses_afterRefresh: function(panel, dataSet) {
		var rowCount = courses.firstElementChild.rows.length;
		
		var iRow;
		var iCol;
		var cellValue="";
		
		for (iRow=2; iRow < rowCount; iRow++) {
			for (iCol=2; iCol < courses.firstElementChild.rows[iRow].cells.length; iCol++) {
				cellValue=courses.firstElementChild.rows[iRow].cells[iCol].innerText;
				switch(cellValue) {
					case "1":
						courses.firstElementChild.rows[iRow].cells[iCol].innerText="T";
						courses.firstElementChild.rows[iRow].cells[iCol].style.backgroundColor="#99cc99"
						break;
					case "0":
						courses.firstElementChild.rows[iRow].cells[iCol].innerText="Exp";
						courses.firstElementChild.rows[iRow].cells[iCol].style.backgroundColor="#ffff00"
						break;
					case "*":
						courses.firstElementChild.rows[iRow].cells[iCol].innerText="";
						break;
				}
			}
		}
		
		
	},
})