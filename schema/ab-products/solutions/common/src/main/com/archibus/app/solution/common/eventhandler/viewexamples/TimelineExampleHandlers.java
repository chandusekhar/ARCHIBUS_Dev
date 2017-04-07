package com.archibus.app.solution.common.eventhandler.viewexamples;

import java.sql.Time;
import java.text.MessageFormat;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Event handlers that support timeline example views.
 */
public class TimelineExampleHandlers {

    /**
     * Loads and returns to the UI the timeline object model:
     * <ul>
     * <li>timemarks for specified date and time range;
     * <li>all existing reservations for specified date, time range and list of room PKs;
     * </ul>
     * Does not apply any other UI restrictions.
     *
     * @param context
     */
    public JSONObject loadTimeline(final String roomArrangeId, final String buildingId,
            final Date dateStart, final Time timeStart, final Time timeEnd) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final JSONObject timeline = new JSONObject();

        final String activityId = "AbWorkplaceReservations";

        // get the timeline start/end time range from afm_activity_params table
        int timelineStartHour = 8;
        int timelineEndHour = 20;

        // Get time start and end values
        // Supported values are 0-24 integer as hour, or a formatted time value that we can pull the
        // hour out of
        final Integer nStartHour = getTimelineHourParam(context, activityId, "TimelineStartTime");
        if (nStartHour != null) {
            timelineStartHour = nStartHour.intValue();
        }

        final Integer nEndHour = getTimelineHourParam(context, activityId, "TimelineEndTime");
        if (nEndHour != null) {
            timelineEndHour = nEndHour.intValue();
        }

        // Error checking on start and end time parameters
        timelineStartHour = Math.max(0, timelineStartHour);
        timelineEndHour = Math.min(24, timelineEndHour);
        timelineStartHour = Math.min(timelineStartHour, timelineEndHour);
        timelineEndHour = Math.max(timelineStartHour, timelineEndHour);

        // Number of segments each hour is broken into - these will be separated by minor timemarks
        int minorSegments = 1;
        final Integer minutesTimeUnit =
                EventHandlerBase.getActivityParameterInt(context, activityId, "MinutesTimeUnit");
        if (minutesTimeUnit != null) {
            // find out how many minor timemarks to generate per hour
            final int interval = minutesTimeUnit.intValue();
            // Valid intervals are between 1 and 30 - don't generate minor marks outside that range
            if (interval > 0 && interval <= 30) {
                // Number of minor marks is closest integer
                minorSegments = 60 / interval;
            }
        }
        timeline.put("minorToMajorRatio", minorSegments);

        // Create timemarks and add to timeline tree
        retrieveTimemarks(context, timeline, timelineStartHour, timelineEndHour, minorSegments);

        // retrieve available rooms
        final List<DataRecord> resourceRecords =
                retrieveResources(context, timeline, timelineStartHour, minorSegments,
                    roomArrangeId, buildingId);

        // Retrieve events
        retrieveEvents(context, timeline, timelineStartHour, minorSegments, resourceRecords,
            dateStart, timeStart, timeEnd);

