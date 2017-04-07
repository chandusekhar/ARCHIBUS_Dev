package com.archibus.eventhandler.prevmaint;

import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.ExceptionBase;

/**
 * Easy Preventive Maintenance Handler - for 21.2 Bldgops Express.
 * 
 * <p>
 * History:
 * <li>Initial implementation for 21.2.
 * 
 * @author Zhang Yi
 */
public class EasyPreventiveMaintenanceHandler extends EventHandlerBase {
    
    /**
     * Dash Sign.
     */
    private static final String DASH = "-";
    
    /**
     * table name 'pms'.
     */
    private static final String PMS = "pms";
    
    /**
     * field name 'pmp_id'.
     */
    private static final String PMP_ID = "pmp_id";
    
    /**
     * field name 'eq_id'.
     */
    private static final String EQ_ID = "eq_id";
    
    /**
     * field name 'interval_type'.
     */
    private static final String INTERVAL_TYPE = "interval_type";
    
    /**
     * field name 'interval_1'.
     */
    private static final String INTERVAL_1 = "interval_1";
    
    /**
     * field name 'fixed'.
     */
    private static final String FIXED = "fixed";
    
    /**
     * Logger to write messages to archibus.log.
     */
    private final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Procedure DataSource.
     */
    private final DataSource procedureDS;
    
    /**
     * Procedure Step DataSource.
     */
    private final DataSource procedureStepDS;
    
    /**
     * Schedule DataSource.
     */
    private final DataSource scheduleDS;
    
    /**
     * EventHandlerContext Object.
     */
    private final EventHandlerContext context;
    
    /**
     * Constructor: initial DataSources.
     * 
     */
    public EasyPreventiveMaintenanceHandler() {
        
        super();
        
        this.procedureDS =
                DataSourceFactory.createDataSourceForFields("pmp", new String[] { PMP_ID,
                        "pmp_type" });
        
        this.procedureStepDS =
                DataSourceFactory.createDataSourceForFields("pmps", new String[] { PMP_ID,
                        "pmps_id", "instructions" });
        
        this.scheduleDS =
                DataSourceFactory.createDataSourceForFields(PMS, new String[] { PMP_ID, EQ_ID,
                        INTERVAL_1, INTERVAL_TYPE, "date_first_todo", FIXED });
        
        this.context = ContextStore.get().getEventHandlerContext();
    }
    
    /**
     * Create multiple Procedures and Schedules for equipments.
     * 
     * @param intervalType String interval type
     * @param interval1 int interval
     * @param dateFirstToDo String Date First Todo
     * @param eqIds List equipment ids
     */
    public void createEquipmentSchedules(final String intervalType, final int interval1,
            final String dateFirstToDo, final List<String> eqIds) {
        
        this.createProcedures(eqIds, intervalType, interval1);
        
        this.createSchedules(eqIds, intervalType, interval1, dateFirstToDo);
        
    }
    
    /**
     * Create Procedures for each equipment: make the pmp_id value ‘<pms.eq_id> -
     * <pms.interval_type> - <pms.interval_1>’.
     * 
     * @param intervalType String interval type
     * @param interval1 int interval
     * @param eqIds List equipment ids
     */
    private void createProcedures(final List<String> eqIds, final String intervalType,
            final int interval1) {
        
        for (final String equipmentId : eqIds) {
            
            final String pmpId = equipmentId + DASH + intervalType + DASH + interval1;
            
            if (this.procedureDS.getRecord(" pmp_id=" + literal(this.context, pmpId)) == null) {
                
                final DataRecord pmp = this.procedureDS.createNewRecord();
                pmp.setValue("pmp.pmp_id", pmpId);
                pmp.setValue("pmp.pmp_type", "EQ");
                this.procedureDS.saveRecord(pmp);
                
                final DataRecord pmps = this.procedureStepDS.createNewRecord();
                pmps.setValue("pmps.pmp_id", pmpId);
                pmps.setValue("pmps.pmps_id", 1);
                pmps.setValue("pmps.instructions", "Preventive Maintenance");
                this.procedureStepDS.saveRecord(pmps);
            }
            
        }
        
    }
    
    /**
     * Create Schedules for each equipments: Make pms.fixed the default value of 1 (meaning the
     * schedule is fixed); make the pmp_id value ‘<pms.eq_id> - <pms.interval_type> -
     * <pms.interval_1>’.
     * 
     * @param intervalType String interval type
     * @param interval1 int interval
     * @param eqIds List equipment ids
     * @param dateFirstToDo String Date First Todo
     */
    private void createSchedules(final List<String> eqIds, final String intervalType,
            final int interval1, final String dateFirstToDo) {
        
        for (final String equipmentId : eqIds) {
            
            final String pmpId = equipmentId + DASH + intervalType + DASH + interval1;
            
            if (this.findSchedule(equipmentId, intervalType, interval1).isEmpty()) {
                
                final DataRecord schedule = this.scheduleDS.createNewRecord();
                
                schedule.setValue("pms.pmp_id", pmpId);
                schedule.setValue("pms.eq_id", equipmentId);
                schedule.setValue("pms.interval_type", intervalType);
                schedule.setValue("pms.interval_1", interval1);
                schedule.setValue("pms.fixed", 1);
                
                schedule.setValue("pms.date_first_todo", this.convertStringToDate(dateFirstToDo));
                
                this.scheduleDS.saveRecord(schedule);
                
            }
            
        }
        
    }
    
    /**
     * @return the converted date object from string format of dateFirstToDo.
     * 
     * @param dateFirstToDo String Date First Todo
     */
    private Date convertStringToDate(final String dateFirstToDo) {
        
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        
        Date date = null;
        try {
            
            date = dateFormat.parse(dateFirstToDo);
            
        } catch (final ParseException e) {
            
            if (this.logger.isDebugEnabled()) {
                final String errorMessage =
                        MessageFormat
                            .format(
                                "Convert String format of date_first_todo to Date error.\nRoot cause: {0}",
                                e.getMessage());
                this.logger.error(errorMessage);
            }
            
            throw new ExceptionBase("Convert String format of date_first_todo to Date has failed");
        }
        
        return date;
        
    }
    
    /**
     * @return Schedule Record by given equipment id, interval type, interval.
     * 
     * @param intervalType String interval type
     * @param interval1 int interval
     * @param eqId String equipment id
     */
    private List<DataRecord> findSchedule(final String eqId, final String intervalType,
            final int interval1) {
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        restriction.addClause(PMS, EQ_ID, eqId, Operation.EQUALS);
        restriction.addClause(PMS, FIXED, 1, Operation.EQUALS);
        restriction.addClause(PMS, INTERVAL_TYPE, intervalType, Operation.EQUALS);
        restriction.addClause(PMS, INTERVAL_1, interval1, Operation.EQUALS);
        
        return this.scheduleDS.getRecords(restriction);
        
    }
}
