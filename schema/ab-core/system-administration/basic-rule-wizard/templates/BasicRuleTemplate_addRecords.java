
import java.io.*;
import java.math.*;
import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.restriction.*;
import com.archibus.eventhandler.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

public class BasicRuleTemplate_loopSmallDataSource extends BasicRuleBase {

public void handle() {
// BEGIN RULE
// constant for 'VERT' category
final String VERT = "VERT";
    
// get the number of vertical categories (SELECT count(rm_cat) FROM rmcat WHERE supercat = 'VERT') 
int numberOfVerticalCategories = DataStatistics.getInt(
    "rmcat", "rm_cat", "count", "rmcat.supercat = '" + VERT + "'");

// create data sources for adding new records (specify fields that will be saved)
String rmcatTable = "rmcat";
String[] rmcatFields = { "rm_cat", "supercat", "description", "occupiable" };
DataSource rmcatDS = DataSourceFactory.createDataSourceForFields(rmcatTable, rmcatFields);

String rmtypeTable = "rmtype";
String[] rmtypeFields = { "rm_cat", "rm_type", "description" };
DataSource rmtypeDS = DataSourceFactory.createDataSourceForFields(rmtypeTable, rmtypeFields);

// if vertical categories records do not exist, create them
if (numberOfVerticalCategories == 0) {
      DataRecord record = rmcatDS.createNewRecord();
      record.setValue("rmcat.rm_cat", VERT);
      record.setValue("rmcat.supercat", VERT);
      record.setValue("rmcat.description", "Vertical Penetration");
      record.setValue("rmcat.occupiable", 0);
      rmcatDS.saveRecord(record);

      record = rmtypeDS.createNewRecord();
      record.setValue("rmtype.rm_cat", VERT);
      record.setValue("rmtype.rm_type", VERT);
      record.setValue("rmtype.description", "Vertical Penetration");
      rmtypeDS.saveRecord(record);
}
// END RULE
}
}
