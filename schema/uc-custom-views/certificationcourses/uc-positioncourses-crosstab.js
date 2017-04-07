var crosstabGridController = View.createController('crosstabGrid', {

	console_onShow: function() {
	
		var restrictionparam = "1=1";
		var category_id = this.console.getFieldValue("UC_course_categories.category_id");
		
		
		if(category_id != ""){	restrictionparam = restrictionparam + " AND c.category_id = "+this.literalOrNull(category_id);	}
		
		this.ucCourses.addParameter("consoleRest", restrictionparam);
		this.ucCourses.refresh();
		

		this.legend.show()
	},
		


	ucCourses_afterRefresh: function(panel, dataSet) {

	

		var rowCount = ucCourses.firstElementChild.rows.length;
		
		var iRow;
		var iCol;
		var cellValue="";
		
		for (iRow=2; iRow < rowCount; iRow++) {
			for (iCol=2; iCol < ucCourses.firstElementChild.rows[iRow].cells.length; iCol++) {
				cellValue=ucCourses.firstElementChild.rows[iRow].cells[iCol].innerText;
				switch(cellValue) {
					case "1":
						ucCourses.firstElementChild.rows[iRow].cells[iCol].innerText="R";
						ucCourses.firstElementChild.rows[iRow].cells[iCol].style.backgroundColor="#99cc99"
						break;
					case "0":
						ucCourses.firstElementChild.rows[iRow].cells[iCol].innerText="O";
						ucCourses.firstElementChild.rows[iRow].cells[iCol].style.backgroundColor="#ffff00"
						break;
					case "*":
						ucCourses.firstElementChild.rows[iRow].cells[iCol].innerText="";
						break;
				}
			}
		}
		
		
	},
	
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	},

	
});



