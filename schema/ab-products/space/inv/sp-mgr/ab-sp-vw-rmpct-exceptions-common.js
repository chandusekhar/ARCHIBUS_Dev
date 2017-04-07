
/**
 * Space Allocate Pct For Button
 */
function openSpaceAllocatePctForButton1(){
	View.openDialog('ab-sp-alloc-pct.axvw');
}
/**
 * Open Space Assign Rm Attribute For Button2
 */
function openSpaceAssignRmAttributeForButton2(){
	View.openDialog('ab-sp-asgn-rm-attributes.axvw');
}

/**
 * Run Synchronize Shared Rooms For Button3
 */
function runSynchronizeSharedRoomsForButton3(){
	 try { 	  
		var jobId = Workflow.startJob('AbCommonResources-SpaceService-synchronizeSharedRooms');
		if (valueExists(jobId)) {			
			// open the progress bar dialog
			View.openJobProgressBar(getMessage('synchronizing'),  jobId, '', function(status) {
				if(status.jobFinished == true){						
					View.alert(getMessage("synchronizeSharedRooms"));
				}
			});
		}				
     } 
     catch (e) {
         Workflow.handleError(e);
     }
}
/**
 * Set Exceptions List
 */
function getAllocationTypeList(){
	var records=['allocation1','allocation2','allocation3'];
	// get dropdown list by itemSelectId
	var itemSelect = $('allocatedType');
	//populate select items to dropdown list and set default value
    for (var i = 0; i < records.length; i++) {
        var item = getMessage(records[i]);
        var option = document.createElement('option');
        option.value = item;
        var m=0;
        option.appendChild(document.createTextNode(item));
        for(var j = 0; j < itemSelect.options.length; j++){
        	if(itemSelect.options[j].value==option.value){
        		m++;
        		break;
        	}
        	
        }
        if(m==0){
        itemSelect.appendChild(option);
        }
        
    }
   
}

/**
 * Set Exceptions List
 */
function getExceptionsList(){
	var records=['exception1','exception2','exception3','exception4','exception5','exception6','exception7','exception8','exception9','exception10','exception11'];
	// get dropdown list by itemSelectId
	var itemSelect = $('exceptions');
	//populate select items to dropdown list and set default value

    for (var i = 0; i < records.length; i++) {
        var item = getMessage(records[i]);
        var option = document.createElement('option');
        option.value = item;
        option.appendChild(document.createTextNode(item));
        itemSelect.appendChild(option);
    }
}

//get option index of list
function getOptionIndex(select, value) {
	if(!select.options||select.options.length==0) return -1;
	if(''==value) return 0;
	for(var oNum = 0; oNum != select.options.length; oNum++) {
		if(select.options[oNum].value == value) return oNum;
	}
	return -1;
}

/**
 * Get sql by list option index
 * @param fromTab value is 'tab1'|'tab2'
 * @param optionIndex
 * @returns {String} sql string
 */
