
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

public class BasicRuleTemplate_fieldOperation extends BasicRuleBase {

public void handle() {
// BEGIN RULE
new FieldOperation()
    .setOwner("wr")
    .setAssigned("wrtr")
    .calculate("wr.cost_est_labor", "SUM", "wrtr.cost_estimated");
// END RULE
}

}
