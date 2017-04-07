package com.archibus.eventhandler.energy;

import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobBase;

/**
 * ProcessRegressionModel - This class handles all processes related to the regression calculations
 * 
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 * 
 * @author Winston Lagos
 */
public class ProcessRegressionModel extends JobBase {
    /**
     * Logger to write messages to archibus.log.
     */
    private final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * run orchestrates all the processes associated with the regression calculations
     */
    
    @Override
    public void run() {
        if (this.log.isDebugEnabled()) {
            this.log.info("PROCESS REGRESSION MODEL JOB STARTS... ");
        }
        
        /*
         * Integer missingOats = Integer.parseInt(testDailyOat()); if (missingOats > 0) {
         * this.log.error("There are " + missingOats +
         * " days unreported in the weather_station_data table."); }
         */
        
        List<DataRecord> BlList = getBlList();
        PopulateServicePeriodsService.run();
        PopulateDegreeDaysService.run(BlList);
        IdentifyOutliersService.run(BlList);
        clearRegressions();
        BlList = getBlList();// new balance points
        PopulateRegressionModelsService.run(BlList);
        PopulateChartDataService.run();
        if (this.log.isDebugEnabled()) {
            this.log.info("PROCESS REGRESSION MODEL JOB ENDS. ");
        }
    }
    
    /**
     * testDailyOat checks to make sure all the daily oat data has been provisioned in the database
     */
    private String testDailyOat() {
        final String[] flds = { "bl_id" };
        final DataSource DS = DataSourceFactory.createDataSourceForFields("bl", flds);
        final Boolean isOracle = DS.isOracle();
        final Boolean isSybase = DS.isSybase();
        final Boolean isSqlServer = DS.isSqlServer();
        String SQL = "";
        if (isSqlServer || isSybase) {
            SQL =
                    ""
                            + "SELECT SUM(z.missing) "
                            + "FROM   (SELECT  weather_station_id, "
                            + "                DATEDIFF(dd, MIN(date_reported), DATEADD(DAY, -7, GETDATE())) - COUNT(1) AS missing "
                            + "       FROM     weather_station_data "
                            + "       WHERE    date_reported <= DATEADD(DAY, -7, GETDATE()) "
                            + "       GROUP BY weather_station_id " + "       ) " + "       z";
        } else if (isOracle) {
            SQL =
                    ""
                            + "SELECT SUM(missing)"
                            + "FROM   (SELECT  TRUNC(SYSDATE - 7 - MIN(date_reported) - COUNT(date_reported)) AS missing "
                            + "       FROM     weather_station_data "
                            + "       WHERE    date_reported <= SYSDATE - 7 "
                            + "       GROUP BY weather_station_id " + "       )";
        }
        final String[] flds2 = { "weather_station_id" };
        final DataSourceImpl wsdDS = (DataSourceImpl) DataSourceFactory.createDataSource();
        wsdDS.addTable("weather_station_data");
        wsdDS.addField(flds2);
        wsdDS.addQuery(SQL);
        wsdDS.addVirtualField("weather_station_data", "missing", DataSource.DATA_TYPE_NUMBER);
        wsdDS.setDoNotWrapCustomSql(true);
        final DataRecord record = wsdDS.getRecord();
        final Object missing = record.getValue("weather_station_data.missing");
        return missing.toString();
    }
    
    /**
     * getWeatherMap returns a List of DataRecords of daily degree data for each building
     */
    private List<DataRecord> getWeatherMap() {
        final String[] weatherDataTables = { "bl", "weather_station_data" };
        final String[] weatherDataFields =
                { "bl.bl_id", "bl.energy_baseline_year", "bl.utility_type_cool",
                        "bl.utility_type_heat", "weather_station_data.weather_station_id",
                        "weather_station_data.date_reported",
                        "weather_station_data.temp_outside_air" };
        final DataSource weatherDataDS =
                DataSourceFactory.createDataSourceForFields(weatherDataTables, weatherDataFields);
        weatherDataDS.addRestriction(Restrictions.isNotNull("bl", "weather_station_id"));
        weatherDataDS.addRestriction(Restrictions
            .sql("weather_station_data.weather_station_id = bl.weather_station_id"));
        final List<DataRecord> weatherMap = weatherDataDS.getAllRecords();
        return weatherMap;
    }
    
    /**
     * getBlList returns a List of DataRecords of buildings that have a weather station associated
     * to it
     */
    private List<DataRecord> getBlList() {
        final String[] weatherDataFields =
                { "bl_id", "energy_baseline_year", "utility_type_cool", "utility_type_heat",
                        "cooling_balance_point", "heating_balance_point" };
        final DataSource weatherDataDS =
                DataSourceFactory.createDataSourceForFields("bl", weatherDataFields);
        weatherDataDS.addRestriction(Restrictions.isNotNull("bl", "weather_station_id"));
        final List<DataRecord> weatherMap = weatherDataDS.getAllRecords();
        return weatherMap;
    }
    
    private static void clearRegressions() {
        final String SQL = "TRUNCATE TABLE weather_model";
        SqlUtils.executeUpdate("weather_model", SQL);
    }
}
