
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

public class BasicRuleTemplate_bulkSql extends BasicRuleBase {

public void handle() {
// BEGIN RULE
// Update suite area from manual area
SqlUtils.executeUpdate("su", "UPDATE su SET area_usable = area_manual WHERE area_usable = 0 OR area_usable IS NULL");        
// END RULE
}
}
