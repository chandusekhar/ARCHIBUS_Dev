package com.archibus.app.bldgops.express;

import java.util.List;

/**
 * Bldgops Express Service holds Workflow Rule methods.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public class BldgopsExpressService {
    
    /**
     * 
     * Detect if currently need to prompt the user to run WFR updateSLAStepsToWorkRequest.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     */
    public void determineIfOnDemandOnly(final int workRequestsOnly) {
        
        new BldgopsExpressFinder().detectUpdateSLAStepsToWorkRequest(workRequestsOnly);
        
    }
    
    /**
     * 
     * Start a job to perform logics for Using Building Operation Console.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     * @param isWorkRequestOnlyChanged int '1' or '0' to indicate if passed in workRequestsOnly is
     *            different with original stored one in DataBase.
     * @param needUpdateSLAStepsToWorkRequest int '1' or '0' to indicate need to execute logics for
     *            transferring SLA data from HelpDesk to OnDemand.
     */
    public void useBldgsOperationConsole(final int workRequestsOnly,
            final int isWorkRequestOnlyChanged, final int needUpdateSLAStepsToWorkRequest) {
        
        final BldgopsExpressUpgrade bldgopsExpressUpgrade =
                new BldgopsExpressUpgrade(workRequestsOnly, isWorkRequestOnlyChanged,
                    needUpdateSLAStepsToWorkRequest);
        
        BldgopsExpressUtility.runJob(bldgopsExpressUpgrade);
    }
    
    /**
     * 
     * Update the display value of field 'status' and dispatch step according to value of
     * WorkRequestsOnly.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     */
    public void updateStatusAndStepByWorkRequestsOnly(final int workRequestsOnly) {
        
        final BldgopsExpressWorkRequestOnly bldgopsExpressWorkRequestOnly =
                new BldgopsExpressWorkRequestOnly(workRequestsOnly);
        
        BldgopsExpressUtility.runJob(bldgopsExpressWorkRequestOnly);
    }
    
    /**
     * 
     * Start a job to generate the work request details report and return the result.
     * 
     * @param workRequestIds List of work request ids.
     * @param viewName String paginate report name.
     * @param reportType String output type of report file: DOCX or PDF.
     */
    public void printWorkRequestDetails(final List<String> workRequestIds, final String viewName,
            final String reportType) {
        
        final BldgopsExpressPrinter reportPrinter =
                new BldgopsExpressPrinter(workRequestIds, viewName, reportType);
        BldgopsExpressUtility.runJob(reportPrinter);
        
    }
    
    /**
     * 
     * Start a job to DELETE all sample related to 'BOSMED'.
     * 
     */
    public void deleteSampleDataOfBOSMED() {
        
        final BldgopsExpressBosmedDataDelete bldgopsExpressBosmedDataDelete =
                new BldgopsExpressBosmedDataDelete();
        BldgopsExpressUtility.runJob(bldgopsExpressBosmedDataDelete);
    }
    
}
