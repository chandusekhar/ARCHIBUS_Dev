package com.archibus.eventhandler.energy;

import java.util.*;

import org.apache.commons.math.linear.*;
import org.apache.log4j.Logger;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;

/**
 * PopulateDegreeDays determines the balance points and calculates the HDDs and CDDs for all the
 * buildings
 *
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 *
 *         23.1 Revised to support multiple bills per bill type per building per month
 * @author Eric Maxfield
 */
public class PopulateDegreeDaysService {
    /**
     * Logger to write messages to archibus.log.
     */
    private final static Logger log = Logger.getLogger(PopulateDegreeDaysService.class);

    /**
     * @param BlList
     */
    public static void run(final List<DataRecord> BlList) {
        if (log.isDebugEnabled()) {
            log.info("PopulateDegreeDays");
        }
        for (final DataRecord blRecord : BlList) {
            final String bl_id = blRecord.getValue("bl.bl_id").toString();
            final String energy_baseline_year =
                    blRecord.getValue("bl.energy_baseline_year").toString();
            final String utility_type_cool = blRecord.getValue("bl.utility_type_cool").toString();
            final String utility_type_heat = blRecord.getValue("bl.utility_type_heat").toString();

            // get date_start and date_end values
            final List<Date> dateRange =
                    TimePeriodUtilService.getDateRange(energy_baseline_year, -24);
            final Date date_start = dateRange.get(0);
            final Date date_end = dateRange.get(1);

            // get the service periods
            // TODO: (WL) check if index count goes up or down
            final String[] svcPeriodFlds = { "date_start", "date_end", "cost", "demand",
                    "consumption", "num_days",
                    // "time_period", "bill_type_id", "bl_id", "auto_number", "period_oat" };
                    "time_period", "bill_type_id", "bl_id", "vn_id", "bill_id", "period_oat" };
            final DataSource svcPeriodDS = DataSourceFactory
                .createDataSourceForFields("energy_bl_svc_period", svcPeriodFlds);
            svcPeriodDS
                .addRestriction(Restrictions.gte("energy_bl_svc_period", "date_end", date_end));
            svcPeriodDS
                .addRestriction(Restrictions.lte("energy_bl_svc_period", "date_start", date_start));
            svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period", "bl_id", bl_id));

            final List<DataRecord> svcPeriodRecords = svcPeriodDS.getRecords();

            if (svcPeriodRecords.size() > 0) {
                final ArrayList<DataRecord> coolingSvcPeriodRecords = new ArrayList<DataRecord>();
                final ArrayList<DataRecord> heatingSvcPeriodRecords = new ArrayList<DataRecord>();
                for (final DataRecord svcPeriodRecord : svcPeriodRecords) {
                    final String bill_type_id = svcPeriodRecord
                        .getValue("energy_bl_svc_period.bill_type_id").toString();
                    if (bill_type_id.equals(utility_type_cool.toUpperCase())) {
                        coolingSvcPeriodRecords.add(svcPeriodRecord);
                    }

                    if (bill_type_id.equals(utility_type_heat.toUpperCase())) {
                        heatingSvcPeriodRecords.add(svcPeriodRecord);
                    }
                }
                final Double coolingBalancePoint =
                        calculateBalancePoint(coolingSvcPeriodRecords, bl_id);
                final Double heatingBalancePoint =
                        calculateBalancePoint(heatingSvcPeriodRecords, bl_id);
                /*
                 * if (!utility_type_cool.equals(utility_type_heat)) { heatingBalancePoint =
                 * calculateBalancePoint(heatingSvcPeriodRecords); } else { }
                 */
                updateBalancePoints(bl_id, coolingBalancePoint, heatingBalancePoint);
            } else {
                if (log.isDebugEnabled()) {
                    log.info("No service periods available.");
                }
            }
        }
        updateDegreeDays();
    }

