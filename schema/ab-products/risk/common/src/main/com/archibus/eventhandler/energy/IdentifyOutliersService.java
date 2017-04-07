package com.archibus.eventhandler.energy;

import java.util.*;

import org.apache.commons.math.linear.*;
import org.apache.log4j.Logger;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;

/**
 * IdentifyOutliers - determines what days should be excluded from the regression calculation
 * 
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 * 
 * @author Winston Lagos
 */
public class IdentifyOutliersService {
    /**
     * Logger to write messages to archibus.log.
     */
    private final static Logger log = Logger.getLogger(IdentifyOutliersService.class);
    
    /**
     * Invokes the methods that calculate the outliers.
     * 
     * @param BlList
     */
    public static void run(final List<DataRecord> BlList) {
        if (log.isDebugEnabled()) {
            log.info("IdentifyOutliers");
        }
        // for each bl with a weather station
        for (final DataRecord blRecord : BlList) {
            // get bl values
            final String bl_id = blRecord.getValue("bl.bl_id").toString();
            final String utility_type_cool = blRecord.getValue("bl.utility_type_cool").toString();
            final String utility_type_heat = blRecord.getValue("bl.utility_type_heat").toString();
            
            // create energy_bl_svc_period DS
            final String[] svcPeriodFlds =
                    { "date_start", "date_end", "cost", "demand", "consumption", "num_days",
                            "time_period", "bill_type_id", "bl_id", "period_oat", "period_hdd",
                            "period_cdd", "outlier_demand", "outlier_consumption" };
            final DataSource svcPeriodDS =
                    DataSourceFactory.createDataSourceForFields("energy_bl_svc_period",
                        svcPeriodFlds);
            svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period", "bl_id", bl_id));
            svcPeriodDS.addSort("energy_bl_svc_period", "date_start");
            final List<DataRecord> svcPeriodRecords = svcPeriodDS.getRecords();
            
            if (svcPeriodRecords.size() > 0) { // no point in continuing if there aren't any records
            
                // get the earliest start date and latest end date
                // to determine the range
                final String date_start =
                        svcPeriodRecords.get(0).getValue("energy_bl_svc_period.date_start")
                            .toString();
                final String date_end =
                        svcPeriodRecords.get(svcPeriodRecords.size() - 1)
                            .getValue("energy_bl_svc_period.date_end").toString();
                final String firstTimePeriod = date_start.substring(0, 7);
                final String lastTimePeriod = date_end.substring(0, 7);
                Integer firstIndex =
                        TimePeriodUtilService.convertTimePeriodToIndex(firstTimePeriod);
                firstIndex = firstIndex - 1; // in case time period assigned is delayed
                final Integer lastIndex =
                        TimePeriodUtilService.convertTimePeriodToIndex(lastTimePeriod);
                
                String timePeriod;
                final ArrayList<DataRecord> consumptionOutliers = new ArrayList<DataRecord>();
                final ArrayList<DataRecord> demandOutliers = new ArrayList<DataRecord>();
                for (Integer i = firstIndex; i < lastIndex; i++) {
                    
                    // create a one year date range
                    timePeriod = TimePeriodUtilService.convertIndexToTimePeriod(i);
                    final List<Date> dateRange =
                            TimePeriodUtilService.getDateRange(timePeriod, -11);
                    final Date startDate = dateRange.get(0);
                    final Date endDate = dateRange.get(1);
                    svcPeriodDS.clearRestrictions();
                    
                    // create cooling series
                    svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period", "bl_id",
                        bl_id));
                    svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
                        "bill_type_id", utility_type_cool.toUpperCase()));
                    svcPeriodDS.addRestriction(Restrictions.gte("energy_bl_svc_period",
                        "date_start", startDate));
                    svcPeriodDS.addRestriction(Restrictions.lte("energy_bl_svc_period", "date_end",
                        endDate));
                    final List<DataRecord> coolingSeries = svcPeriodDS.getRecords();
                    
