package com.archibus.service.space.express;

import org.json.JSONObject;

import com.archibus.app.common.organization.dao.datasource.EmployeeDataSource;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.datasource.RoomDataSource;
import com.archibus.app.common.space.domain.Room;
import com.archibus.datasource.PrimaryKeysValues;
import com.archibus.datasource.data.DataRecordField;
import com.archibus.service.space.SpaceConstants;

/**
 * Service class holds logics of Assignments.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Space Express.
 * 
 * @author ASC-BJ Zhang Yi
 * 
 */
public final class SpaceExpressAssignmentHelper {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceExpressAssignmentHelper() {
    }
    
    /**
     * 
     * Get Room By Given Assignment's location.
     * 
     * @param assignment JSONObject of room assignment
     * @param dsRoom RoomDataSource room DataSource
     * 
     * @return room
     */
    public static Room getRoomByLocationOfAssignment(final JSONObject assignment,
            final RoomDataSource dsRoom) {
        
        final String buildingId = assignment.getString(SpaceConstants.BL_ID);
        final String floorId = assignment.getString(SpaceConstants.FL_ID);
        final String roomId = assignment.getString(SpaceConstants.RM_ID);
        
        final Room locationOfAssignment = new Room();
        locationOfAssignment.setBuildingId(buildingId);
        locationOfAssignment.setFloorId(floorId);
        locationOfAssignment.setId(roomId);
        
        final Room room = dsRoom.getByPrimaryKey(locationOfAssignment);
        
        return room;
    }
    
    /**
     * 
     * Get Employee from Assignment.
     * 
     * @param assignment JSONObject of employee assignment
     * @param dsEmployee EmployeeDataSource employee DataSource
     * 
     * @return Employee
     */
    public static Employee getEmployeeByAssignment(final JSONObject assignment,
            final EmployeeDataSource dsEmployee) {
        
        final String employeeId = assignment.getString(SpaceConstants.EM_ID);
        
        // Construct primary key by employee id
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.EM_ID);
            pkField.setValue(employeeId);
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        // Retrieve employee
        return dsEmployee.get(primaryKeysValues);
        
    }
    
}