    /**
     * calculateBalancePoint estimates the heating and cooling balance points for the specified
     * building
     *
     * @param svcPeriod
     * @param blId building code
     * @return The balance point of a given set of service periods
     */
    private static double calculateBalancePoint(final List<DataRecord> svcPeriod,
            final String blId) {
        double balancePoint = 0.0;

        RealVector measurementVector;
        RealMatrix oatMatrix;
        RealVector coolingCoeffs;
        RealVector heatingCoeffs;

        try {
            // 2 variable regression for cooling consumption = c1*OAT + b1
            measurementVector = getOatMeasurementVector(svcPeriod, "COOLING");
            oatMatrix = getOatMatrix(svcPeriod, "COOLING", measurementVector.getDimension());
            coolingCoeffs =
                    RegressionUtilService.performLinearRegression(oatMatrix, measurementVector);

            // 2 variable regression for heating consumption = c2*OAT + b2
            measurementVector = getOatMeasurementVector(svcPeriod, "HEATING");
            oatMatrix = getOatMatrix(svcPeriod, "HEATING", measurementVector.getDimension());
            heatingCoeffs =
                    RegressionUtilService.performLinearRegression(oatMatrix, measurementVector);

            // regression line intersect (b2 - b1) / (c1 - c2)
            balancePoint = (heatingCoeffs.getEntry(1) - coolingCoeffs.getEntry(1))
                    / (coolingCoeffs.getEntry(0) - heatingCoeffs.getEntry(0));
            balancePoint = Math.min(balancePoint, 65.0);
            balancePoint = Math.max(balancePoint, 52.0);
            balancePoint = (Math.round(balancePoint * 10.0) / 10.0);
        } catch (final Exception e) {
            // default to 60 degrees in case of exceptions
            log.warn(" Building code: " + blId
                    + " - error while attempting to calculate balance point, defaulting it to 60. Service period in context");
            balancePoint = 60.0;
        }

        return balancePoint;
    }

    /**
     * Updates the building provided with the heating and cooling balance points specified.
     *
     * @param bl_id
     * @param coolingBalancePoint
     * @param heatingBalancePoint
     */
    private static void updateBalancePoints(final String bl_id, final Double coolingBalancePoint,
            final Double heatingBalancePoint) {
        final String[] blFlds = { "bl_id", "cooling_balance_point", "heating_balance_point" };
        final DataSource blDS = DataSourceFactory.createDataSourceForFields("bl", blFlds);
        blDS.addRestriction(Restrictions.eq("bl", "bl_id", bl_id));
        final DataRecord blRecord = blDS.getRecord();
        blRecord.setValue("bl.cooling_balance_point", coolingBalancePoint);
        blRecord.setValue("bl.heating_balance_point", heatingBalancePoint);
        blDS.updateRecord(blRecord);

    }