                    if (utility_type_cool.equals(utility_type_heat)) {
                        consumptionOutliers.addAll(calculateOutliers(
                            RegressionConstantsService.HDD_CDD,
                            RegressionConstantsService.CONSUMPTION, coolingSeries));
                        demandOutliers.addAll(calculateOutliers(RegressionConstantsService.HDD_CDD,
                            RegressionConstantsService.DEMAND, coolingSeries));
                    } else {
                        
                        // create heating series
                        svcPeriodDS.clearRestrictions();
                        svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period", "bl_id",
                            bl_id));
                        svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
                            "bill_type_id", utility_type_heat.toUpperCase()));
                        svcPeriodDS.addRestriction(Restrictions.lte("energy_bl_svc_period",
                            "date_end", endDate));
                        svcPeriodDS.addRestriction(Restrictions.gte("energy_bl_svc_period",
                            "date_start", startDate));
                        final List<DataRecord> heatingSeries = svcPeriodDS.getRecords();
                        if (heatingSeries.size() > 0) {
                            consumptionOutliers.addAll(calculateOutliers(
                                RegressionConstantsService.HDD,
                                RegressionConstantsService.CONSUMPTION, heatingSeries));
                            consumptionOutliers.addAll(calculateOutliers(
                                RegressionConstantsService.CDD,
                                RegressionConstantsService.CONSUMPTION, coolingSeries));
                            demandOutliers.addAll(calculateOutliers(RegressionConstantsService.CDD,
                                RegressionConstantsService.DEMAND, coolingSeries));
                        }
                    }
                    
                    // Removed for 21.1 per Talisen troublshooting
                    // write the outliers to the database
                    // for (final DataRecord demandRecord : demandOutliers) {
                    // updateOutlier(demandRecord, svcPeriodDS, RegressionConstantsService.DEMAND);
                    // }
                    // for (final DataRecord consumptionRecord : consumptionOutliers) {
                    // updateOutlier(consumptionRecord, svcPeriodDS,
                    // RegressionConstantsService.CONSUMPTION);
                    // }
                    
                }
            } else {
                log.warn("No service periods found.");
            }
        }
    }
    
    /**
     * calculateOutliers performs a linear regression on the series, calculates the permissible
     * threshold, and flags outliers accordingly
     * 
     * @param degreeDaysSelected
     * @param measurementType
     * @param series
     * @throws ExceptionBase
     * @returns List of DataRecords flagged as outliers
     */
    private static List<DataRecord> calculateOutliers(final String degreeDaysSelected,
            final String measurementType, final List<DataRecord> series) {
        
        RealVector measurementVector;
        RealMatrix degreeDayMatrix;
        RealVector dayVector;
        RealVector coeffs = null;
        RealVector residuals = null;
        List<DataRecord> outliers;
        double measurementMean;
        double residualMean;
        double errorThreshold;
        int index;
        
        outliers = new ArrayList<DataRecord>();
        
        try {
            measurementVector = RegressionUtilService.getMeasurementVector(series, measurementType);
            degreeDayMatrix =
                    RegressionUtilService.getDegreeDayMatrix(series, degreeDaysSelected,
                        measurementType);
            dayVector = RegressionUtilService.getDayVector(degreeDayMatrix);
            coeffs =
                    RegressionUtilService.performLinearRegression(degreeDayMatrix,
                        measurementVector);
            residuals =
                    RegressionUtilService.getResiduals(degreeDayMatrix, measurementVector, coeffs);
            
            // outlier residual > x percent of the average measurement
            // and at least y times worse than the average residual
            
            // divide residuals by the number of days to get the error per day
            residuals = residuals.ebeDivide(dayVector);
            // divide measurements by the number of days to get the measurement per day
            measurementVector = measurementVector.ebeDivide(dayVector);
            
            residualMean = RegressionUtilService.getVectorAbsMean(residuals);
            measurementMean = RegressionUtilService.getVectorAbsMean(measurementVector);
            
            // TODO: Per Talisen - the values in the constants here came from an energy engineer. We
            // might want to make these application parameters so a business process owner can
            // adjust at the application level without editing code.
            errorThreshold =
                    Math.min(Math.max(measurementMean
                            * RegressionConstantsService.MIN_PERCENTAGE_ERROR_THRESHOLD,
                        residualMean * RegressionConstantsService.ERROR_THRESHOLD), measurementMean
                            * RegressionConstantsService.MAX_PERCENTAGE_ERROR_THRESHOLD);
            
            index = 0;
            for (final DataRecord point : series) {
                if (Math.abs(residuals.getEntry(index++)) > errorThreshold) {
                    outliers.add(point);
                }
            }
            // } catch (final Exception e) {
        } catch (final ExceptionBase webCentralException) {
            String msg1 =
                    "Error attempting to calculate outlier. "
                            + webCentralException.toStringForLogging();
            if (series.size() > 0) {
                msg1 += "  First record of data series: " + series.get(0);
            }
            log.warn(msg1);
        }
        
        return outliers;
    }
    
    /**
     * updates the outlier flag for any given record in the energy_bl_svc_period table
     * 
     * @param svcPeriodRecord
     * @param svcPeriodDS
     * @param measurementType
     */
    private static void updateOutlier(final DataRecord svcPeriodRecord,
            final DataSource svcPeriodDS, final String measurementType) {
        
        svcPeriodDS.clearRestrictions();
        if (measurementType.equals(RegressionConstantsService.DEMAND)) {
            svcPeriodRecord.setValue("energy_bl_svc_period.outlier_demand", 1);
            svcPeriodDS.saveRecord(svcPeriodRecord);
        } else if (measurementType.equals(RegressionConstantsService.CONSUMPTION)) {
            svcPeriodRecord.setValue("energy_bl_svc_period.outlier_consumption", 1);
            svcPeriodDS.saveRecord(svcPeriodRecord);
        }
    }
    
}
