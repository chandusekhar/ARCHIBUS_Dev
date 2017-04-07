package com.archibus.service.space.express;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataSetList;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.datatransfer.DataTransferJob;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.space.SpaceConstants;
import com.archibus.utility.ExceptionBase;

/**
 * Space Express Service holds Workflow Rule methods.
 *
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Space Express.
 *
 * @author Zhang Yi
 *
 *
 */
public class SpaceExpressService extends DataTransferJob {

    /**
     * Indicates the number 5.
     *
     */
    public static final String RESTRICTION = "restriction";

    /** building id. */
    public static final String BUILDING_ID = "rm.bl_id";

    /** floor id. */
    public static final String FLOOR_ID = "rm.fl_id";

    /** room id. */
    public static final String ROOM_ID = "rm.rm_id";

    /** field name. */
    public static final String FIELD_NAME = "fieldName";

    /** field value. */
    public static final String FIELD_VALUE = "fieldValue";

    /** The template store path for printing pdf file. */
    public static final String PDF_PRINTING_TEMPLATE_PATH =
            "/schema/ab-products/space/common/console/export/";

    /** The default doc template name for pdf printing. */
    public static final String PDF_PRINTING_TEMPLATE_NAME = "report-spaceconsole-template.docx";

    /**
     *
     * Call SpaceExpressAssignment to Commit Space assignments.
     *
     * @param assignments JSONArray JSONObject array of assignments from client
     */
    public void commitSpaceAssignments(final JSONArray assignments) {

        if (assignments != null && assignments.length() > 0) {
            SpaceExpressAssignment.commitSpaceAssignment(assignments);
        }

    }

    /**
     *
     * Call SpaceExpressAssignment to Commit Employee assignments.
     *
     * @param assignments JSONArray JSONObject array of assignments from client
     */
    public void commitEmployeeAssignments(final JSONArray assignments) {

        if (assignments != null && assignments.length() > 0) {

            SpaceExpressAssignment.commitEmployeeAssignments(assignments);

        }

    }

    /**
     *
     * Call SpaceExpressUpdate to update Room's capacity according to its room category and type.
     *
     * @param categories predefined a list of category
     * @param types predefined a list of type
     *
     */
    public void updateRoomCapacityByCategory(final List<String> categories,
            final List<Map<String, String>> types) {

        new SpaceExpressUpdate().updateRoomCapacityByCategoryAndType(categories, types);

    }