    /**
     * Updates the service periods cdds and hdds.
     */
    private static void updateDegreeDays() {
        final String[] flds = { "bl_id" };
        final DataSource DS = DataSourceFactory.createDataSourceForFields("bl", flds);
        final Boolean isOracle = DS.isOracle();
        final Boolean isSybase = DS.isSybase();
        final Boolean isSqlServer = DS.isSqlServer();
        String SQL = "";
        if (isSqlServer || isSybase) {
            SQL = "" + "UPDATE energy_bl_svc_period " + "SET    period_cdd = ISNULL( "
                    + "       (SELECT SUM( " + "                       CASE "
                    + "                               WHEN o.temp_outside_air > b.cooling_balance_point "
                    + "                               THEN o.temp_outside_air - b.cooling_balance_point "
                    + "                               ELSE 0 "
                    + "                       END) period_cdd "
                    + "       FROM    energy_bl_svc_period p " + "               JOIN bl b "
                    + "               ON      b.bl_id = p.bl_id "
                    + "               LEFT JOIN weather_station s "
                    + "               ON      s.weather_station_id = b.weather_station_id "
                    + "               LEFT JOIN weather_station_data o "
                    + "               ON      o.weather_station_id = s.weather_station_id "
                    + "       WHERE   o.date_reported             >= p.date_start "
                    + "       AND     o.date_reported              < p.date_end "
                    // + " AND p.auto_number = energy_bl_svc_period.auto_number "
                    + "       AND     p.vn_id                = energy_bl_svc_period.vn_id "
                    + "       AND     p.bill_id                = energy_bl_svc_period.bill_id "
                    + "       ) " + "       ,0) , " + "       period_hdd = ISNULL( "
                    + "       (SELECT SUM( " + "                       CASE "
                    + "                               WHEN o.temp_outside_air < b.heating_balance_point "
                    + "                               THEN b.heating_balance_point - o.temp_outside_air "
                    + "                               ELSE 0 "
                    + "                       END) period_hdd "
                    + "       FROM    energy_bl_svc_period p " + "               JOIN bl b "
                    + "               ON      b.bl_id = p.bl_id "
                    + "               LEFT JOIN weather_station s "
                    + "               ON      s.weather_station_id = b.weather_station_id "
                    + "               LEFT JOIN weather_station_data o "
                    + "               ON      o.weather_station_id = s.weather_station_id "
                    + "       WHERE   o.date_reported             >= p.date_start "
                    + "       AND     o.date_reported              < p.date_end "
                    // + " AND p.auto_number = energy_bl_svc_period.auto_number "
                    + "       AND     p.vn_id                = energy_bl_svc_period.vn_id "
                    + "       AND     p.bill_id                = energy_bl_svc_period.bill_id "
                    + "       ) " + "       ,0)";
        } else if (isOracle) {
            SQL = "" + "UPDATE energy_bl_svc_period " + "SET    period_cdd = NVL( "
                    + "                          (SELECT SUM( "
                    + "                                          CASE "
                    + "                                                  WHEN o.temp_outside_air > b.cooling_balance_point "
                    + "                                                  THEN o.temp_outside_air - b.cooling_balance_point "
                    + "                                                  ELSE 0 "
                    + "                                          END) period_cdd "
                    + "                          FROM    energy_bl_svc_period p "
                    + "                                  JOIN bl b "
                    + "                                  ON      b.bl_id = p.bl_id "
                    + "                                  LEFT JOIN weather_station s "
                    + "                                  ON      s.weather_station_id = b.weather_station_id "
                    + "                                  LEFT JOIN weather_station_data o "
                    + "                                  ON      o.weather_station_id = s.weather_station_id "
                    + "                          WHERE   o.date_reported             >= p.date_start "
                    + "                          AND     o.date_reported              < p.date_end "
                    // + " AND p.auto_number = energy_bl_svc_period.auto_number "
                    + "                          AND     p.vn_id                  = energy_bl_svc_period.vn_id "
                    + "                          AND     p.bill_id                = energy_bl_svc_period.bill_id "
                    + "                          ) " + "                        ,0) " + "       , "
                    + "       period_hdd = NVL( " + "                          (SELECT SUM( "
                    + "                                          CASE "
                    + "                                                  WHEN o.temp_outside_air < b.heating_balance_point "
                    + "                                                  THEN b.heating_balance_point - o.temp_outside_air "
                    + "                                                  ELSE 0 "
                    + "                                          END) period_hdd "
                    + "                          FROM    energy_bl_svc_period p "
                    + "                                  JOIN bl b "
                    + "                                  ON      b.bl_id = p.bl_id "
                    + "                                  LEFT JOIN weather_station s "
                    + "                                  ON      s.weather_station_id = b.weather_station_id "
                    + "                                  LEFT JOIN weather_station_data o "
                    + "                                  ON      o.weather_station_id = s.weather_station_id "
                    + "                          WHERE   o.date_reported             >= p.date_start "
                    + "                          AND     o.date_reported              < p.date_end "
                    // + " AND p.auto_number = energy_bl_svc_period.auto_number "
                    + "                          AND     p.vn_id                  = energy_bl_svc_period.vn_id "
                    + "                          AND     p.bill_id                = energy_bl_svc_period.bill_id "
                    + "                          ) " + "                        ,0)";
        }

        SqlUtils.executeUpdate("energy_bl_svc_period", SQL);
    }

