   function saveOtherCosts()
                { var panel = View.getControl('', 'ab_pm_cf_wr_newother_form');
                record =  ABPMC_getDataRecord(panel);
				var result = {};
				//Save other resource assigment for a work request,file='WorkRequestHandler.java'
				try {
					result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveOtherCosts",record);
				}catch (e) {
        			Workflow.handleError(e);
   				 }
                View.getOpenerView().controllers.get(0).refreshGridPanel();
                }