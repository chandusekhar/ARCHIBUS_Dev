package com.archibus.eventhandler.energy;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.jobmanager.*;

/**
 * RetrieveWeatherStations <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 */

public class RetrieveWeatherStations extends JobBase {

    /**
     * getWeatherStationsNearBy - This Work Flow rule returns weather stations located "distance"
     * miles from to the "lat" and "lon" points provided
     *
     * @param lat
     * @param lon
     * @param distance
     * @return list of weather station records
     */

    public DataSet getWeatherStationsNearBy(final String lat, final String lon,
            final String distance) {
        final String SQL =
                "SELECT   weather_station_id, " + "lat, " + "lon, " + "elevation, "
                        + "weather_source_id, " + " acos(SIN( 3.14159265* "
                        + lat
                        + "/180 )*SIN( 3.14159265*lat/180 ) )+(cos(3.14159265* "
                        + lat
                        + "/180)*COS( 3.14159265*lat/180) *COS(3.14159265*lon/180-3.14159265* "
                        + lon
                        + "/180) )* 3963.191 AS distance "
                        + "FROM     weather_station "
                        + "WHERE    1=1 "
                        + "AND      3963.191 * ACOS( (SIN(3.14159265* "
                        + lat
                        + "/180)*SIN(3.14159265 * lat/180)) + (COS(3.14159265* "
                        + lat
                        + "/180)*cos(3.14159265*lat/180)*COS(3.14159265 * lon/180-3.14159265* "
                        + lon
                        + "/180)) ) <= "
                        + distance
                        + "ORDER BY 3963.191 * ACOS( (SIN(3.14159265* "
                        + lat
                        + "/180)*SIN(3.14159265*lat/180)) + (COS(3.14159265* "
                        + lat
                        + "/180)*cos(3.14159265*lat/180)*COS(3.14159265 * lon/180-3.14159265* "
                        + lon + "/180)) )";

        final String[] flds =
            { "weather_station_id", "lat", "lon", "elevation", "weather_source_id" };

        /*
         * work around since SqlUtils.executeQuery adds a "SELECT * FROM(" around the statement
         * defined and this makes the query fail on MSSQL
         */

        final DataSourceImpl ds = (DataSourceImpl) DataSourceFactory.createDataSource();
        ds.addTable("weather_station");
        ds.addField(flds);
        ds.addQuery(SQL);
        ds.setDoNotWrapCustomSql(true);
        final List<DataRecord> weatherStations = ds.getAllRecords();

        /*
         * End of work around
         */

        /*
         * Instead of the work around we should use this
         *
         * List<DataRecord> weatherStations = SqlUtils.executeQuery("weather_station", flds, SQL);
         */

        final DataSet dataSet = new DataSetList(weatherStations);
        return dataSet;
    }

    /**
     * populateWeatherStationList - This Work Flow rule gets a listing of degree data files
     * available in NOAA's FTP server, cross references it with a ish-history.csv file to obtain
     * weather station details only of weather stations that actually have data files associated
     * with it, and then inserts the records into the weather_station table.
     *
     * @return true if process is executed OK
     */

    public boolean populateWeatherStationList() {
        this.status.setTotalNumber(10);
        this.status.setCurrentNumber(1);
        final UpdateWeatherStationAllList ws = new UpdateWeatherStationAllList();
        ws.populateWeatherStationList();
        this.status.setCurrentNumber(10);
        this.status.setCode(JobStatus.JOB_COMPLETE);
        return true;
    }

    /**
     * getWeatherStationData - This rule retrieves data from NOAA�s weather stations to populate the
     * degree day data for all buildings.
     *
     * @return true if process is executed OK
     */

    public String getWeatherStationData() {
        this.status.setTotalNumber(10);
        this.status.setCurrentNumber(1);
        final FetchWeatherStationData ws = new FetchWeatherStationData();
        final String result = ws.getWeatherStationData();
        this.status.setCurrentNumber(10);
        this.status.setCode(JobStatus.JOB_COMPLETE);
        return result;
    }
}
