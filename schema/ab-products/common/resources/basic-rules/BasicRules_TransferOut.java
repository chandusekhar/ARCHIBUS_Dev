import java.io.*;
import java.math.*;
import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.*;
import com.archibus.eventhandler.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

import com.archibus.ext.datatransfer.*;


public class BasicRules_TransferOut extends BasicRuleBase {

public void handle() {
// BEGIN RULE

/*
Sample rule to transfer data out.  To execute this rule:
o Copy this rule to the the schema/ab-site/common/resources/basic-rules folder
o Invoke the rule in your Web browser with a URL in this form:
  http://localhost:8080/archibus/ab-single-job.axvw?ruleId=AbCommonResources-BasicRules_TransferOut
o Press the Start Job button.

The data will appear in your webapps/archibus/projects/users/<username>/dt/ folder.

To modify this rule:
o Navigate to System Administration / ARCHIBUS System Administration / Add-In Manager / Run Basic Rule Wizard
o Use the "modify existing rule" selection.
o Choose this rule file.
o Press Next
o Edit the rule
o Press Test

*/

    DataSource ds ;
    String message ;
    DataTransferJob dtJob = (DataTransferJob) ContextStore.get().getBean(DataTransferJob.DTJOB_BEAN);

    log.debug("Starting");

    status.setResult("Transfer Out");
    status.setTotalNumber(100);


    status.setCurrentNumber(0);
    status.setMessage("Space Hierarchy");


    //	---- Sites
    
    //	Create a datasource.  Parameters: view file, datasource within view to load
    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-site.axvw", "abSpVwSite_ds_0"); 

    //	Write the data to a .csv file.
    //  Parameters: datasource, format,	fileName, subFolder, exportDocuments?
    //  Use "xls" rather than "csv" if you want Excel format output rather than .csv.
    dtJob.transferOutDataSource(ds, "csv", "txfr-site", "", true);

    //	---- Properties

    //  Some space-oriented data sets assign buildings to properties, making Properties
    //	an essential table to read out and in for a space inventory.

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-property.axvw", "abSpVwProperty_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-property", "", true);


    //	---- Buildings

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-bl.axvw", "abSpVwBl_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-bl", "", true);

    //	---- Floors

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-fl.axvw", "abSpVwFl_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-fl", "", true);


    status.setMessage("Organizational Hierarchy");
    status.setCurrentNumber(20);


    //	---- Business Units

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-bu.axvw", "abSpVwBu_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-bu", "", true);

    //	---- Divisions

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-dv.axvw", "abSpVwDv_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-dv", "", true);

    //	---- Departments

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-dp.axvw", "abSpVwDp_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-dp", "", true);


    status.setMessage("Room Categories");
    status.setCurrentNumber(50);

    //	---- Room Categories

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-rmcat.axvw", "abSpVwRmcat_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-rmcat", "", true);


    //	---- Room Types

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-rmtype.axvw", "abSpVwRmtype_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-rmtype", "", true);

    //	---- Room Standards

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-rmstd.axvw", "abSpVwRmstd_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-rmstd", "", true);


    //	---- Rooms.

    status.setMessage("Room Inventory");
    status.setCurrentNumber(80);

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-rm.axvw", "abSpVwRm_ds_0");

    //	To add a restriction, use a method call like the following.
    // ds.addRestriction(Restrictions.and( 
    //		Restrictions.like("rm", "bl_id", "HQ%"),
    //		Restrictions.like("rm", "fl_id", "17%") 
    //		)); 

    
    dtJob.transferOutDataSource(ds, "csv", "txfr-rm", "", true);


    //	---- ARCHIBUS Drawings

    ds = DataSourceFactory.loadDataSourceFromFile("ab-sp-vw-afm-dwgs.axvw", "abSpVwAfmDwgs_ds_0"); 
    dtJob.transferOutDataSource(ds, "csv", "txfr-afm-dwgs", "", true);


    //	---- Activity Parameters -- but just those for Room Inventory.

    String table = "afm_activity_params";
    String[] fields = { "activity_id", "param_id", "param_value", "description" } ;
    
    ds = DataSourceFactory.createDataSourceForFields(table, fields);
    ds.addRestriction(Restrictions.eq( "afm_activity_params", "activity_id", "AbSpaceRoomInventoryBAR" )); 

    dtJob.transferOutDataSource(ds, "csv", "txfr-afm-activity-params-for-rms", "", true);    


    status.setCurrentNumber(100);
    status.setMessage("Finished");
    status.setCode(JobStatus.JOB_COMPLETE);

    log.debug("Stopping");


// END RULE
}
}