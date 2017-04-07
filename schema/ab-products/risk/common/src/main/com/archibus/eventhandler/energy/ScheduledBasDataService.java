package com.archibus.eventhandler.energy;

import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.JobBase;

/**
 * ScheduledBasDataService - This class handles processing of BAS (Building Automation Systems) data
 *
 * (2016-02-12 - KE - Modified to not delete bas_data_clean_num readings for meters with sampling
 * interval of quarterly or yearly, in order to avoid potential deletion of these infrequent
 * readings needed for bas_data_clean_num and bas_data_time_norm_num data processing.)
 *
 * History: <li>21.3 Initial implementation.
 *
 * Suppress PMD warning "AvoidUsingSql".
 * <p>
 * Justification: Case #1: SQL statements with subqueries.
 *
 * @author Razvan Croitoru
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class ScheduledBasDataService extends JobBase {

    /**
     * scheduledDeleteBasDataRecords - Delete BAS records that are older than the parameter. Delete
     * all raw data from the bas_data_clean_num table and all 15Min and Hourly summary data from the
     * bas_data_time_norm_num table.
     *
     * (KE 2016-02-15 - Do not delete data if parameter value is left at the default value of 0. Do
     * not delete quarterly and yearly meter clean data (sampling_interval >= 7776000).)
     *
     */
    public void scheduledDeleteBasDataRecords() {

        final DataSource dataSource =
                DataSourceFactory.createDataSourceForTable("afm_activity_params");
        final List<DataRecord> records = dataSource.getRecords();
        DataRecord record = null;
        for (int i = 0; i < records.size(); i++) {
            record = records.get(i);
            final String name = (String) record.getValue("afm_activity_params.param_id");
            if ("BASSchedDataDelete_AgeMonths".equals(name)) {
                break;
            }
        }

        final int months =
                Integer.parseInt(record.getValue("afm_activity_params.param_value").toString());

        if (months > 0) {
            final Date date = new Date();
            final Calendar calendar = Calendar.getInstance();
            calendar.setTime(date);
            calendar.add(Calendar.MONTH, -months);
            final SimpleDateFormat sdFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
            final String parsedDate = sdFormat.format(calendar.getTime());

            StringBuilder sqlDelete = new StringBuilder();
            sqlDelete.append(" DELETE FROM bas_data_time_norm_num WHERE date_measured < '"
                    + parsedDate + "' AND interval IN ('15MIN','HOUR')");
            SqlUtils.executeUpdate("bas_data_time_norm_num", sqlDelete.toString());

            sqlDelete = new StringBuilder();
            sqlDelete.append(" DELETE FROM bas_data_clean_num ");
            sqlDelete.append(" WHERE bas_data_clean_num.date_measured < '" + parsedDate + "'");
            sqlDelete.append(" AND bas_data_clean_num.data_point_id IN (");
            sqlDelete.append(" SELECT bas_data_point.data_point_id ");
            sqlDelete.append(" FROM bas_data_point ");
            sqlDelete.append(" WHERE bas_data_point.sampling_interval < 7776000 )");
            SqlUtils.executeUpdate("bas_data_clean_num", sqlDelete.toString());
        }
    }

}
