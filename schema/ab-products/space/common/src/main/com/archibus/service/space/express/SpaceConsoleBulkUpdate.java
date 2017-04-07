package com.archibus.service.space.express;

import java.util.*;

import com.archibus.app.common.organization.dao.datasource.EmployeeDataSource;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.datasource.RoomDataSource;
import com.archibus.app.common.space.domain.Room;
import com.archibus.datasource.PrimaryKeysValues;
import com.archibus.datasource.data.DataRecordField;
import com.archibus.service.space.SpaceConstants;

/**
 * Update class for Space Console bulk updating logics.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Space Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public class SpaceConsoleBulkUpdate {
    
    /** <varies> value. */
    public static final String VARIES_VALUE = "<varies>";
    
    /**
     * updateMultipleRooms.
     * 
     * @param roomsMap the rooms need to update
     * @param newValues the values for field update
     */
    public void updateMultipleRooms(final List<Map<String, String>> roomsMap,
            final Map<String, String> newValues) {
        
        final RoomDataSource roomDs = new RoomDataSource();
        
        for (final Map<String, String> roomMap : roomsMap) {
            final String blId = roomMap.get(SpaceConstants.ROOM_BL_ID);
            final String flId = roomMap.get(SpaceConstants.ROOM_FL_ID);
            final String roomId = roomMap.get(SpaceConstants.ROOM_ROOM_ID);
            
            final Room key = new Room();
            key.setBuildingId(blId);
            key.setFloorId(flId);
            key.setId(roomId);
            
            final Room oldRoom = roomDs.getByPrimaryKey(key);
            if (oldRoom != null) {
                this.updateRoom(oldRoom, newValues);
                roomDs.update(oldRoom);
            }
        }
    }
    
    /**
     * 
     * update a single room.
     * 
     * @param oldRoom the original room
     * @param newValues the values need to update
     */
    private void updateRoom(final Room oldRoom, final Map<String, String> newValues) {
        // append division and department
        this.appendDivision(oldRoom, newValues);
        
        // append room category and type
        this.appendRoomCategory(oldRoom, newValues);
        
        final String employeeCapacityStr = newValues.get("rm.cap_em");
        if (employeeCapacityStr != null && !employeeCapacityStr.equalsIgnoreCase(VARIES_VALUE)) {
            final int employeeCapacity = Integer.parseInt(employeeCapacityStr);
            oldRoom.setEmployeeCapacity(employeeCapacity);
        }
    }
    
    /**
     * 
     * @param oldRoom the old room.
     * @param newValues new values for update.
     */
    private void appendDivision(final Room oldRoom, final Map<String, String> newValues) {
        final String dvId = newValues.get(SpaceConstants.ROOM_DV_ID);
        
        final String dpId = newValues.get(SpaceConstants.ROOM_DP_ID);
        
        final String oldDv = oldRoom.getDivisionId();
        if (!VARIES_VALUE.equalsIgnoreCase(dvId)) {
            if (VARIES_VALUE.equalsIgnoreCase(dpId) && !dvId.equalsIgnoreCase(oldDv)) {
                oldRoom.setDivisionId(dvId);
                oldRoom.setDepartmentId("");
            } else if (VARIES_VALUE.equalsIgnoreCase(dpId) && dvId.equalsIgnoreCase(oldDv)) {
                oldRoom.setDivisionId(dvId);
                oldRoom.setDepartmentId(oldRoom.getDepartmentId());
            } else {
                oldRoom.setDivisionId(dvId);
                oldRoom.setDepartmentId(dpId);
            }
        }
    }
    
    /**
     * 
     * appendRoomCategory.
     * 
     * @param oldRoom the old room for update
     * @param newValues the new values for update.
     */
    private void appendRoomCategory(final Room oldRoom, final Map<String, String> newValues) {
        final String rmCategory = newValues.get("rm.rm_cat");
        final String rmType = newValues.get("rm.rm_type");
        final String oldRmCategory = oldRoom.getCategory();
        
        if (!VARIES_VALUE.equalsIgnoreCase(rmCategory)) {
            if (VARIES_VALUE.equalsIgnoreCase(rmType)
                    && !rmCategory.equalsIgnoreCase(oldRmCategory)) {
                oldRoom.setCategory(rmCategory);
                oldRoom.setType("");
            } else if (VARIES_VALUE.equalsIgnoreCase(rmType)
                    && rmCategory.equalsIgnoreCase(oldRmCategory)) {
                oldRoom.setCategory(rmCategory);
                oldRoom.setType(oldRoom.getType());
            } else {
                oldRoom.setCategory(rmCategory);
                oldRoom.setType(rmType);
            }
        }
    }
    
    /**
     * update multiple rooms with the new field values.
     * 
     * @param employees employees id list
     * @param vMap new value map.
     */
    public void updateMultipleEmployees(final List<String> employees, final Map<String, String> vMap) {
        
        final EmployeeDataSource employeeDs = new EmployeeDataSource();
        
        for (final String employeeId : employees) {
            final Employee updateEmployee = this.getEmployeeById(employeeDs, employeeId);
            final String blId = vMap.get(SpaceConstants.ROOM_BL_ID);
            if (blId != null && !VARIES_VALUE.equalsIgnoreCase(blId)) {
                updateEmployee.setBuildingId(blId);
            }
            final String flId = vMap.get(SpaceConstants.ROOM_FL_ID);
            if (flId != null && !VARIES_VALUE.equalsIgnoreCase(flId)) {
                updateEmployee.setFloorId(flId);
            }
            final String rmId = vMap.get(SpaceConstants.ROOM_ROOM_ID);
            if (rmId != null && !VARIES_VALUE.equalsIgnoreCase(rmId)) {
                updateEmployee.setRoomId(rmId);
            }
            this.appendEmployeeDivision(updateEmployee, vMap);
            
            employeeDs.update(updateEmployee);
        }
    }
    
    /**
     * 
     * getEmployeeById.
     * 
     * @param employeeDs the datasource to retrive the record
     * @param employeeId the employee key
     * @return employee
     */
    private Employee getEmployeeById(final EmployeeDataSource employeeDs, final String employeeId) {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.EM_ID);
            pkField.setValue(employeeId);
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        // Retrieve employee
        return employeeDs.get(primaryKeysValues);
    }
    
    /**
     * 
     * @param employee the original employee.
     * @param newValues new values for update.
     */
    private void appendEmployeeDivision(final Employee employee, final Map<String, String> newValues) {
        final String dvId = newValues.get(SpaceConstants.ROOM_DV_ID);
        
        final String dpId = newValues.get(SpaceConstants.ROOM_DP_ID);
        
        final String oldDv = employee.getDivisionId();
        
        if (!VARIES_VALUE.equalsIgnoreCase(dvId)) {
            if (VARIES_VALUE.equalsIgnoreCase(dpId) && !dvId.equalsIgnoreCase(oldDv)) {
                employee.setDivisionId(dvId);
                employee.setDepartmentId("");
            } else if (VARIES_VALUE.equalsIgnoreCase(dpId) && dvId.equalsIgnoreCase(oldDv)) {
                employee.setDivisionId(dvId);
                employee.setDepartmentId(employee.getDepartmentId());
            } else {
                employee.setDivisionId(dvId);
                employee.setDepartmentId(dpId);
            }
        }
    }
}
