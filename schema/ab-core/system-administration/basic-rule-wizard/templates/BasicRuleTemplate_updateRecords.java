
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
// get all rmpct records
String rmpctTable = "rmpct";
String[] rmpctFields = { "pct_id", "date_start", "date_end", "pct_time", "pct_space", "day_part" };
DataSource rmpctDS = DataSourceFactory.createDataSourceForFields(rmpctTable, rmpctFields);
List<DataRecord> records = rmpctDS.getAllRecords();

// for each record
for (DataRecord record : records) {
    double percentTime = record.getDouble("rmpct.pct_time");
    double percentSpace = record.getDouble("rmpct.pct_space");
    int dayPart = record.getInt("rmpct.day_part");

    // if the space percentage empty, then record uses 100% of the space
    if (percentSpace == 0.0) {
        percentSpace = 100.0;
        record.setValue("rmpct.pct_space", percentSpace);
    }

    // if dayPart <> 0, than record uses 50% of the most recently calculated pct_time
    if (dayPart != 0) {
        percentTime = percentTime / 2;
        record.setValue("rmpct.pct_time", percentTime);
    }

    // save changed record
    rmpctDS.saveRecord(record);
}
// END RULE
}
}
