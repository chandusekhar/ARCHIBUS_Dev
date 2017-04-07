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

public class BasicRules_GenerateDescriptions extends BasicRuleBase {

public void handle() {
// BEGIN RULE
        final String[] fieldNames = new String[] { "cost_cat_id", "description" };
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields("cost_cat", fieldNames);
        dataSource.queryRecords(new RecordHandler() {
            
            @Override
            public boolean handleRecord(final DataRecord record) {
                final String description =
                        org.apache.commons.lang.WordUtils.capitalizeFully(record.getString("cost_cat.cost_cat_id"));
                record.setValue("cost_cat.description", description);
                dataSource.updateRecord(record);
                return true;
            }
        });
// END RULE
}
}