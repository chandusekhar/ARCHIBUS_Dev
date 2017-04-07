/**
 * @author: Eric_Maxfield@archibus.com
 * 			2015.05.20
 */

var abRiskMsdsRptInvExcepController = View.createController('abRiskMsdsRptInvExcepController', {
	
	afterInitialDataFetch : function() {
		this.abRiskMsdsInvExcepGrid.addParameter('tier2_notListed', getMessage('msg_tier2_notListed'));
		this.abRiskMsdsInvExcepGrid.addParameter('tier2_unknown', getMessage('msg_tier2_unknown'));
		this.abRiskMsdsInvExcepGrid.addParameter('tier2_hazardous', getMessage('msg_tier2_hazardous'));
		this.abRiskMsdsInvExcepGrid.addParameter('tier2_extremelyHazardous', getMessage('msg_tier2_extremelyHazardous'));
		this.abRiskMsdsInvExcepGrid.refresh();
	},
	
	afterViewLoad : function() {
		// highlight details grid cells depending on inventory status
	    this.abRiskMsdsInvExcepGrid.afterCreateCellContent = function(row, column, cellElement) {
	    	var containerStatus = (row['msds_h_location.container_status.raw'] != undefined) ? row['msds_h_location.container_status.raw'] : row['msds_h_location.container_status'];
			if (column.id == 'msds_h_location.container_status')	{
				if (containerStatus == 'MISSING') {
					cellElement.style.background = '#FF6969';
				}
			}
			var tier2 = (row['msds_h_location.tier2.raw'] != undefined) ? row['msds_h_location.tier2.raw'] : row['msds_h_location.tier2'];
			if (column.id == 'msds_h_location.tier2')	{
				if (tier2 == 'Unknown')	{
					cellElement.style.background = '#61C0C0';
				}
				else if (tier2 == 'Not Listed') {
					cellElement.style.background = '#69FF69';
				}
				else if (tier2 == 'Hazardous') {
					cellElement.style.background = '#FFAD69';
				}
				else if (tier2 == 'Extremely Hazardous') {
					cellElement.style.background = '#FF6969';
				}
			}
	    }
	},
	
	/**
     * supplemental event handler for filter console 'show' action
     */
	abRiskMsdsInvExcepConsole_onClear: function(){		
		//reset the exception condition selector field
		$('msdsInvExcep_exceptionSelect').value = 'none';
//		$('msdsInvExcep_invOnlyCheck').checked = true;
		this.abRiskMsdsInvExcepConsole.enableField('msds_h_location.custodian_id','true');
	},
	
	/**
     * event handler for filter console 'show' action
     */
	abRiskMsdsInvExcepConsole_onFilter: function(){
       var restriction = this.abRiskMsdsInvExcepConsole.getFieldRestriction();       
       var selectedValue = $('msdsInvExcep_exceptionSelect').value;
       
       if(valueExistsNotEmpty(restriction.clauses)){
    	   var len = restriction.clauses.length;
           for(var i=0; i<len; i++) {    	   
    		   if(restriction.clauses[i].name=='msds_h_location.date_last_inv' || restriction.clauses[i].name=='msds_h_location.date_updated'){
    			   restriction.clauses[i].op='<';
    		   }
           }
       } else {
    	   restriction = new Ab.view.restriction();    	  
       }
       
       //clear any previous restriction parameter setting
       this.abRiskMsdsInvExcepGrid.addParameter('selectedExceptionCondition','1=1');
       
       if (selectedValue == 'none') {		
    	   //do nothing here for now
       } else if (selectedValue == 'missingItems') {
	   		restriction.addClause('msds_h_location.container_status','Missing','=');
       } else if (selectedValue == 'noCustodian') {
	   		restriction.addClause('msds_h_location.custodian_id','','IS NULL');       
       } else if (selectedValue == 'newAdditions') {
    	   this.abRiskMsdsInvExcepGrid.addParameter('selectedExceptionCondition','auto_number IN (								\
    			   									SELECT DISTINCT(h2.auto_number) FROM msds_h_location h2 						\
    			   									WHERE (h2.date_archived ${sql.concat} h2.time_archived) = 								\
    			   										(SELECT MIN(h1.date_archived ${sql.concat} h1.time_archived) FROM msds_h_location h1 	\
    			   										 WHERE h2.auto_number = h1.auto_number 									\
    			   										   AND h2.date_last_inv = h2.date_archived) \
    			   									AND h2.date_last_inv = (SELECT MAX(h3.date_last_inv) FROM msds_h_location h3 WHERE \
    			   									h2.auto_number = h3.auto_number AND h3.date_last_inv IS NOT NULL) )');
	   } else if (selectedValue == 'locChange') {
		   this.abRiskMsdsInvExcepGrid.addParameter('selectedExceptionCondition','auto_number IN (  \
				   SELECT DISTINCT(auto_number) FROM msds_h_location h1  \
				       WHERE \
				           h1.date_last_inv = ( SELECT MAX(date_last_inv) FROM msds_h_location h3  \
				                               WHERE h3.auto_number = h1.auto_number AND h3.date_last_inv IS NOT NULL )  \
				          AND  \
				           COALESCE(h1.bl_id ${sql.concat} h1.fl_id ${sql.concat} h1.rm_id ${sql.concat} h1.aisle_id ${sql.concat} h1.cabinet_id ${sql.concat} h1.shelf_id ${sql.concat} h1.bin_id,\'null\')  \
				           NOT IN  \
				           (SELECT COALESCE(h2.bl_id ${sql.concat} h2.fl_id ${sql.concat} h2.rm_id ${sql.concat} h2.aisle_id	${sql.concat} h2.cabinet_id ${sql.concat} h2.shelf_id ${sql.concat} h2.bin_id,\'null\')  \
				        		   FROM msds_h_location h2  \
				               WHERE  \
				                   h2.auto_number = h1.auto_number  \
				                 AND  \
				                   h2.date_archived ${sql.concat} h2.time_archived =  \
				                       ( SELECT MAX(date_archived ${sql.concat} time_archived) FROM msds_h_location h4  \
				                           WHERE (h4.date_last_inv IS NULL OR h4.date_last_inv < h1.date_last_inv)  \
				                           AND h4.auto_number = h2.auto_number  \
				                           AND h4.date_archived ${sql.concat} time_archived < h1.date_archived ${sql.concat} h1.time_archived  \
				                       )  \
				           )  \
		   											)');
	   } else if (selectedValue == 'custChange') {
		   this.abRiskMsdsInvExcepGrid.addParameter('selectedExceptionCondition','auto_number IN (								\
					   SELECT DISTINCT(auto_number) FROM msds_h_location h1  \
					       WHERE \
					           h1.date_last_inv = ( SELECT MAX(date_last_inv) FROM msds_h_location h3  \
					                               WHERE h3.auto_number = h1.auto_number AND h3.date_last_inv IS NOT NULL )  \
					          AND  \
					           COALESCE(custodian_id,\'null\')  \
					           NOT IN  \
					           (SELECT COALESCE(custodian_id,\'null\')  \
					        		   FROM msds_h_location h2  \
					               WHERE  \
					                   h2.auto_number = h1.auto_number  \
					                 AND  \
					                   h2.date_archived ${sql.concat} h2.time_archived =  \
					                       ( SELECT MAX(date_archived ${sql.concat} time_archived) FROM msds_h_location h4  \
					                           WHERE (h4.date_last_inv IS NULL OR h4.date_last_inv < h1.date_last_inv)  \
					                           AND h4.auto_number = h2.auto_number  \
					                           AND h4.date_archived ${sql.concat} time_archived < h1.date_archived ${sql.concat} h1.time_archived  \
					                       )  \
					           )  \
		   											)');
	   } else if (selectedValue == 'disposed') {
		   this.abRiskMsdsInvExcepGrid.addParameter('selectedExceptionCondition','auto_number IN (								\
		   											SELECT DISTINCT(h2.auto_number) FROM msds_h_location h1, msds_h_location h2	\
		   											WHERE h1.auto_number = h2.auto_number 										\
		   												AND h1.container_status != h2.container_status  						\
				   										AND h2.container_status = \'Disposed\'  								\
		   												AND (h1.date_last_inv <= h2.date_last_inv 								\
		   														OR ((h1.date_last_inv IS NULL AND h2.date_last_inv IS NOT NULL)	\
														   AND 																	\
														    h2.date_archived ${sql.concat} h2.time_archived = 									\
														    (SELECT MAX(h3.date_archived ${sql.concat} h3.time_archived) FROM msds_h_location h3	\
						   											WHERE h3.auto_number = h2.auto_number 							\
					   												AND h3.container_status = \'Disposed\'  						\
														            )															\
														        )																\
															) 																	\
														 )');
	   } else if (selectedValue == 'commentsChange') {
		   this.abRiskMsdsInvExcepGrid.addParameter('selectedExceptionCondition','auto_number IN (								\
														    SELECT DISTINCT(h2.auto_number) FROM msds_h_location h2				\
														    WHERE h2.comments IS NOT NULL 										\
														    AND h2.comments NOT IN 												\
														        (SELECT comments FROM msds_h_location h1 WHERE 					\
														            (															\
														                h2.date_last_inv IS NOT NULL							\
														                AND														\
														                    (h1.date_last_inv < h2.date_last_inv 				\
														                    AND													\
														                    h1.date_last_inv IS NULL)							\
														            )															\
														        )																\
														    AND 																\
														    date_archived ${sql.concat} time_archived = 									\
														    (SELECT MAX(date_archived ${sql.concat} time_archived) FROM msds_h_location h2	\
														    WHERE h2.comments IS NOT NULL 										\
														    AND h2.comments NOT IN 												\
														        (SELECT comments FROM msds_h_location h1 WHERE 					\
														            (															\
														                h2.date_last_inv IS NOT NULL							\
														                AND														\
														                    (h1.date_last_inv < h2.date_last_inv 				\
														                    AND													\
														                    h1.date_last_inv IS NULL)							\
														            )															\
														        )																\
				    										) 																	\
														 )');
	   }
       
       this.abRiskMsdsInvExcepGrid.refresh(restriction);
		//select the Material Inventory Status tab
       this.tabsMsdsExceptionsRpt.selectTab('invExcepGrid');
    }
    
});

function setExceptionAnalysis() {
	var controller = View.controllers.get('abRiskMsdsRptInvExcepController');	
	var selectedValue = $('msdsInvExcep_exceptionSelect').value;
	
	controller.abRiskMsdsInvExcepConsole.enableField('msds_h_location.custodian_id','true');
	if (selectedValue == 'none') {		
		return;
	} else if (selectedValue == 'noCustodian') {
		//clear and disable the custodian console form field
		controller.abRiskMsdsInvExcepConsole.setFieldValue('msds_h_location.custodian_id','');
		controller.abRiskMsdsInvExcepConsole.enableField('msds_h_location.custodian_id',false);
	}
	
}
