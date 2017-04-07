package com.archibus.eventhandler.compliance;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Test class ComplianceEventHelper. file.
 * 
 * @since 20.1
 * 
 */
public class ComplianceEventProcessorTest extends DataSourceTestBase {
    
    /**
     * Define string REGULATION.
     */
    private static final String REGULATION = "CAA";
    
    /**
     * Define string REGULATION.
     */
    private static final String INSTALLATION_PERMIT = "INSTALLATION PERMIT";
    
    /**
     * Define string REGULATION.
     */
    private static final String CHK_INSTRUMENT_CALIBRATIONS = "CHK INSTRUMENT CALIBRATIONS";
    
    /**
     * Test DeleteEventsAndNotifications method.
     */
    public static void testDeleteEventsAndNotifications() {
        
        ComplianceEventProcessor.deleteEventsAndNotifications(REGULATION, INSTALLATION_PERMIT,
            CHK_INSTRUMENT_CALIBRATIONS, false);
        
        final String isReplaceAll = " 1=0 ";
        
        final List<DataRecord> notifications =
                getNotifications(REGULATION, INSTALLATION_PERMIT, CHK_INSTRUMENT_CALIBRATIONS,
                    isReplaceAll);
        
        // @translatable
        final String message1 = "Delete Notifications Success";
        if (!notifications.isEmpty()) {
            
            System.out.print(message1);
        }
        
        final List<DataRecord> events =
                getEvents(REGULATION, INSTALLATION_PERMIT, CHK_INSTRUMENT_CALIBRATIONS,
                    isReplaceAll);
        
        // @translatable
        final String message2 = "Delete Events Success";
        if (!events.isEmpty()) {
            System.out.print(message2);
        }
        
    }
    
    /**
     * Get Notifications by given regulation ,program,requirement.
     * 
     * @param regulation regulation of requirement record.
     * @param program program of requirement record.
     * @param requirement requirement of requirement record.
     * @param isReplaceAll " 1=1 "|" 1=0 ".
     * @return Notification List<DataRecord>.
     */
    private static List<DataRecord> getNotifications(final String regulation, final String program,
            final String requirement, final String isReplaceAll) {
        final StringBuilder deleteSql1 = new StringBuilder();
        deleteSql1
            .append(" SELECT * FROM notifications WHERE exists(select 1 from activity_log where activity_log.activity_log_id = notifications.activity_log_id ");
        deleteSql1
            .append("AND activity_log.regulation=${parameters['regulation']} AND activity_log.reg_program=${parameters['reg_program']}  ");
        deleteSql1
            .append("AND activity_log.reg_requirement=${parameters['reg_requirement']} AND activity_log.date_scheduled >${sql.currentDate} ");
        deleteSql1
            .append("AND activity_log.status='SCHEDULED' AND (activity_log.hcm_labeled=0 OR ");
        deleteSql1.append(isReplaceAll);
        deleteSql1.append(" ))");
        
        final DataSource notificationDs =
                DataSourceFactory.createDataSourceForFields(Constant.NOTIFICATIONS,
                    new String[] { Constant.ACTIVITY_LOG_ID });
        notificationDs.addQuery(deleteSql1.toString());
        notificationDs.addParameter(Constant.REG_REQUIREMENT, "", DataSource.DATA_TYPE_TEXT);
        notificationDs.addParameter(Constant.REG_PROGRAM, "", DataSource.DATA_TYPE_TEXT);
        notificationDs.addParameter(Constant.REGULATION, "", DataSource.DATA_TYPE_TEXT);
        notificationDs.setParameter(Constant.REG_REQUIREMENT, requirement);
        notificationDs.setParameter(Constant.REG_PROGRAM, program);
        notificationDs.setParameter(Constant.REGULATION, regulation);
        
        return notificationDs.getRecords();
        
    }
    
    /**
     * 
     * Get Events by given regulation ,program,requirement.
     * 
     * @param regulation regulation of requirement record.
     * @param program program of requirement record.
     * @param requirement requirement of requirement record.
     * @param isReplaceAll " 1=1 "|" 1=0 ".
     * @return List<Events>.
     */
    private static List<DataRecord> getEvents(final String regulation, final String program,
            final String requirement, final String isReplaceAll) {
        final DataSource notificationDs =
                DataSourceFactory.createDataSourceForFields(Constant.NOTIFICATIONS,
                    new String[] { Constant.ACTIVITY_LOG_ID });
        
        final StringBuilder deleteSql2 = new StringBuilder();
        deleteSql2.append(" SELECT * FROM activity_log WHERE ");
        deleteSql2
            .append(" activity_log.regulation=${parameters['regulation']} AND activity_log.reg_program=${parameters['reg_program']}  ");
        deleteSql2
            .append(" AND activity_log.reg_requirement=${parameters['reg_requirement']} AND activity_log.date_scheduled >${sql.currentDate} ");
        deleteSql2
            .append(" AND activity_log.status='SCHEDULED' AND (activity_log.hcm_labeled=0 OR ");
        deleteSql2.append(isReplaceAll);
        deleteSql2.append(" )");
        
        notificationDs.addQuery(deleteSql2.toString());
        notificationDs.addParameter(Constant.REG_REQUIREMENT, "", DataSource.DATA_TYPE_TEXT);
        notificationDs.addParameter(Constant.REG_PROGRAM, "", DataSource.DATA_TYPE_TEXT);
        notificationDs.addParameter(Constant.REGULATION, "", DataSource.DATA_TYPE_TEXT);
        notificationDs.setParameter(Constant.REG_REQUIREMENT, requirement);
        notificationDs.setParameter(Constant.REG_PROGRAM, program);
        notificationDs.setParameter(Constant.REGULATION, regulation);
        return notificationDs.getRecords();
    }
    
}
