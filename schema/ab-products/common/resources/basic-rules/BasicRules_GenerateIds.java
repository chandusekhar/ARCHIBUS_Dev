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

public class BasicRules_GenerateIds extends BasicRuleBase {

public void handle() {
// BEGIN RULE
        final String tableName = "dp";
        final String[] fieldNames = { "dp_id", "dv_id" };
        final String fullName = "dp.dp_id";
        final int fieldSize = 4;
        
        final java.util.concurrent.atomic.AtomicInteger idGenerator = new java.util.concurrent.atomic.AtomicInteger();
        final Random randomIdGenerator = new Random();

        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(tableName, fieldNames);
        dataSource.queryRecords(new RecordHandler() {
            
            @Override
            public boolean handleRecord(final DataRecord record) {
                final String currentId = record.getString(fullName);
                if (!(currentId.startsWith("AI") || currentId.startsWith("AFM") || currentId
                    .startsWith("Z-"))) {

                    // if you need sequential numeric IDs:
                    final int nextId = idGenerator.incrementAndGet();
                    final String nextIdString =
                            org.apache.commons.lang.StringUtils.leftPad(Integer.toString(nextId), fieldSize, '0');
                    //record.setValue(fullName, nextIdString);

                    // if you need random numeric IDs:
                    final StringBuilder randomNextId = new StringBuilder(fieldSize - 1);
                    for (int i = 0; i < fieldSize - 1; i++) {
                        randomNextId.append((char) ('0' + randomIdGenerator.nextInt(10)));
                    }
                    record.setValue(fullName, "00" + randomNextId.toString());

                    dataSource.saveRecord(record);
                }
                return true;
            }
        });



// END RULE
}
}