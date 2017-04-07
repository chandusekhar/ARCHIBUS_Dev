package com.archibus.app.common.space.dao.datasource;

import java.util.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.IRoomTransactionDao;
import com.archibus.app.common.space.domain.*;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.model.view.datasource.ParsedRestrictionDef;

/**
 * Implementation of DataSource for RoomTransaction.
 * 
 * @see ObjectDataSourceImpl.
 * 
 * @author Valery Tydykov
 * @author Zhang Yi
 * 
 */
public class RoomTransactionDataSource extends ObjectDataSourceImpl<RoomTransaction> implements
        IRoomTransactionDao {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    static final String[][] FIELDS_TO_PROPERTIES =
            { { "pct_id", Constants.ID }, { "from_bl_id", "fromBuildingId" },
                    { "from_fl_id", "fromFloorId" }, { "from_rm_id", "fromRoomId" },
                    { Constants.RM_ID, "roomId" }, { Constants.BL_ID, Constants.BUILDING_ID },
                    { Constants.FL_ID, Constants.FLOOR_ID },
                    { Constants.DP_ID, Constants.DEPARTMENT_ID },
                    { Constants.DV_ID, Constants.DIVISION_ID },
                    { Constants.EM_ID, Constants.EMPLOYEE_ID },
                    { Constants.PRORATE, Constants.PRORATE },
                    { Constants.RM_TYPE, Constants.TYPE },
                    { Constants.RM_CAT, Constants.CATEGORY },
                    { Constants.DATE_START, "dateStart" }, { Constants.DATE_END, "dateEnd" },
                    { Constants.STATUS, Constants.STATUS },
                    { Constants.PRIMARY_RM, "primaryRoom" },
                    { Constants.PRIMARY_EM, "primaryEmployee" }, { "user_name", "userName" },
                    { "date_created", "dateCreated" }, { "pct_space", "percentageOfSpace" },
                    { "del_user_name", "deletionUserName" }, { "date_deleted", "dateDeleted" },
                    { "parent_pct_id", "parentId" }, { "activity_log_id", "activityLogId" },
                    { "mo_id", "moId" }, { "day_part", "dayPart" } };
    
    /**
     * Constructs RoomTransactionDataSource, mapped to <code>rmpct</code> table, using
     * <code>roomTransaction</code> bean.
     */
    protected RoomTransactionDataSource() {
        super("roomTransaction", "rmpct");
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findForRoom(final Room room, final Date dateTime) {
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionRestriction.fromRoomAndDate(room, dateTime);
        
        return this.find(restrictionDef);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findForPrimaryRoom(final Room room, final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionRestriction.fromPrimaryRoomAndDate(room, dateTime);
        
        return this.find(restrictionDef);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findForAttributeChangeRoom(final Room room, final Date dateTime) {
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionRestriction.fromAttributeChangeRoom(room, dateTime);
        
        return this.find(restrictionDef);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findForEmployee(final Employee employee, final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionRestriction.fromEmployeeAndDate(employee, dateTime);
        
        return this.find(restrictionDef);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findForPrimaryEmployee(final Employee employee, final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionRestriction.fromPrimaryEmployeeAndDate(employee, dateTime);
        
        return this.find(restrictionDef);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findForLocationChangeEmployee(final Employee employee,
            final Date dateTime) {
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionRestriction.fromLocationChangeEmployee(employee, dateTime);
        
        return this.find(restrictionDef);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findForDepartmentChangeEmployee(final Employee employee,
            final Date dateTime) {
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionRestriction.fromDepartmentChangeEmployee(employee, dateTime);
        
        return this.find(restrictionDef);
    }
    
}
