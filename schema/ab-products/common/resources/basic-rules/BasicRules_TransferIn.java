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
import com.archibus.ext.importexport.*;
import com.archibus.ext.importexport.importer.*;
import com.archibus.ext.importexport.common.*;


public class BasicRules_TransferIn extends BasicRuleBase {

public void handle() {
// BEGIN RULE

/*
Sample rule to transfer data in.  To execute this rule:

o Copy this rule to the the schema/ab-site/common/resources/basic-rules folder

o Invoke the rule in your Web browser with a URL in this form:
  http://localhost:8080/archibus/ab-single-job.axvw?ruleId=AbCommonResources-BasicRules_TransferIn

o Press the Start Job button.

The script will import the .csv-format data transfer files from your webapps/archibus/projects/users/<username>/dt/ folder.

*/

    DatabaseImporter databaseImporter = (DatabaseImporter) ContextStore.get().getBean(DatabaseImporterImpl.DATABASEIMPORTOR_BEAN);
    String fileNameWithPath ;

    log.debug("Starting");

    status.setResult("Transfer In");
    status.setTotalNumber(100);


    status.setCurrentNumber(0);
    status.setMessage("Space Hierarchy");

    //	---- Sites
    
    //	Get the file from the default location for this user, i.e. the webapps/archibus/projects/users/<username>/dt/ folder

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-site.csv");

    //	Read the data from a .csv file.
    // Parameters:
    //	full file name,
    //	import documents?,
    //	root path for documents,
    //	generate comparison report?
    //	continue if there are errors?
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);

    //	---- Properties

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-property.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);
    
    //	---- Buildings

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-bl.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);

    //	---- Floors

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-fl.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);


    status.setMessage("Organizational Hierarchy");
    status.setCurrentNumber(20);

    //	---- Business Units

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-bu.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);

    //	---- Divisions

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-dv.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);


    //	---- Departments

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-dp.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);


    status.setMessage("Room Categories");
    status.setCurrentNumber(50);


    //	---- Room Categories

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-rmcat.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);


    //	---- Room Types

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-rmtype.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);


    //	---- Room Standards

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-rmstd.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);


    //	---- Rooms.

    status.setMessage("Room Inventory");
    status.setCurrentNumber(80);


    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-rm.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);


    //	---- ARCHIBUS Drawings

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-afm-dwgs.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);

    //	---- Activity Parameters -- but just those exported for Room Inventory.

    fileNameWithPath = FileHelper.composeFullFileName(FileHelper.getDefaultStorePath(""), "txfr-afm-activity-params-for-rms.csv");
    databaseImporter.importData(fileNameWithPath, true, "", true, "", true);


    status.setCurrentNumber(100);
    status.setMessage("Finished");
    status.setCode(JobStatus.JOB_COMPLETE);

    log.debug("Stopping");



// END RULE
}
}