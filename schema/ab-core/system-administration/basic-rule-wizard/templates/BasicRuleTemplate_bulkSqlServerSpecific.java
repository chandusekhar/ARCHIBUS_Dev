
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

public class BasicRuleTemplate_bulkSqlServerSpecific extends BasicRuleBase {

public void handle() {
// BEGIN RULE
if (SqlUtils.isOracle()) {
    // Oracle-specific SQL
    SqlUtils.executeUpdate("su", "UPDATE su SET area_comn = (" +
    		"SELECT fl.area_fl_comn_serv * su.area_usable / ${sql.replaceZero('fl.area_su')} " +
    		"FROM fl, bl, site " +
    		"WHERE fl.bl_id = su.bl_id AND fl.fl_id = su.fl_id AND bl.bl_id = su.bl_id " +
    		"AND site.site_id (+) = bl.site_id)");
} else if (SqlUtils.isSybase()) {
    // Sybase-specific SQL
    SqlUtils.executeUpdate("su", "UPDATE su SET area_comn = (" +
        "SELECT fl.area_fl_comn_serv * su.area_usable / ${sql.replaceZero('fl.area_su')} " +
        "FROM fl, bl KEY LEFT OUTER JOIN site " + 
        "WHERE fl.bl_id = su.bl_id AND fl.fl_id = su.fl_id AND bl.bl_id = su.bl_id)");
} else {
    // Microsoft SQL Server-specific SQL
    SqlUtils.executeUpdate("su", "UPDATE su SET area_comn = (" +
        "SELECT fl.area_fl_comn_serv * su.area_usable / ${sql.replaceZero('fl.area_su')} " +
        "FROM fl, bl LEFT OUTER JOIN site ON site.site_id = bl.site_id " + 
        "WHERE fl.bl_id = su.bl_id AND fl.fl_id = su.fl_id AND bl.bl_id = su.bl_id)");
}
// END RULE
}
}
