package com.archibus.service.space.express;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.DateTime;

/**
 * update the end date for selected team/rm_team tables.
 *
 * @author Jikai Xu
 *
 */
public class SpaceConsoleTeamSpaceUpdate {

    /** Property name 'autonumbered_id'. */
    public static final String AUTONUMBERED_ID = "autonumbered_id";

    /** Property name 'team'. */
    public static final String TEAM = "team";

    /** Property name 'rm_team'. */
    public static final String RM_TEAM = "rm_team";

    /** Property name 'rm_team_id'. */
    public static final String RM_TEAM_ID = "rm_team_id";

    /** Property name "'". */
    public static final String QUOTE = "'";

    /**
     * distribute the logic according to tables.
     *
     * @param teamId team's id
     * @param dateStart the start date
     * @param dateEnd the end date
     * @param tableName the table name which is to update
     */
    public void updateEndDateOnAssoc(final String teamId, final String dateStart,
            final String dateEnd, final String tableName) {

        if (TEAM.equals(tableName)) {
            getLatestItemOnTeam(teamId, dateStart, dateEnd, tableName);
        } else if (RM_TEAM.equals(tableName)) {
            getLatestItemOnRmTeam(teamId, dateStart, dateEnd, tableName);
        }
    }

    /**
     * get the latest item by date on team table.
     *
     * @param teamId team's id
     * @param dateStart the start date
     * @param dateEnd the end date
     * @param tableName the table name which is to update
     */
    private void getLatestItemOnTeam(final String teamId, final String dateStart,
            final String dateEnd, final String tableName) {
        final StringBuilder sql = new StringBuilder();
        sql.append("select team.autonumbered_id from ");
        sql.append("(select em_id, max(date_start) as maxDate ");
        sql.append(" from team where team_id=" + getQuotedValue(teamId));
        sql.append(" and ${sql.yearMonthDayOf('date_start')}<= " + getQuotedValue(dateEnd));
        sql.append(" and (date_end is null or ${sql.yearMonthDayOf('date_end')}>= "
                + getQuotedValue(dateStart));
        sql.append(") group by em_id) t , team ");
        sql.append("where t.em_id=team.em_id and ");
        sql.append("${sql.yearMonthDayOf('t.maxDate')}=${sql.yearMonthDayOf('team.date_start')}");
        sql.append(" and team.team_id=" + getQuotedValue(teamId));

        final DataSource dataSource =
                DataSourceFactory.createDataSource().addTable(TEAM, DataSource.ROLE_MAIN)
                    .addVirtualField(TEAM, AUTONUMBERED_ID, DataSource.DATA_TYPE_INTEGER)
                    .addQuery(sql.toString());

        final List<DataRecord> records = dataSource.getAllRecords();

        for (final DataRecord record : records) {
            setEndDate(record.getValue("team.autonumbered_id").toString(), dateEnd, tableName);
        }
    }

    /**
     * get the latest item by date on rm_team table.
     *
     * @param teamId team's id
     * @param dateStart the start date
     * @param dateEnd the end date
     * @param tableName the table name which is to update
     */
    private void getLatestItemOnRmTeam(final String teamId, final String dateStart,
            final String dateEnd, final String tableName) {
        final StringBuilder sql = new StringBuilder();
        sql.append("select rm_team.rm_team_id from ");
        sql.append("(select bl_id, fl_id, rm_id, max(date_start) as maxDate");
        sql.append(" from  rm_team where team_id=" + getQuotedValue(teamId));
        sql.append(" and ${sql.yearMonthDayOf('date_start')}<=" + getQuotedValue(dateEnd));
        sql.append(" and (date_end is null or ${sql.yearMonthDayOf('date_end')}>=");
        sql.append(getQuotedValue(dateStart));
        sql.append(" ) group by bl_id, fl_id, rm_id) t , rm_team");
        sql.append(
            " where t.bl_id=rm_team.bl_id and t.fl_id=rm_team.fl_id and t.rm_id=rm_team.rm_id");
        sql.append(
            " and ${sql.yearMonthDayOf('t.maxDate')}=${sql.yearMonthDayOf('rm_team.date_start')} ");
        sql.append(" and rm_team.team_id=" + getQuotedValue(teamId));

        final DataSource dataSource =
                DataSourceFactory.createDataSource().addTable(RM_TEAM, DataSource.ROLE_MAIN)
                    .addVirtualField(RM_TEAM, RM_TEAM_ID, DataSource.DATA_TYPE_INTEGER)
                    .addQuery(sql.toString());

        final List<DataRecord> records = dataSource.getAllRecords();

        for (final DataRecord record : records) {
            setEndDate(record.getValue("rm_team.rm_team_id").toString(), dateEnd, tableName);
        }
    }

    /**
     * set the end date according to table.
     *
     * @param id team's id
     * @param endDate the start date
     * @param tableName the table name which is to update
     */
    private void setEndDate(final String id, final String endDate, final String tableName) {
        final DataSource dataSource =
                DataSourceFactory.createDataSource().addTable(tableName, DataSource.ROLE_MAIN);

        dataSource.addField(tableName + "_id");
        dataSource.addField("date_start");
        dataSource.addField("date_end");

        String restriction = "";
        if (TEAM.equals(tableName)) {
            dataSource.addField(AUTONUMBERED_ID);
            restriction = " autonumbered_id = " + id;
        } else if (RM_TEAM.equals(tableName)) {
            dataSource.addField(RM_TEAM_ID);
            restriction = " rm_team_id = " + id;
        }

        dataSource.addRestriction(Restrictions.sql(restriction));
        final DataRecord record = dataSource.getRecord();
        record.setValue(tableName + ".date_end", DateTime.stringToDate(endDate, "yyyy-MM-dd"));

        dataSource.saveRecord(record);
    }

    /**
     * set the end date according to table.
     *
     * @param fieldValue add quotes for the value
     * @return string value with quotes
     */
    private String getQuotedValue(final String fieldValue) {
        return QUOTE + fieldValue + QUOTE;
    }
}