    /**
     * getOatMeasurementVector builds a consumption measurement vector for an OAT regression (used
     * to estimate the balance point).
     *
     * @param svcPeriod
     * @param mode
     * @throws ExceptionBase
     */
    private static RealVector getOatMeasurementVector(final List<DataRecord> svcPeriod,
            final String mode) throws ExceptionBase {

        double[] vector;
        int index = 0;
        int count = 0;
        Double periodOat;
        Double consumption;
        Double numDays;

        // first count the usable points
        for (final DataRecord point : svcPeriod) {
            periodOat = Double
                .parseDouble(point.getValue("energy_bl_svc_period.period_oat").toString());
            consumption = Double
                .parseDouble(point.getValue("energy_bl_svc_period.consumption").toString());
            numDays =
                    Double.parseDouble(point.getValue("energy_bl_svc_period.num_days").toString());

            if (mode.equals("COOLING")) {
                if (periodOat > 63.0) {
                    count++;
                }
            } else if (mode.equals("HEATING")) {
                if (periodOat < 55.0) {
                    count++;
                }
            } else {
                // @translatable
                final String msg = "Invalid regression parameter.";
                throw new ExceptionBase(null, msg);
            }

        }

        if (count < 3) {
            // @translatable
            // String msg =
            // "Inadequate data for regression, count of service periods provided is less than 3.";
            // throw new ExceptionBase(null, msg);
        }

        // then build the vector with the consumption from the usable points
        vector = new double[count];

        for (final DataRecord point2 : svcPeriod) {
            periodOat = Double
                .parseDouble(point2.getValue("energy_bl_svc_period.period_oat").toString());
            consumption = Double
                .parseDouble(point2.getValue("energy_bl_svc_period.consumption").toString());
            numDays =
                    Double.parseDouble(point2.getValue("energy_bl_svc_period.num_days").toString());

            if (numDays > 0) {
                if (mode.equals("COOLING")) {
                    if (periodOat > 63.0) {
                        vector[index++] = consumption / numDays;
                    }
                } else if (mode.equals("HEATING")) {
                    if (periodOat < 55.0) {
                        vector[index++] = consumption / numDays;
                    }
                } else {
                    // @translatable
                    final String msg = "Invalid regression parameter: mode = " + mode;
                    throw new ExceptionBase(null, msg);
                }
            }
        }

        return new ArrayRealVector(vector);
    }

    /**
     * getOatMatrix builds a OAT matrix for an OAT regression (used to estimate the balance point).
     *
     * @param svcPeriod
     * @param mode
     * @param count
     * @return OAT Matrix
     * @throws ExceptionBase
     */
    private static RealMatrix getOatMatrix(final List<DataRecord> svcPeriod, final String mode,
            final int count) throws ExceptionBase {

        double[][] matrix;
        int index = 0;
        Double periodOat;

        matrix = new double[count][2];

        for (final DataRecord point : svcPeriod) {
            periodOat = Double
                .parseDouble(point.getValue("energy_bl_svc_period.period_oat").toString());

            if (mode.equals("COOLING")) {
                if (periodOat > 63.0) {
                    matrix[index][0] = periodOat;
                    matrix[index++][1] = 1.0;
                }
            } else if (mode.equals("HEATING")) {
                if (periodOat < 55.0) {
                    matrix[index][0] = periodOat;
                    matrix[index++][1] = 1.0;
                }
            } else {
                // @translatable
                final String msg = "Invalid regression parameter: mode = " + mode;
                throw new ExceptionBase(null, msg);
            }
        }

        return new Array2DRowRealMatrix(matrix);
    }
}