        return timeline;
    }

    // ----------------------- helper methods ----------------------------------

    /**
     * @param timelineStartHour
     * @param minorSegments
     * @param timeOfDay
     * @return
     */
    private int getTimeColumn(final int timelineStartHour, final int minorSegments,
            final Date timeOfDay, final int numberOfTimemarks) {
        final int resStartHour = timeOfDay.getHours();
        final int resStartMin = timeOfDay.getMinutes();

        // Calculate column to nearest hour
        int columnAvailableFrom = (resStartHour - timelineStartHour) * minorSegments;
        // Add additional segments for minutes
        columnAvailableFrom += (int) Math.ceil(resStartMin * minorSegments / 60);

        // if the resource is availabe after the timeline end time, assume column
        // MaxTimemarksColumn-1
        if (columnAvailableFrom >= numberOfTimemarks) {
            columnAvailableFrom = numberOfTimemarks;
        }
        // if the resource is availabe before the timeline start time, assume column 0
        // negative column values are not allowed
        if (columnAvailableFrom < 0) {
            columnAvailableFrom = 0;
        }
        return columnAvailableFrom;
    }

    /**
     * Retrieves a timeline start or end hour from the afm_activity_params table
     *
     * @param activityId
     * @param paramId
     * @return
     */
    public Integer getTimelineHourParam(final EventHandlerContext context, final String activityId,
            final String paramId) {
        Integer hour = null;
        final String strTimelineHour =
                EventHandlerBase.getActivityParameterString(context, activityId, paramId);
        if (StringUtil.notNullOrEmpty(strTimelineHour)) {
            // first see if it's an integer
            try {
                hour = new Integer(strTimelineHour);
            } catch (final NumberFormatException ne) {
                // not an integer, see if it's a valid Time value
                try {
                    final Time timeStart =
                            (Time) EventHandlerBase.parseFieldValue(context, strTimelineHour,
                                "java.sql.Time", "reserve.time_start");
                    if (timeStart != null) {
                        hour = new Integer(timeStart.getHours());
                    }
                } catch (final Exception e) {
                    final String message =
                            MessageFormat
                                .format(
                                    "Invalid value in afm_activity_params table for activity [{0}], parameter [{1}]",
                                    activityId, paramId);
                    throw new ExceptionBase(null, message, e);
                }
            }
        }

        return hour;
    }

    /**
     * Retrieves a room arrangement pre- or post-block value.
     *
     * @param activityId
     * @param fieldName
     * @return
     */
    public int getRmArrangeBlockTimeslots(final EventHandlerContext context, final String blId,
            final String flId, final String rmId, final String configId, final String typeId,
            final String fieldName, final int minorSegments) {

        final String restriction =
                "bl_id = '" + blId + "'" + "AND fl_id = '" + flId + "'" + "AND rm_id = '" + rmId
                        + "'" + "AND config_id = '" + configId + "'" + "AND rm_arrange_type_id = '"
                        + typeId + "'";

        final String tableName = "rm_arrange";
        final String[] fieldNames = { fieldName };
        final DataSource ds = DataSourceFactory.createDataSourceForFields(tableName, fieldNames);
        final DataRecord record = ds.getRecord(restriction);
        final int value = record.getInt(tableName + "." + fieldName);

        return (int) Math.ceil(value * minorSegments / 60);
    }

    /**
     * createTimemarks Loads and returns to the UI the timemarks;
     *
     * @param context
     * @param timeline
     * @param timelineStartHour test
     * @param timelineEndHour
     * @param minorSegments
     */

    public void retrieveTimemarks(final EventHandlerContext context, final JSONObject timeline,
            final int timelineStartHour, final int timelineEndHour, final int minorSegments) {

        // generate major and minor timemarks and timeslots
        final JSONArray timemarks = new JSONArray();

        int column = 0;
        for (int hour = timelineStartHour; hour < timelineEndHour; hour++) {
            final Time t = new Time(hour, 0, 0);
            final String dateTimeStart = t.toString();
            final String dateTimeLabel =
                    EventHandlerBase.formatFieldValue(context, t, "java.sql.Time", "aTime", true);

            final JSONObject timemark = new JSONObject();
            timemark.put("column", column++);
            timemark.put("dateTimeStart", dateTimeStart);
            timemark.put("dateTimeLabel", dateTimeLabel);
            timemark.put("type", "major");
            timemarks.put(timemark);

            // Create minor timemarks for the intervals for all but the last hour
            if (hour < timelineEndHour) {
                for (int segment = 1; segment < minorSegments; segment++) {
                    final int minutes = segment * (60 / minorSegments);
                    final Time tMinor = new Time(hour, minutes, 0);
                    final String minorTimeLabel =
                            EventHandlerBase.formatFieldValue(context, tMinor, "java.sql.Time",
                                "aTime", true);

                    final JSONObject minorTimemark = new JSONObject();
                    minorTimemark.put("column", column++);
                    minorTimemark.put("dateTimeStart", tMinor.toString());
                    minorTimemark.put("dateTimeLabel", minorTimeLabel);
                    minorTimemark.put("type", "minor");
                    timemarks.put(minorTimemark);
                }
            }
        }

        timeline.put("timemarks", timemarks);

        timeline.put("dateTimeEnd", new Time(timelineEndHour, 0, 0).toString());
    }

    /**
     * Loads the resources to the timeline object.
     *
     * @param context
     * @param timeline
     * @param timelineStartHour test
     * @param timelineEndHour
     * @param minorSegments
     */

    public List<DataRecord> retrieveResources(final EventHandlerContext context,
            final JSONObject timeline, final int timelineStartHour, final int minorSegments,
            final String roomArrangeId, final String buildingId) {

        final JSONArray resources = new JSONArray();

        // get the number of timemarks
        final int numberOfTimemarks = ((JSONArray) timeline.get("timemarks")).length();

        // get available rooms
        String restriction = "";
        if (StringUtil.notNullOrEmpty(buildingId)) {
            restriction = "rm_arrange.bl_id='" + buildingId + "'";
        }

        final String[] fields =
                { "rm_arrange.bl_id", "rm_arrange.fl_id", "rm_arrange.rm_id",
                        "rm_arrange.config_id", "rm_arrange.rm_arrange_type_id",
                        "rm_arrange.day_start", "rm_arrange.day_end", "rm.name" };
        final String[] tables = { "rm_arrange", "rm" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields(tables, fields);
        final List<DataRecord> resourceRecords = ds.getRecords(restriction);

        // format room record as XML and add it to the response XML DOM
        for (int row = 0; row < resourceRecords.size(); row++) {
            final DataRecord resourceRecord = resourceRecords.get(row);

            final String bl_id = resourceRecord.getString("rm_arrange.bl_id");
            final String fl_id = resourceRecord.getString("rm_arrange.fl_id");
            final String rm_id = resourceRecord.getString("rm_arrange.rm_id");
            final String configId = resourceRecord.getString("rm_arrange.config_id");
            final String typeId = resourceRecord.getString("rm_arrange.rm_arrange_type_id");
            final Date timeDayStart = resourceRecord.getDate("rm_arrange.day_start");
            final Date timeDayEnd = resourceRecord.getDate("rm_arrange.day_end");

            String record = new String("<record");
            record += " rm.bl_id='" + bl_id + "'";
            record += " rm.fl_id='" + fl_id + "'";
            record += " rm.rm_id='" + rm_id + "'";
            record += " />";

            final int preBlockTimeslots =
                    getRmArrangeBlockTimeslots(context, bl_id, fl_id, rm_id, configId, typeId,
                        "pre_block", minorSegments);
            final int postBlockTimeslots =
                    getRmArrangeBlockTimeslots(context, bl_id, fl_id, rm_id, configId, typeId,
                        "post_block", minorSegments);

            final int columnAvailableFrom =
                    getTimeColumn(timelineStartHour, minorSegments, timeDayStart, numberOfTimemarks);
            final int columnAvailableTo =
                    getTimeColumn(timelineStartHour, minorSegments, timeDayEnd, numberOfTimemarks);

            final boolean requiresApproval = (row % 2 == 0) ? true : false;

            final JSONObject resource = new JSONObject();
            resource.put("row", row);
            resource.put("resourceId", record);
            resource.put("room", bl_id + ":" + fl_id + ":" + rm_id);
            resource.put("roomConfiguration", configId);
            resource.put("roomArrangement", typeId);
            resource.put("preBlockTimeslots", preBlockTimeslots);
            resource.put("postBlockTimeslots", postBlockTimeslots);
            resource.put("columnAvailableFrom", columnAvailableFrom);
            resource.put("columnAvailableTo", columnAvailableTo);
            resource.put("requiresApproval", requiresApproval);
            resources.put(resource);
        }

        timeline.put("resources", resources);

        return resourceRecords;
    }

    /**
     * Retrieves room reservations for available rooms.
     *
     * @param context
     * @param timeline
     * @param timelineStartHour
     * @param minorSegments
     * @param resourceRecords
     */
    public void retrieveEvents(final EventHandlerContext context, final JSONObject timeline,
            final int timelineStartHour, final int minorSegments,
            final List<DataRecord> resourceRecords, final Date dateStart, final Time timeStart,
            final Time timeEnd) {
        final JSONArray events = new JSONArray();
        {
            final String baseRestriction =
                    formatSqlRestriction(context, dateStart, timeStart, timeEnd);

            // retrieve room reservations for each room
            for (int row = 0; row < resourceRecords.size(); row++) {
                final DataRecord resourceRecord = resourceRecords.get(row);

                // add resource restriction to the base SQL restriction
                final String bl_id = resourceRecord.getString("rm_arrange.bl_id");
                final String fl_id = resourceRecord.getString("rm_arrange.fl_id");
                final String rm_id = resourceRecord.getString("rm_arrange.rm_id");

                final String restriction =
                        baseRestriction + " AND reserve_rm.bl_id='" + bl_id
                                + "' AND reserve_rm.fl_id='" + fl_id + "' AND reserve_rm.rm_id='"
                                + rm_id + "'";

                // for each room there can be multiple reservations in the database
                final String[] tables = { "reserve_rm", "reserve" };
                final String[] fields =
                        { "reserve_rm.bl_id", "reserve_rm.fl_id", "reserve_rm.rm_id",
                                "reserve.res_id", "reserve.time_start", "reserve.time_end" };
                final DataSource ds = DataSourceFactory.createDataSourceForFields(tables, fields);
                final List<DataRecord> eventRecords = ds.getRecords(restriction);

                for (final DataRecord eventRecord : eventRecords) {
                    final String resId = eventRecord.getString("reserve.res_id");
                    final Date eventStart = eventRecord.getDate("reserve.time_start");
                    final Date eventEnd = eventRecord.getDate("reserve.time_end");

                    final int eventStartHour = eventStart.getHours();
                    final int eventEndHour = eventEnd.getHours();

                    final JSONObject event = new JSONObject();

                    event.put("eventId", resId);
                    event.put("resourceRow", row);
                    event.put("columnStart", (eventStartHour - timelineStartHour) * minorSegments);
                    event.put("columnEnd", (eventEndHour - timelineStartHour) * minorSegments - 1);
                    event.put("status", 0);

                    events.put(event);
                }
            }
        }
        timeline.put("events", events);
    }

    /**
     * Formats SQL restriction using parameters specified in the event handler context.
     *
     * @param context
     * @return
     */
    private String formatSqlRestriction(final EventHandlerContext context, final Date dateStart,
            final Time timeStart, final Time timeEnd) {
        final StringBuffer where = new StringBuffer();
        where.append(" (reserve.date_start = ${sql.date('" + dateStart + "')} ) AND ");
        where.append(" ((reserve.time_start >= ${sql.time('" + timeStart
            + "')} AND reserve.time_start <= ${sql.time('" + timeEnd + "')} ) OR ");
        where.append("  (reserve.time_end >= ${sql.time('" + timeStart
            + "')} AND reserve.time_end <= ${sql.time('" + timeEnd + "')} ))");
        return where.toString();
    }
}
