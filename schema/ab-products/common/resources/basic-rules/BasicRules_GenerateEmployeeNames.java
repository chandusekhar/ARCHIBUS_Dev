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

public class BasicRules_GenerateEmployeeNames extends BasicRuleBase {

public void handle() {
// BEGIN RULE
final String[] fieldNames = new String[] { "em_id", "name", "name_first", "name_last" };
final DataSource dataSource = DataSourceFactory.createDataSourceForFields("em", fieldNames);
dataSource.queryRecords(new RecordHandler() {
    @Override
    public boolean handleRecord(final DataRecord record) {
        final String[] names = org.apache.commons.lang.StringUtils.split(record.getString("em.em_id"), ',');
            if (names.length == 2) {
                final String lastName = org.apache.commons.lang.WordUtils.capitalizeFully(org.apache.commons.lang.StringUtils.trim(names[0]));
                final String firstName = org.apache.commons.lang.WordUtils.capitalizeFully(org.apache.commons.lang.StringUtils.trim(names[1]));
                record.setValue("em.name_first", firstName);
                record.setValue("em.name_last", lastName);
                record.setValue("em.name", lastName + ", " + firstName);
                dataSource.updateRecord(record);
            } else {
                final String lastName = org.apache.commons.lang.WordUtils.capitalizeFully(org.apache.commons.lang.StringUtils.trim(names[0]));
                record.setValue("em.name_last", lastName);
                record.setValue("em.name", lastName);
                dataSource.updateRecord(record);
            }
            return true;
        }
    });



// END RULE
}
}