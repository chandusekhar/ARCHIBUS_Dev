package com.archibus.eventhandler.compliance;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.StringUtil;

/**
 * Compliance Common Handler.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class ComplianceRequirementProcessor {
    
    /**
     * Takes a Compliance Requirement record (regrequirement.reg_requirement) that is to be deleted
     * and removes all associated future events and notifications.
     * 
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * 
     */
    public void deleteComplianceRequirement(final String regulation, final String program,
            final String requirement) {
        
        if (StringUtil.notNullOrEmpty(regulation) && !Constant.NULL.equalsIgnoreCase(regulation)) {
            
            final ComplianceLocationProcessor helper = new ComplianceLocationProcessor();
            // construct a restriction from passed un-empty primary keys to regloc
            final StringBuilder reglocRestriction = new StringBuilder();
            {
                reglocRestriction.append(" regloc.regulation='").append(regulation)
                    .append(Constant.LEFT_SINGLE_QUOTATION);
                
                if (StringUtil.notNullOrEmpty(program) && !Constant.NULL.equalsIgnoreCase(program)) {
                    
                    reglocRestriction.append(" and regloc.reg_program='").append(program)
                        .append(Constant.LEFT_SINGLE_QUOTATION);
                    
                }
                
                if (StringUtil.notNullOrEmpty(requirement)
                        && !Constant.NULL.equalsIgnoreCase(requirement)) {
                    reglocRestriction.append(" and regloc.reg_requirement='").append(requirement)
                        .append(Constant.LEFT_SINGLE_QUOTATION);
                    
                }
            }
            
            // delete associated reglocs
            {
                // get location_id array of all reglocs to be deleted
                final DataSource dsRegloc = ComplianceUtility.getDataSourceRegloc();
                final List<DataRecord> reglocs = dsRegloc.getRecords(reglocRestriction.toString());
                
                ComplianceSqlHelper.deleteReglocs(reglocRestriction.toString());
                
                // For each regloc record, if regloc.location_id does not exist in docs_assigned,
                // regviolation, ls_comm, activity_log, then also delete the associated
                // compliance_locations record
                for (final DataRecord regloc : reglocs) {
                    helper.deleteLocation(regloc.getInt("regloc.location_id"), 0);
                }
            }
            
            // delete associated activity_log and notifications
            {
                // construct a restriction to activity_log: date_scheduled > today() AND status NOT
                // IN (COMPLETED, COMPLETED-V, CLOSED).
                final StringBuilder eventRestriction = new StringBuilder();
                eventRestriction
                    .append(
                        reglocRestriction.toString().replaceAll(Constant.REGLOC,
                            Constant.ACTIVITY_LOG))
                    .append(
                        " AND activity_log.status NOT IN ('COMPLETED', 'COMPLETED-V', 'CLOSED') ")
                    .append(" AND activity_log.date_scheduled>")
                    .append(SqlUtils.formatValueForSql(new Date()));
                
                ComplianceSqlHelper.deleteNotifications(eventRestriction.toString());
                
                helper.deleteLocationsByEvents(eventRestriction.toString());
                ComplianceSqlHelper.deleteEvents(eventRestriction.toString());
                
            }
        }
    }
    
}
