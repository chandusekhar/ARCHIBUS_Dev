package com.archibus.eventhandler.energy;

import java.io.*;
import java.text.*;
import java.util.*;
import java.util.zip.GZIPInputStream;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobBase;
import com.archibus.utility.*;

/**
 * FetchWeatherStationData - This class process all steps used to gather, parse and store data from
 * NOAA's server
 *
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 */
public class FetchWeatherStationData extends JobBase {
    /**
     * Logger to write messages to archibus.log.
     */
    private final Logger log = Logger.getLogger(this.getClass());

    /**
     * getWeatherStationData - This is a scheduled Work Flow rule that retrieves data from NOAA�s
     * weather stations to populate the degree day data for all buildings.
     *
     * @throws ExceptionBase
     */
    public String getWeatherStationData() {

        // TODO: refactor whole function since it's too many lines and not readable!!!

        if (this.log.isDebugEnabled()) {
            this.log.info("FETCH WEATHER STATION JOB STARTS... ");
        }
        // Get the list of weather stations
        final String SQL =
                "SELECT weather_station_id " + "FROM bl  " + "WHERE bl_id  "
                        + "IN(SELECT bl_id from bill_archive GROUP BY bl_id) "
                        + "AND weather_station_id IS NOT NULL";
        final String[] fields = { "weather_station_id" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields("bl", fields);
        // VPA - avoid error trying to retrieve the weather stations information
        ds.setApplyVpaRestrictions(false);
        ds.addQuery(SQL);
        final List<DataRecord> records = ds.getAllRecords();

        // Get the first bill's year
        final String[] fields2 = { "bill_id", "vn_id", "date_service_start" };
        final DataSource ds2 = DataSourceFactory.createDataSourceForFields("bill_archive", fields2);
        ds2.addSort("date_service_start");
        final DataRecord record2 = ds2.getRecord();
        final String dateServiceStart =
                record2.getValue("bill_archive.date_service_start").toString();
        final Integer startYear = Integer.parseInt(dateServiceStart.substring(0, 4));
        String missingModelYears = "";

        // get current year
        final Calendar cal = Calendar.getInstance();
        final int currYear = cal.get(Calendar.YEAR);

        // TODO: centralize it
        com.enterprisedt.util.license.License
        .setLicenseDetails("ARCHIBUSInc", "382-5943-6920-1248");

        com.enterprisedt.net.ftp.FTPClient ftp = null;
        try {
            // connect to ftp server
            final String serverName = "ftp.ncdc.noaa.gov";
            ftp = new com.enterprisedt.net.ftp.FTPClient();
            ftp.setRemoteHost(serverName);
            ftp.connect();
            ftp.login("ftp", "");

            ftp.setConnectMode(com.enterprisedt.net.ftp.FTPConnectMode.PASV);
            ftp.setType(com.enterprisedt.net.ftp.FTPTransferType.BINARY);

            // for each weather station retrieve the degree data
            for (final DataRecord record : records) {
                final Object station_id = record.getValue("bl.weather_station_id");
                final String weather_station_id = station_id.toString();

                // set variables
                final String fileLocation =
                        ContextStore.get().getWebAppPath() + File.separator + "projects"
                                + File.separator;
                final File newFolder = new File(fileLocation);
                if (!newFolder.exists()) {
                    newFolder.createNewFile();
                }

                // get weather station data for all the years there is bill data available
                for (int year = startYear; currYear + 1 > year; year++) {
                    final String gzipFileName =
                            weather_station_id + "-" + Integer.toString(year) + ".op.gz";
                    final String plFileName =
                            weather_station_id + "-" + Integer.toString(year) + ".op";
                    final String ftpFile =
                            "/pub/data/gsod/" + Integer.toString(year) + "/" + gzipFileName;

                    // KB 3037013 IOAN :check if current file exists on server otherwise skip and
                    // try to get next file
                    if (ftp.existsFile(ftpFile)) {

                        // copy gz file from server
                        final OutputStream output =
                                new FileOutputStream(fileLocation + gzipFileName);
                        ftp.get(output, ftpFile);
                        output.close();

                        // uncompress local .gz file
                        try {
                            final GZIPInputStream gzipInputStream =
                                    new GZIPInputStream(new FileInputStream(fileLocation
                                        + gzipFileName));
                            final OutputStream out =
                                    new FileOutputStream(fileLocation + plFileName);

                            final byte[] buf = new byte[1024];
                            int len;
                            while ((len = gzipInputStream.read(buf)) > 0) {
                                out.write(buf, 0, len);
                            }
                            out.close();
                            gzipInputStream.close();
                            updateWeatherStationData(fileLocation + plFileName, weather_station_id);
                        } catch (final IOException e) {

                            this.log.error("error uncompressing file: " + fileLocation
                                + gzipFileName);

                            // delete local .op and .gz files
                            final File f1 = new File(fileLocation + gzipFileName);
                            final boolean success = f1.delete();
                            if (!success) {
                                this.log.error("Deletion failed for: " + fileLocation
                                    + gzipFileName);
                            } else {
                                if (this.log.isDebugEnabled()) {
                                    this.log.info("File deleted.");
                                }
                            }
                        }
                    } else {
                        final String missingModelYear =
                                "<br/>" + weather_station_id + ", " + Integer.toString(year);
                        this.log.warn(missingModelYear);
                        missingModelYears += missingModelYear;
                    }
                }
            }
            ftp.quit();

        } catch (final java.net.ConnectException e) {
            // @translatable
            final String msg =
                    "The weather station data connection cannot be established, or has timed out. Please try again.";
            throw new ExceptionBase(null, msg, e);
        } catch (final Exception e) {
            e.printStackTrace();
            // @translatable
            final String msg = "Error attempting to parse weather station data";
            throw new ExceptionBase(null, msg, e);
        } finally {
            if (ftp != null && ftp.connected()) {
                try {
                    ftp.quit();
                } catch (final Exception ioe) {
                    this.log.error("Error disconnecting from ftp server.");
                }
            }
        }
        if (this.log.isDebugEnabled()) {
            this.log.info("FETCH WEATHER STATION JOB ENDS. ");
        }

        return missingModelYears;
    }

    /**
     * updateWeatherStationData - opens a local pl file transfered from NOAA's server, reads, parses
     * and saves the data into the database
     *
     * @param plFile
     * @param weather_station_id
     * @throws ExceptionBase
     */
    private void updateWeatherStationData(final String plFile, final String weather_station_id)
            throws ExceptionBase {
        final StringBuffer contents = new StringBuffer();
        BufferedReader input = null;
        try {
            input = new BufferedReader(new FileReader(plFile), 1);
            String line = null;
            while ((line = input.readLine()) != null) {
                contents.append(line);
                contents.append(System.getProperty("line.separator"));
            }
        } catch (final FileNotFoundException ex) {
            // @translatable
            final String msg = "Unable to find file: " + plFile;
            throw new ExceptionBase(null, msg, ex);
        } catch (final IOException ex) {
            // @translatable
            final String msg = "Error reading file " + plFile;
            throw new ExceptionBase(null, msg, ex);
        } finally {
            try {
                input.close();
            } catch (final IOException e) {
                // @translatable
                final String msg = "Error closing File " + plFile;
                throw new ExceptionBase(null, msg, e);
            }
        }
        final String[] entries = contents.toString().split("\n");
        for (int i = 1; entries.length > i; i++) {
            final String entry = entries[i];
            final String[] field = entry.split("  ");
            final String yearmoda = field[1];
            final String year = yearmoda.substring(0, 4);
            final String month = yearmoda.substring(4, 6);
            final String day = yearmoda.substring(6, 8);
            final String date = year + "-" + month + "-" + day;
            final DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            Date date_reported = null;
            try {
                date_reported = df.parse(date);
            } catch (final ParseException e) {
                // @translatable
                final String msg = "Unable to parse date value:" + date;
                throw new ExceptionBase(null, msg, e);
            }

            String elevationRaw = field[3];
            // edit to support 3 digit temperatures - temperature will be captured in the previous
            // split: field[2]
            if (!StringUtil.notNullOrEmpty(elevationRaw)) {
                elevationRaw = field[2].trim();
            }
            // if elevationRaw is still an empty string
            if (!StringUtil.notNullOrEmpty(elevationRaw)) {
                elevationRaw = "0.00";
            }
            elevationRaw = elevationRaw.replaceAll("[ ]", "");
            final Double elevation = Double.parseDouble(elevationRaw);
            final String weatherStationDataTable = "weather_station_data";
            final String[] weatherStationDataFields =
                { "weather_source_id", "weather_station_id", "date_reported",
                    "temp_outside_air", "estimated" };
            final DataSource ds =
                    DataSourceFactory.createDataSourceForFields(weatherStationDataTable,
                        weatherStationDataFields);
            ds.addRestriction(Restrictions.eq("weather_station_data", "weather_station_id",
                weather_station_id));
            ds.addRestriction(Restrictions.eq("weather_station_data", "date_reported",
                date_reported));
            final List<DataRecord> records = ds.getRecords();
            if (records.toArray().length == 0) {
                final DataSource weatherStationData_ds =
                        DataSourceFactory.createDataSourceForFields(weatherStationDataTable,
                            weatherStationDataFields);
                final DataRecord weatherStationDataRecord = weatherStationData_ds.createNewRecord();
                weatherStationDataRecord.setValue("weather_station_data.weather_source_id", "NOAA");
                weatherStationDataRecord.setValue("weather_station_data.weather_station_id",
                    weather_station_id);
                weatherStationDataRecord.setValue("weather_station_data.date_reported",
                    date_reported);
                weatherStationDataRecord.setValue("weather_station_data.temp_outside_air",
                    elevation);
                weatherStationDataRecord.setValue("weather_station_data.estimated", 0);
                weatherStationData_ds.saveRecord(weatherStationDataRecord);
            }
        }
        // delete local .op and .gz files
        final String gzFile = plFile + ".gz";
        final File f1 = new File(plFile);
        final File f2 = new File(gzFile);
        final boolean success = f1.delete();
        final boolean success2 = f2.delete();
        if (!success || !success2) {
            this.log.error("One of the following files did not get deleted: " + plFile + " or "
                    + gzFile);
        } else {
            if (this.log.isDebugEnabled()) {
                this.log.info("Files deleted: " + plFile + " and " + gzFile);
            }
        }
    }
}