function getParamSql(optionIndex) {
	var sqlParam = '1=1';

	var sql1 = " exists(select 1 from rmpct where rmpct.bl_id=rm.bl_id and rmpct.fl_id=rm.fl_id and rmpct.rm_id=rm.rm_id and rmpct.prorate <>'NONE' and rmpct.dp_id is not null AND rmpct.area_rm >0 AND rmpct.status = 1 )";
	var sql2 = " exists(select 1 from rmpct LEFT OUTER JOIN rmcat ON rmpct.rm_cat=rmcat.rm_cat where rmpct.bl_id=rm.bl_id and rmpct.fl_id=rm.fl_id and rmpct.rm_id=rm.rm_id and rmpct.prorate ='NONE' and rmpct.dp_id is null and rmcat.supercat <> 'VERT' AND rmpct.area_rm >0 AND rmpct.status = 1 )";
	var sql3 = " exists(select 1 from rmpct LEFT OUTER JOIN rmcat ON rmpct.rm_cat=rmcat.rm_cat where rmpct.bl_id=rm.bl_id and rmpct.fl_id=rm.fl_id and rmpct.rm_id=rm.rm_id and  (rmpct.prorate <> 'NONE' OR rmpct.dp_id IS NOT NULL  )AND( rmcat.supercat = 'VERT') AND rmpct.area_rm >0 AND rmpct.status = 1 )";
	var sql4 = "  rm.cap_em < ((SELECT COUNT(DISTINCT(em_id)) FROM rmpct WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND rmpct.em_id IS NOT NULL AND rmpct.date_start <=  ${sql.currentDate} AND (rmpct.date_end >=  ${sql.currentDate} or rmpct.date_end is null ) AND rmpct.status = 1 AND rmpct.day_part = 0) + (SELECT 0.5 * COUNT(DISTINCT(em_id)) FROM rmpct WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND rmpct.em_id IS NOT NULL AND rmpct.date_start <=  ${sql.currentDate} AND (rmpct.date_end >=  ${sql.currentDate} or rmpct.date_end is null) AND rmpct.status = 1 AND rmpct.day_part != 0))";
	var sql5 = "  rm.cap_em < ((SELECT COUNT(DISTINCT(em_id)) FROM rmpct WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND rmpct.em_id IS NOT NULL AND (rmpct.status = 0 OR (rmpct.status = 1 AND rmpct.date_end IS NULL)) AND rmpct.day_part = 0) + ( SELECT 0.5 * COUNT(DISTINCT(em_id)) FROM rmpct WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND rmpct.em_id IS NOT NULL AND (rmpct.status = 0 OR (rmpct.status = 1 AND rmpct.date_end IS NULL)) AND rmpct.day_part != 0))";
	//var sql6 = " 1<(SELECT COUNT(1) FROM rmpct  WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND  rmpct.dv_id IS NOT NULL AND rmpct.dp_id IS NOT NULL AND rmpct.primary_rm = 1 AND rmpct.date_start >= ${sql.currentDate} AND rmpct.date_end IS NULL AND status IN (0, 1) AND (bl_id + fl_id + rm_id) in ( select (bl_id + fl_id + rm_id) from (select bl_id , fl_id , rm_id,dv_id,dp_id from rmpct  where pct_id in (select max(pct_id) from rmpct GROUP BY bl_id , fl_id , rm_id,dv_id,dp_id)) t GROUP BY (bl_id + fl_id + rm_id) HAVING count(1)>1))";
	
	
	var sql6="1 <(SELECT COUNT(1) FROM rmpct ${sql.as} rmpct WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND rmpct.dv_id IS NOT NULL  AND rmpct.dp_id IS NOT NULL AND rmpct.primary_rm = 1 AND rmpct.date_start >= ${sql.currentDate} AND rmpct.date_end IS NULL   AND status IN(0,    1) and exists( select 1 from rmpct ${sql.as} a where rmpct.bl_id = a.bl_id  AND rmpct.fl_id = a.fl_id  AND rmpct.rm_id = a.rm_id and exists(select 1 from rmpct ${sql.as} b where a.bl_id=b.bl_id and a.fl_id=b.fl_id and a.rm_id=b.rm_id and b.dv_id${sql.concat}b.dp_id !=a.dv_id${sql.concat}a.dp_id )   )) ";

	
	var sql7 = " exists( select 1 from rmpct WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id = rmpct.rm_id AND rmpct.primary_rm = 1 AND (rmpct.dv_id != rm.dv_id OR rmpct.dp_id != rm.dp_id OR rmpct.rm_cat != rm.rm_cat OR rmpct.rm_type != rm.rm_type) AND rmpct.status = 1 AND (rmpct.date_start IS NULL OR rmpct.date_start <= ${sql.currentDate}) AND (rmpct.date_end IS NULL OR rmpct.date_end >= ${sql.currentDate}))";
	var sql8 = " exists(select bl_id,fl_id,rm_id,em_id ,from_bl_id,from_fl_id ,from_rm_id ,pct_id from rmpct   ${sql.as} rmpct  WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id = rmpct.rm_id AND rmpct.from_bl_id is not null and rmpct.from_fl_id is not null and rmpct.from_rm_id is not null and not exists (select 1 FROM (select  bl_id,fl_id,rm_id,em_id ,from_bl_id,from_fl_id ,from_rm_id ,pct_id  from rmpct union select  bl_id,fl_id,rm_id,em_id ,from_bl_id,from_fl_id ,from_rm_id ,pct_id  from hrmpct)  ${sql.as} b WHERE rmpct.from_bl_id = b.bl_id  AND rmpct.from_fl_id = b.fl_id AND rmpct.from_rm_id = b.rm_id   AND rmpct.em_id = b.em_id ))";

	var sql9 = " rm.area_alloc!=0";
		

	var sql10=" EXISTS(SELECT 1 FROM rmpct ${sql.as} a  WHERE exists( SELECT 1 FROM rmpct ${sql.as} b  WHERE a.bl_id = b.bl_id  AND a.fl_id = b.fl_id  AND a.rm_id = b.rm_id  AND em_id IS NULL  AND ((date_start IS NULL OR date_start <= ${sql.currentDate}) AND (date_end IS NULL OR date_end >= ${sql.currentDate})) AND RTRIM(a.dv_id)${sql.concat}RTRIM(a.dp_id) != RTRIM(b.dv_id)${sql.concat}RTRIM(b.dp_id)) and rm.bl_id = a.bl_id AND rm.fl_id = a.fl_id AND rm.rm_id = a.rm_id AND em_id IS NOT NULL AND((date_start IS NULL OR date_start <= ${sql.currentDate}) AND (date_end IS NULL OR date_end >= ${sql.currentDate}))) " ;
	
	
	var sql11 = "  rm.hotelable = 0 and rm.cap_em < (SELECT COUNT(1) FROM rmpct, rmcat WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND rmpct.status = 1 AND (rmpct.date_start IS NULL OR rmpct.date_start <= ${sql.currentDate}) AND (rmpct.date_end IS NULL OR rmpct.date_end >= ${sql.currentDate}) AND rm.rm_cat = rmcat.rm_cat AND rmcat.occupiable = 1 )";
	
	var sql81 = " rm.area_alloc!=0 and rm.area_alloc!=rm.area";
	var sql82 = " rm.area_alloc!=0 and rm.area_alloc>rm.area";
	var sql83 = " rm.area_alloc!=0 and rm.area_alloc<rm.area";
	optionIndex = optionIndex + 1;
	if (optionIndex == 1) {
		sqlParam = sql1;
	} else if (optionIndex == 2) {
		sqlParam = sql2;
	} else if (optionIndex == 3) {
		sqlParam = sql3;
	} else if (optionIndex == 4) {
		sqlParam = sql4;
	} else if (optionIndex == 5) {
		sqlParam = sql5;
	} else if (optionIndex == 6) {
		sqlParam = sql6;
	} else if (optionIndex == 7) {
		sqlParam = sql7;
	} else if (optionIndex == 8) {
		sqlParam = sql8;
	} else if (optionIndex == 9) {
		sqlParam = sql9;
	}else if (optionIndex == 10) {
			sqlParam = sql10;
	}else if (optionIndex == 11) {
			sqlParam = sql11;
	}else if(optionIndex == 81){
		sqlParam = sql81;
	}else if(optionIndex == 82){
		sqlParam = sql82;
	}else if(optionIndex == 83){
		sqlParam = sql83;
	}
	return sqlParam;
}