    /**
     *
     * Call StandardCategoryTypeCreater to import Standard Room Categories and Types.
     *
     * @param standard name of selected standard
     *
     */
    public void importRoomCategoryAndType(final String standard) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONObject result = new JSONObject();
        if (CategoryTypeStandardService.importRoomCategoriesAndTypesFromXLS(standard)) {
            result.put(SpaceConstants.IS_EMPTY, SpaceConstants.TRUE);
        } else {
            result.put(SpaceConstants.IS_EMPTY, SpaceConstants.FALSE);
        }

        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, result.toString());
    }

    /**
     *
     * Call StandardCategoryTypeCreater to import Standard Room Categories and Types.
     *
     * @param std standard of Room Categories and Types
     *
     */
    public void loadRoomCategoriesAndTypes(final String std) {

        final DataSetList dataSet = new DataSetList();

        dataSet.addRecords(CategoryTypeStandardService.loadRoomCategoriesAndTypes(std));

        ContextStore.get().getEventHandlerContext().setResponse(dataSet);

    }

    /**
     * bulk edit rooms for the field which has non <varies> value.
     *
     * @param rooms the room ids
     * @param newValues the new values for update
     */
    public void updateMultipleRooms(final JSONArray rooms, final JSONArray newValues) {

        final List<Map<String, String>> roomsMap = new ArrayList<Map<String, String>>();
        for (int i = 0; i < rooms.length(); i++) {
            final JSONObject kvObj = rooms.getJSONObject(i);
            final Map<String, String> kvMap = new HashMap<String, String>();
            kvMap.put(BUILDING_ID, kvObj.getString(BUILDING_ID));
            kvMap.put(FLOOR_ID, kvObj.getString(FLOOR_ID));
            kvMap.put(ROOM_ID, kvObj.getString(ROOM_ID));

            roomsMap.add(kvMap);
        }

        final Map<String, String> vMap = new HashMap<String, String>();
        for (int i = 0; i < newValues.length(); i++) {
            final JSONObject kvObj = newValues.getJSONObject(i);
            final String fieldName = (String) kvObj.get(FIELD_NAME);
            final String value = (String) kvObj.get(FIELD_VALUE);
            vMap.put(fieldName, value);
        }

        new SpaceConsoleBulkUpdate().updateMultipleRooms(roomsMap, vMap);
    }

    /**
     *
     * buld edit employees for the field which has non <varies> value.
     *
     * @param employees the employees need updated
     * @param newValues the new field values
     */
    public void updateMultipleEmployees(final JSONArray employees, final JSONArray newValues) {
        final List<String> employeeIdList = new ArrayList<String>();
        for (int i = 0; i < employees.length(); i++) {
            final JSONObject kvObj = employees.getJSONObject(i);
            final String emId = kvObj.getString("em.em_id");
            employeeIdList.add(emId);
        }

        final Map<String, String> vMap = new HashMap<String, String>();
        for (int i = 0; i < newValues.length(); i++) {
            final JSONObject kvObj = newValues.getJSONObject(i);
            final String fieldName = (String) kvObj.get(FIELD_NAME);
            final String value = (String) kvObj.get(FIELD_VALUE);
            vMap.put(fieldName, value);
        }

        new SpaceConsoleBulkUpdate().updateMultipleEmployees(employeeIdList, vMap);
    }

    /**
     *
     * Call SpaceExpressUpdate to Update room's occupancy.
     *
     * @param restriction String restricton to rm join rmcat join bl
     */
    public void updateRoomOccupancy(final String restriction) {

        SpaceExpressUpdate.updateRoomOccupancy(restriction);

    }

    /**
     *
     * Upload template for PDF Printing.
     *
     * @param fileExt the file extension.
     * @param templateStream the uploaded file input stream
     */
    public void uploadSpacePDFPrintingDOCXTemplate(final String fileExt,
            final InputStream templateStream) {

        final String webAppPath = ContextStore.get().getWebAppPath();
        final String templateName =
                webAppPath + PDF_PRINTING_TEMPLATE_PATH + PDF_PRINTING_TEMPLATE_NAME;

        // check the original file and rename it to backup if it exists.
        final File file = new File(templateName);
        if (file.exists()) {
            final SimpleDateFormat dateFormat =
                    new SimpleDateFormat("yyyyMMddHHmmSS", Locale.getDefault());
            file.renameTo(new File(templateName + "." + dateFormat.format(new Date())));
        }

        // upload the template file to the location.
        final JobResult result = new JobResult("", "", "");
        if (this.status != null) {
            this.status.setResult(result);
        }

        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(new File(templateName));
            if (this.status != null) {
                this.status.setTotalNumber(1);
            }
            byte[] buffer = null;
            if (this.status != null) {
                if (this.status.isStopRequested() || this.status.getCode() == JobStatus.JOB_STOPPED
                        || this.status.getCode() == JobStatus.JOB_STOP_ACKNOWLEDGED) {
                    this.stop();
                } else {
                    buffer = new byte[templateStream.available()];
                    templateStream.read(buffer);
                    fos.write(buffer);
                    this.status.incrementCurrentNumber();
                }
            }
            fos.close();
        } catch (final IOException ie) {
            throw new ExceptionBase(
                String.format("Uploading template fails in - " + ie.getMessage()), ie);
        }
    }

    /**
     * As for create group move orders for employees. we have to insure that the user has license of
     * move management.
     *
     */
    public void isMoveManagementLicensed() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (EventHandlerBase.isActivityLicenseEnabled(context, "AbMove")
                || EventHandlerBase.isActivityLicenseEnabled(context, "AbMoveManagement")) {
            context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, "yes");
        } else {
            context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, "no");
        }
    }

    /**
     *
     * set end date for employees/rooms.
     *
     * @param teamId team's id
     * @param dateStart the start date
     * @param dateEnd the end date
     * @param tableName the table name which is to update
     * @return
     */
    public void updateEndDateOnAssoc(final String teamId, final String dateStart,
            final String dateEnd, final String tableName) {

        new SpaceConsoleTeamSpaceUpdate().updateEndDateOnAssoc(teamId, dateStart, dateEnd,
            tableName);

    }
}
