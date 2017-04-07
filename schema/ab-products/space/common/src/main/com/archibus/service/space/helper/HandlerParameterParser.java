package com.archibus.service.space.helper;

import java.util.*;

import org.json.*;

import com.archibus.service.space.SpaceConstants;

/**
 * Don't pass the JSONObject or JSONArray parameters to the service layer, they should be parsed in
 * the handler into proper formats. This hepler class coverts all the parameters into useful formats
 * used by business logic or service object.
 *
 *
 * @author Qiang
 * @since 22.1
 *
 */
public final class HandlerParameterParser {

    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private HandlerParameterParser() {

    }

    /**
     * Convert the project information from the WFR insertMoProjectRecordsFromPendingAssignments
     * into a map for processing in service.
     *
     * @param jsonObject the json parameter from handler
     * @return the map contains the projet info
     */
    public static Map<String, Object> getProjectFromMoveOrderPendingAssignments(
            final JSONObject jsonObject) {
        final Map<String, Object> project = new HashMap<String, Object>();
        project.put(SpaceConstants.PROJECT_ID, jsonObject.getString(SpaceConstants.PROJECT_ID));
        project.put(SpaceConstants.DESCRIPTION, jsonObject.getString(SpaceConstants.DESCRIPTION));
        project.put(SpaceConstants.BL_ID, jsonObject.getString(SpaceConstants.BL_ID));
        project.put(SpaceConstants.DEPT_CONTACT, jsonObject.getString(SpaceConstants.DEPT_CONTACT));
        project.put(SpaceConstants.REQUESTOR, jsonObject.getString(SpaceConstants.REQUESTOR));
        project.put(SpaceConstants.DATE_START, jsonObject.getString(SpaceConstants.DATE_START));
        project.put(SpaceConstants.DATE_END, jsonObject.getString(SpaceConstants.DATE_END));
        project.put(SpaceConstants.CONTACT_ID, jsonObject.getString(SpaceConstants.CONTACT_ID));
        project.put(SpaceConstants.PROJECT_TYPE, jsonObject.getString(SpaceConstants.PROJECT_TYPE));
        project.put(SpaceConstants.PROJECT_NAME, jsonObject.getString(SpaceConstants.PROJECT_ID));
        return project;
    }

    /**
     *
     * Get employee assignment information for move orders.
     *
     * @param assignments the employees' assigments information
     * @return the list of all assignments.
     */
    public static List<Map<String, String>> getEmployeeAssigmentsForMoveOrders(
            final JSONArray assignments) {

        final List<Map<String, String>> employeeAssignments = new ArrayList<Map<String, String>>();
        final int length = assignments.length();
        for (int i = 0; i < length; i++) {
            final JSONObject assignment = assignments.getJSONObject(i);
            final Map<String, String> employeeAssignment =
                    createSingleEmployeeAssignmentForMoveOrder(assignment);
            employeeAssignments.add(employeeAssignment);
        }
        return employeeAssignments;
    }

    /**
     *
     * Process a single employee assignment record for move order.
     *
     * @param employeeAssignment single employee assignment
     * @return the map contains the assignment info
     */
    private static Map<String, String> createSingleEmployeeAssignmentForMoveOrder(
            final JSONObject employeeAssignment) {
        final Map<String, String> assignmentMap = new HashMap<String, String>();
        assignmentMap.put(SpaceConstants.EM_ID, employeeAssignment.getString(SpaceConstants.EM_ID));
        assignmentMap.put(SpaceConstants.FROM_BL_ID,
            employeeAssignment.getString(SpaceConstants.FROM_BL_ID));
        assignmentMap.put(SpaceConstants.FROM_FL_ID,
            employeeAssignment.getString(SpaceConstants.FROM_FL_ID));
        assignmentMap.put(SpaceConstants.FROM_RM_ID,
            employeeAssignment.getString(SpaceConstants.FROM_RM_ID));

        assignmentMap.put(SpaceConstants.TO_BL_ID, employeeAssignment.has(SpaceConstants.TO_BL_ID)
                ? employeeAssignment.getString(SpaceConstants.TO_BL_ID) : "");
        assignmentMap.put(SpaceConstants.TO_FL_ID, employeeAssignment.has(SpaceConstants.TO_FL_ID)
                ? employeeAssignment.getString(SpaceConstants.TO_FL_ID) : "");
        assignmentMap.put(SpaceConstants.TO_RM_ID, employeeAssignment.has(SpaceConstants.TO_RM_ID)
                ? employeeAssignment.getString(SpaceConstants.TO_RM_ID) : "");
        return assignmentMap;
    }
}
