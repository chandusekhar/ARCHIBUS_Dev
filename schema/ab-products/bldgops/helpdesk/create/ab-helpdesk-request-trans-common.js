/**
 * @author: Song
 */
/**
 * compare with the different of  records in grid before or after modify. 
 */
function  compareAssignmentsChangeReturnNew(original,changed){
	var insertAssignments = [];
	var unchangeAssignments = [];
	var deleteAssignments = [];
	
	var exceptNew = []; // for 'changed' list, exclude new added.
	if(changed!=null){
		for(i=0;i<changed.length;i++){
			// find new added record
			var record = changed[i];
			//for new added records, no 'pct_id' exist.
			if(record['pct_id']){ 
				exceptNew.push(record);
			}else{
//    			record['tag']='insert';
				insertAssignments.push(record);
			}
		}
	}
	if(original!=null){
		for(i=0;i<original.length;i++){
			var record = original[i];
			var flag = true;
			for(j=0;j<exceptNew.length;j++){
				if(toString(record) == toString(exceptNew[j])){
					unchangeAssignments.push(record);
					flag = false;
					continue;
				}
			}
			if(flag){
				for(j=0;j<exceptNew.length;j++){
					if(record['pct_id'] == exceptNew[j]['pct_id']){
						insertAssignments.push(exceptNew[j]);
						deleteAssignments.push(record);
						flag = false;
						continue;
					}
				}
			}
			if(flag){
				deleteAssignments.push(record);
			}
		}
	}
	var result = {};
	//sort with parent_pct_id first.
	var insert = [];
	for(i=0;i<insertAssignments.length;i++){
		if(insertAssignments[i]['parent_pct_id']){
			insert.push(insertAssignments[i]);
		}
	}
	for(i=0;i<insertAssignments.length;i++){
		if(!insertAssignments[i]['parent_pct_id']){
			insert.push(insertAssignments[i]);
		}
	}
	result = {I:insert,U:unchangeAssignments,D:deleteAssignments};
	return result;
}

/**
 * sort array make sure a record with 'parent_pct_id' is null at last.
 * aim to assure space will be process by 100/all.
 * note: this method may not need, because actually all the record with 'parent_pct_id' will be add before and then other records.
 * @returns {Array}
 */
function sortArray(array){
  var result = [];
  var last = null;
  for(i = 0; i < array.length; i++) {
    if(!array[i]['parent_pct_id']){
    	last = array[i];
    	break;
    }
  } 
  if(last!= null){
	  for(i = 0; i < array.length; i++) {
		  if(array[i]!= last){
			  result.push(array[i]);
		  }
	  }
	  result.push(last);
  }else{
	  return array;
  }
  return  result; 
}

function subContact(a,b){
	if(a==null||a.length==0){
		return b;
	}else{
		if(b!=null&&b.length>0){
			for(var i = 0; i <b.length; i++){
				a.push(b[i]);
			}
		}
		return a;
	}
}

/**
 * change obj to String(key=value)
 * @param obj
 * @returns {String}
 */
function toString(obj){
	  var props = "";   
		  for(var p in obj){   
		    props+= p + "=" + obj[p] + " ";   
		  }   
	  return props;
	}

function getCurrentDate(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    
//    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
    return  ((month < 10) ? "0" : "") + month +"/"+((day < 10) ? "0" : "") + day +  "/" +year ;
}

/**
 * get current date in ISO format(like '2013-12-26')
 */
function getCurrentDateISOFormat() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return  year+ "-" +((month < 10) ? "0" : "") + month + "-"  + ((day < 10) ? "0" : "") + day;
}

/**
 * private method, return date format mm/dd/yyyy 
 * @param dateStr
 * @returns
 */
function dateFormatQues(dateStr){ 
	if(dateStr!=null&&dateStr!='')
	return dateStr.split("-")[1]+"/"+dateStr.split("-")[2]+"/"+dateStr.split("-")[0];
	else 
	  return "";
}
/**
 * for 'move'
 * check if Another request exists involving the same employee for a future assignment. 
 * @param assignments
 * @param dateEnd
 * @param type 0: move management submit or approve issue
 *             1: move management cancel
 *             others: department space.
 * @returns
 */
function detectIfExistsMoveFuture(assignments,dateEnd,message,type){
	try {
		var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-detectIfExistsMoveFuture', 
				assignments,dateEnd,type);
		if(result!=null&&result.message!=""){
			View.alert(message.replace("<{0}>", " "+result.message));
			return true;
		}
	}catch(e){
		Workflow.handleError(e); 
		return false;
	}
	return false;
}

/**
 * re-highlight the drawing plan if exists future trans.
 * @param drawingPanel
 */
function reHightLightIfExistsFuture(drawingPanel,blId,flId,rooms,date,dwgName){
	
	if(rooms.length==0) return; 
	try {
		var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-getRoomAttribute', 
			blId,flId,rooms,date);
		
			if(result.code == "executed"){
				var records = eval('('+result.jsonExpression+')').result;
				
				var opts_selectable = new DwgOpts();
				opts_selectable.rawDwgName = dwgName;        
				opts_selectable.mode = 'none'; 

				var loc = new Ab.drawing.DwgCtrlLoc(blId, flId);
				var opts = new DwgOpts();
				opts.rawDwgName = dwgName;
			    
				for(var i=0; i<records.length;i++){
					//object contains rm_id, real legend level of max occupancy, real max occupancy and room capacity
					var object = records[i];
		    		var rmId = object.rmId;
		    		var maxEmOccupancy = object.maxEmOccupancy;
		    		var capacityEm = object.capacityEm;
		    		var legendLevel = object.legendLevel;
					//code below was useful for debug.
					var color = null;
					if(legendLevel==1){
						color = '0X0000FF';
					}else if(legendLevel==2){
						color = '0XE7CB0A';
					}else if(legendLevel==3){
						color = '0XFF0000';
					}
				    var df = new DwgFill();
				    df.fc = color; //
				    if(rmId){
				    	opts_selectable.appendRec(blId + ';' + flId + ';' + rmId, df);
				    }
					var labels = new Array();
					labels[0] = new DwgLabel("rmpct.count_em", getMessage("messageOccupancy")+": "+ maxEmOccupancy);
					labels[1] = new DwgLabel("rmpct.cap_em", getMessage("messageCapacity")+":  "+ capacityEm);
					opts.appendRec(blId + ';' + flId + ';' + rmId, null, labels);
		    	}
				//kb 3040715 do not 'highlightAssets' if not future records exists.
				if(records.length>0){
					drawingPanel.highlightAssets(opts_selectable);
					drawingPanel.setLabels(loc, opts, 1);
				}
		}
	}catch(e){
		Workflow.handleError(e); 
	}
}	

//kb#3043425:  add logics to check the same day department/move requests.
function existsDepartmentAndMoveOnSameDay(assignments,requestDate, type){
	try {
		var result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-detectDepartmentAndMoveOnSameDay", assignments, requestDate, type);
		return  result.jsonExpression;
	} catch (e) {
		Workflow.handleError(e); 
		return null;
	}
}