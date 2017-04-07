var spaceExpressHistory = View.createController('spaceExpressHistory', {

	currentSelectedList: null,
	
	consoleRestrictionString:"",

	onTypeOptionChange: function(value){
	    var enabled = (value == 'rooms');
		
	    var console = this.filter;
		console.enableField('rmpct.rm_cat', enabled);
		console.enableField('rmpct.rm_type', enabled);

		if(enabled){
			this.currentSelectedList = this.roomList; 
			this.employeeList.show(false);
		}else {
			this.currentSelectedList = this.employeeList; 
			 this.roomList.show(false);
		}
		 this.historyList.show(false);
		
		return value;
	}, 
	
	/** hide the grid panels when click at Clear button*/
   	hidePanels:function(){
		this.roomList.show(false);
		this.employeeList.show(false);
		this.historyList.show(false);
		this.onTypeOptionChange('rooms');	
   	},
	
	filter_onShow: function(){
		var startDate = this.filter.getFieldValue('rmpct.date_start');
		if (!startDate) {
			View.alert( getMessage('dateRequired') ); 
			return;
		} 
		

		this.historyList.show(false);

		var restriction = this.getConsoleRestriction();
		this.consoleRestrictionString =  restriction;

		 if (!this.currentSelectedList){
			this.currentSelectedList = this.roomList;
		 }
		this.currentSelectedList.addParameter('rmp', restriction);
		this.currentSelectedList.addParameter('hrmp',restriction);

		this.currentSelectedList.show(true);
		this.currentSelectedList.refresh();
	},
	
	getConsoleRestriction: function(){
		var console = this.filter;
		var parameterString="1=1";
		
		var buildingCode = console.getFieldValue('rmpct.bl_id');
		if(valueExistsNotEmpty(buildingCode)){
			parameterString = parameterString+  " AND bl_id ='"+buildingCode +"'";
		}
		var floorCode = console.getFieldValue('rmpct.fl_id');
		if(valueExistsNotEmpty(floorCode)){
			parameterString = parameterString+  " AND fl_id ='"+floorCode +"'";
		}
		var roomCode = console.getFieldValue('rmpct.rm_id');
		if(valueExistsNotEmpty(roomCode)){
			parameterString = parameterString+ " AND rm_id ='"+roomCode +"'";
		}

		var divisionCode = console.getFieldValue('rmpct.dv_id');
		if(valueExistsNotEmpty(divisionCode)){
			parameterString = parameterString+  " AND dv_id ='"+divisionCode +"'";
		}
		var depCode = console.getFieldValue('rmpct.dp_id');
		if(valueExistsNotEmpty(depCode)){
			parameterString = parameterString+  " AND dp_id ='"+depCode +"'";
		}

		var startDate = console.getFieldValue('rmpct.date_start');
		parameterString = parameterString + " and 	( date_start is null or ${sql.yearMonthDayOf('date_start')}  <='" + startDate + "' ) ";
		parameterString = parameterString+  " and 	( date_end is null or ${sql.yearMonthDayOf('date_end')}  >='" + startDate + "' ) ";

 		var type = $('select_type').value;
	    if(type=="rooms"){
				var roomCategory = console.getFieldValue('rmpct.rm_cat');
				if(valueExistsNotEmpty(roomCategory)){
					parameterString = parameterString+  " AND rm_cat ='"+roomCategory +"'";
				}
				var roomType = console.getFieldValue('rmpct.rm_type');
				if(valueExistsNotEmpty(roomType)){
					parameterString = parameterString+  " AND rm_type ='"+roomType +"'";
				}
		}
		return  parameterString;
	},

	showHistoryByRoom: function(){
		var rows = this.roomList.rows;
		var selectedRowIndex = this.roomList.selectedRowIndex;
		var bl_id = rows[selectedRowIndex]['rm.bl_id'];
		var fl_id = rows[selectedRowIndex]['rm.fl_id'];		
		var rm_id = rows[selectedRowIndex]['rm.rm_id'];	

		var roomRestriction =  " bl_id ='" +bl_id+"'";
		roomRestriction =roomRestriction+ " AND fl_id ='"+fl_id +"'";
		roomRestriction =roomRestriction+ " AND rm_id ='"+rm_id+"' ";
	
	    this.showHistoryList(roomRestriction);
		this.historyList.setTitle( getMessage('rm')); 
	},
	
	showHistoryByEmployee: function(){
		var rows = this.employeeList.rows;
		var selectedRowIndex = this.employeeList.selectedRowIndex;
		var em_id = rows[selectedRowIndex]['em.em_id'];

		var emRestriction =  " em_id ='" +em_id+"'";
	    this.showHistoryList(emRestriction);
		this.historyList.setTitle( getMessage('em')); 
	},

	showHistoryList: function(restrictionParameter){
		this.historyList.addParameter('rmp', restrictionParameter);
		this.historyList.addParameter('hrmp',restrictionParameter);
		this.historyList.show(true);
		this.historyList.refresh();
	}
});



