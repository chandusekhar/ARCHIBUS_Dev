
import java.io.*;
import java.math.*;
import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.*;
import com.archibus.eventhandler.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

public class BasicRuleTemplate_loopLargeDataSource extends BasicRuleBase {

public void handle() {
// BEGIN RULE
String tableName = "wo";
String[] fieldNames = { "wo_id", "wo_type", "date_assigned", "priority", "description" };
DataSource woDS = DataSourceFactory.createDataSourceForFields(tableName, fieldNames);

// a buffer for a long text message
final StringBuffer messageBuffer = new StringBuffer("Work orders:\n");

// scroll through all records
woDS.queryRecords(new RecordHandler() {

    // this callback method is called for each retrieved record
    public boolean handleRecord(DataRecord record) {

        // add the work order ID to the message buffer
        messageBuffer.append(record.getInt("wo.wo_id"));
        messageBuffer.append("\n");

        return true; // true to continue scrolling through the result set, false to stop
    }
});

// print the message
log.debug(messageBuffer.toString());
// END RULE
}
}
