
var abSpVwRmpctExceptionsController1 = View.createController('abSpVwRmpctExceptionsController1', {
	/**
	 * After data fetch
	 */
	afterInitialDataFetch: function(){
		$('abSpVwRmpctExceptionsConsole_field_gen1_labelCell').style.display='none';
		$('allocatedType').style.display='none';
		getExceptionsList();
    },
    abSpVwRmpctExceptionsConsole_afterRefresh : function(){
    	this.abSpVwRmpctExceptionsConsole.clear();
    }
	})


/**
 * Show Exceptions By Exception Type
 */
function showExceptionsByExceptionType(fromWhere){
	var c=abSpVwRmpctExceptionsController1;
	var console=c.abSpVwRmpctExceptionsConsole;
	var bl_id=console.getFieldValue("rm.bl_id");
	var fl_id=console.getFieldValue("rm.fl_id");
	
	var itemSelect = $('exceptions');
	var value=itemSelect.value;
	var itemSelect2 = $('allocatedType');
	var value2=itemSelect2.value;
	
	var optionIndex=getOptionIndex(itemSelect,value);
	
	if(optionIndex==8){
		if(fromWhere==0){
		$('abSpVwRmpctExceptionsConsole_field_gen1_labelCell').style.display='';
		$('allocatedType').style.display='';
			getAllocationTypeList();
		}
		var optionIndex2=getOptionIndex(itemSelect2,value2);
		if(optionIndex2==0){
			optionIndex=80;
		}else if(optionIndex2==1){
			optionIndex=81;
		}else{
			optionIndex=82;
		}
		//load list
	}else{
		$('abSpVwRmpctExceptionsConsole_field_gen1_labelCell').style.display='none';
		$('allocatedType').style.display='none';
	}
	refreshReportByException(c,optionIndex,bl_id,fl_id);
}


/**Refresh Report By Exception
 * 
 * @param c
 * @param optionIndex
 * @param bl_id
 * @param fl_id
 */
function refreshReportByException(c,optionIndex,bl_id,fl_id){
	var tag1='=';
	var tag2='=';
	if(bl_id==''){
		bl_id='%';
		tag1='LIKE';
	}
	if(fl_id==''){
		fl_id='%';
		tag2='LIKE';
	}
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rmpct.bl_id", bl_id, tag1);
	restriction.addClause("rmpct.fl_id", fl_id, tag2);
	
	//var panelArr=[c.rmpctReport1,c.rmpctReport2,c.rmpctReport3,c.rmpctReport4,c.rmpctReport5,c.rmpctReport6,c.rmpctReport7,c.rmpctReport8,c.rmpctReport9];
	var panelArr=[c.rmpctReport1,c.rmpctReport2,c.rmpctReport3,c.abSpVwRmpctExceptionsTab2RmDetail];
	
	for(var i=0;i<panelArr.length;i++){
		panelArr[i].show(false);
	}
	
	var sqlParam=getParamSql(optionIndex);
	
	if(optionIndex==0){
		c.rmpctReport1.refresh(restriction,true);
	}else if(optionIndex==1){
		c.rmpctReport2.refresh(restriction,true);
	}else if(optionIndex==2){
		c.rmpctReport3.refresh(restriction,true);
	}else if(optionIndex==3||optionIndex==4||optionIndex==5||optionIndex==6||optionIndex==7||optionIndex==9||optionIndex==10||optionIndex==80||optionIndex==81||optionIndex==82){
		sqlParam=sqlParam+" and rm.bl_id "+tag1+" '"+bl_id+"' and rm.fl_id "+tag2+" '"+fl_id+"'";
		c.abSpVwRmpctExceptionsTab2RmDetail.addParameter('sqlParam',sqlParam);
		c.abSpVwRmpctExceptionsTab2RmDetail.refresh();
		if(optionIndex==6){
			c.abSpVwRmpctExceptionsTab2RmDetail.showColumn("rm.pendingRequest",true);
			
		}else{
			c.abSpVwRmpctExceptionsTab2RmDetail.hideColumn("rm.pendingRequest");
		}
		c.abSpVwRmpctExceptionsTab2RmDetail.update();
		
	}
}