package com.archibus.service.space.express;

import org.json.*;

import com.archibus.app.common.organization.dao.datasource.EmployeeDataSource;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.datasource.RoomDataSource;
import com.archibus.app.common.space.domain.Room;
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
public final class SpaceExpressAssignment {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceExpressAssignment() {
        
    }
    
    /**
     * 
     * Commit Space Assignments.
     * 
     * @param assignmentsList JSONObject of space assignments
     */
    public static void commitSpaceAssignment(final JSONArray assignmentsList) {
        
        final RoomDataSource dsRoom = new RoomDataSource();
        
        // loop assignments list to commit each single space assignment
        for (int i = 0; i < assignmentsList.length(); i++) {
            
            final JSONObject assignment = (JSONObject) assignmentsList.get(i);
            
            commitSingleSpaceAssignment(assignment, dsRoom);
            
        }
    }
    
    /**
     * 
     * Commit Single Space Assignment.
     * 
     * @param assignment JSONObject space assignment
     * @param dsRoom RoomDataSource room DataSource
     */
    private static void commitSingleSpaceAssignment(final JSONObject assignment,
            final RoomDataSource dsRoom) {
        // get room from assignment's location
        final Room room =
                SpaceExpressAssignmentHelper.getRoomByLocationOfAssignment(assignment, dsRoom);
        
        if (room != null) {
            
            final String spaceAssignmentType = assignment.optString("spaceAssignmentType");
            
            // save assignment to room according to space assignment's type
            if ("Department".equalsIgnoreCase(spaceAssignmentType)) {
                
                assignDepartmentToRoom(assignment, room);
                
            } else if ("Division".equalsIgnoreCase(spaceAssignmentType)) {
                
                assignDivisionToRoom(assignment, room);
                
            } else if ("Category".equalsIgnoreCase(spaceAssignmentType)) {
                
                assignRoomCategoryToRoom(assignment, room);
                
            } else if ("Type".equalsIgnoreCase(spaceAssignmentType)) {
                
                assignRoomTypeToRoom(assignment, room);
                
            } else if ("Standard".equalsIgnoreCase(spaceAssignmentType)) {
                
                assignRoomStandardToRoom(assignment, room);
                
            }
            
            dsRoom.update(room);
        }
    }
    
    /**
     * 
     * Set division to room.
     * 
     * @param assignment JSONObject of room assignment
     * @param room Room
     * 
     */
    private static void assignDivisionToRoom(final JSONObject assignment, final Room room) {
        
        final String divisionId = assignment.getString(SpaceConstants.DV_ID);
        
        room.setDivisionId(divisionId);
        room.setDepartmentId("");
    }
    
    /**
     * 
     * Set department to room.
     * 
     * @param assignment JSONObject of room assignment
     * @param room Room
     * 
     */
    private static void assignDepartmentToRoom(final JSONObject assignment, final Room room) {
        
        final String divisionId = assignment.getString(SpaceConstants.DV_ID);
        final String departmentId = assignment.getString(SpaceConstants.DP_ID);
        
        room.setDivisionId(divisionId);
        room.setDepartmentId(departmentId);
    }
    
    /**
     * 
     * Set room category to room.
     * 
     * @param assignment JSONObject of room assignment
     * @param room Room
     * 
     */
    private static void assignRoomCategoryToRoom(final JSONObject assignment, final Room room) {
        
        final String roomCategory = assignment.getString(SpaceConstants.RM_CAT);
        
        room.setCategory(roomCategory);
        room.setType("");
    }
    
    /**
     * 
     * Set room type to room.
     * 
     * @param assignment JSONObject of room assignment
     * @param room Room
     * 
     */
    private static void assignRoomTypeToRoom(final JSONObject assignment, final Room room) {
        
        final String roomCategory = assignment.getString(SpaceConstants.RM_CAT);
        final String roomType = assignment.getString(SpaceConstants.RM_TYPE);
        
        room.setCategory(roomCategory);
        room.setType(roomType);
    }
    
    /**
     * 
     * Set room standard to room.
     * 
     * @param assignment JSONObject of room assignment
     * @param room Room
     * 
     */
    private static void assignRoomStandardToRoom(final JSONObject assignment, final Room room) {
        
        final String roomStandard = assignment.getString(SpaceConstants.RM_STD);
        
        room.setStandard(roomStandard);
    }
    
    /**
     * 
     * Commit Employee Assignments.
     * 
     * @param assignments JSONObjects List of employee assignments
     */
    public static void commitEmployeeAssignments(final JSONArray assignments) {
        
        final EmployeeDataSource dsEmployee = new EmployeeDataSource();
        
        // loop through assignments to update employee's location
        for (int i = 0; i < assignments.length(); i++) {
            
            final JSONObject assignment = (JSONObject) assignments.get(i);
            
            commitSingleEmployeeAssignment(assignment, dsEmployee);
        }
        
    }
    
    /**
     * 
     * Commit Single Employee Assignment.
     * 
     * @param assignment JSONObject employee assignment
     * @param dsEmployee EmployeeDataSource employee DataSource
     * 
     */
    private static void commitSingleEmployeeAssignment(final JSONObject assignment,
            final EmployeeDataSource dsEmployee) {
        
        final Employee employee =
                SpaceExpressAssignmentHelper.getEmployeeByAssignment(assignment, dsEmployee);
        
        if (employee != null) {
            
            assignLocationToEmployee(assignment, employee);
            
            dsEmployee.update(employee);
        }
    }
    
    /**
     * 
     * Save Location To Employee.
     * 
     * @param assignment JSONObject of employee assignment
     * @param employee Employee
     */
    private static void assignLocationToEmployee(final JSONObject assignment,
            final Employee employee) {
        
        final String buildingId = assignment.getString("to_bl_id");
        final String floorId = assignment.getString("to_fl_id");
        final String roomId = assignment.getString("to_rm_id");
        
        employee.setBuildingId(buildingId);
        employee.setFloorId(floorId);
        employee.setRoomId(roomId);
        
    }
}
