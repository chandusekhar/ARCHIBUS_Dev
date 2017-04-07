
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

public class BasicRuleTemplate_job extends BasicRuleBase {

public void handle() {
// BEGIN RULE
status.setResult("Hello World");
status.setTotalNumber(100);
status.setCurrentNumber(0);
status.setMessage("Starting");

// do some operation that takes time

status.setCurrentNumber(50);
status.setMessage("Halfway");

// do another operation that takes time

status.setCurrentNumber(100);
status.setMessage("Finished");
status.setCode(JobStatus.JOB_COMPLETE);
// END RULE
}
}
