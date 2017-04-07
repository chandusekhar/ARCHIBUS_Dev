package com.archibus.eventhandler.energy;

import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

/**
 * PopulateServicePeriods - This class populates the energy_bl_svc_period
 *
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 *
 * 23.1 Revision to support multiple bills per building per bill type per month
 * @author Eric Maxfield
 */

public class PopulateServicePeriodsService {
    /**
     * Logger to write messages to archibus.log.
     */
    private final static Logger log = Logger.getLogger(PopulateServicePeriodsService.class);

    /**
     * Class variables used by run() and addSvcPeriodVals()
     */
    static String currentBlId = "";

    static String currentVnId = "";

    static String currentVnAcId = "";

    static String currentBillId = "";

    static String currentTimePeriod = "";

    static String currentBillType = "";

    static Double qtyEnergy = 0.0;

    static Double qtyPower = 0.0;

    static Double qtyVolume = 0.0;

    static Double amtExpense = 0.0;

    static ArrayList<Date> endDates = new ArrayList<Date>();

    static ArrayList<Date> startDates = new ArrayList<Date>();

    static Double qty_energy = 0.0;

    static Double qty_power = 0.0;

    static Double qty_volume = 0.0;

    static Double amount_expense = 0.0;

    static Date date_service_end;

    static Date date_service_start;

    static Integer count = 0;

    /**
     * populate the energy_bl_svc_period based on the data available in the bill_archive table
     *
     * @throws ExceptionBase
     */
    public static void run() {
        if (log.isDebugEnabled()) {
            log.info("PopulateServicePeriods");
        }
        count = 0;
        deleteDailyServicePeriods();
        final DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        String bl_id = "";
        String vn_id = "";
        String vn_ac_id = "";
        String bill_id = "";
        String time_period = "";
        String bill_type_id = "";
        final String[] svcPeriodFlds =
                { "date_start", "date_end", "cost", "demand", "consumption", "num_days",
                        "time_period", "bill_type_id", "bl_id", "vn_id", "vn_ac_id", "bill_id" };
        final DataSource svcPeriodDS =
                DataSourceFactory.createDataSourceForFields("energy_bl_svc_period", svcPeriodFlds);
        final List<DataRecord> billRecords = loadBillPeriods();
        for (final DataRecord billRecord : billRecords) {
            bl_id = billRecord.getValue("bill_archive.bl_id").toString();
            vn_id = billRecord.getValue("bill_archive.vn_id").toString();
            vn_ac_id = billRecord.getValue("bill_archive.vn_ac_id").toString();
            bill_id = billRecord.getValue("bill_archive.bill_id").toString();
            time_period = billRecord.getValue("bill_archive.time_period").toString();
            bill_type_id = billRecord.getValue("bill_archive.bill_type_id").toString();
            qty_energy =
                    Double.parseDouble(billRecord.getValue("bill_archive.qty_energy").toString());
            qty_power =
                    Double.parseDouble(billRecord.getValue("bill_archive.qty_power").toString());
            qty_volume =
                    Double.parseDouble(billRecord.getValue("bill_archive.qty_volume").toString());
            amount_expense = 
                    Double.parseDouble(billRecord.getValue("bill_archive.amount_expense").toString());
            try {
                date_service_end =
                        df.parse(billRecord.getValue("bill_archive.date_service_end").toString());
                date_service_start =
                        df.parse(billRecord.getValue("bill_archive.date_service_start").toString());
            } catch (final ParseException e) {
                // @translatable
                final String msg =
                        "Error attempting to parse date service start and date service end.";
                throw new ExceptionBase(null, msg, e);
            }
            // This if statement is not working as expected. Talisen mod. for V.21.1.
            // if(((!bill_type_id.equals(currentBillType)) || (!bl_id.equals(currentBlId)) || (
            // !time_period.equals(currentTimePeriod))) && count != 0){
            addSvcPeriodVals();
            Collections.sort(startDates);
            Collections.sort(endDates);
            final Date startDate = startDates.get(endDates.size() - 1);
            final Date endDate = endDates.get(endDates.size() - 1);

            final Long ONE_HOUR = 60 * 60 * 1000L;
            final Long num_days =
                    (endDate.getTime() - startDate.getTime() + ONE_HOUR) / (ONE_HOUR * 24);
            final DataRecord svcPeriodRecord = svcPeriodDS.createNewRecord();
            svcPeriodRecord.setValue("energy_bl_svc_period.bl_id", bl_id);
            svcPeriodRecord.setValue("energy_bl_svc_period.vn_id", vn_id);
            svcPeriodRecord.setValue("energy_bl_svc_period.vn_ac_id", vn_ac_id);
            svcPeriodRecord.setValue("energy_bl_svc_period.bill_id", bill_id);
            svcPeriodRecord.setValue("energy_bl_svc_period.bill_type_id", bill_type_id);
            svcPeriodRecord.setValue("energy_bl_svc_period.time_period", time_period);
            svcPeriodRecord.setValue("energy_bl_svc_period.date_start", date_service_start);
            svcPeriodRecord.setValue("energy_bl_svc_period.date_end", date_service_end);
            svcPeriodRecord.setValue("energy_bl_svc_period.cost", amount_expense);
            svcPeriodRecord.setValue("energy_bl_svc_period.demand", qty_power);
            svcPeriodRecord.setValue("energy_bl_svc_period.consumption", qty_energy);
            svcPeriodRecord.setValue("energy_bl_svc_period.num_days",
                Integer.parseInt(num_days.toString()));
            try {
                svcPeriodDS.saveRecord(svcPeriodRecord);
            } catch (final Throwable t) {
                log.error("Error inserting record: " + svcPeriodRecord.toString());
            }

            endDates = new ArrayList<Date>();
            startDates = new ArrayList<Date>();
            qtyEnergy = 0.0;
            qtyPower = 0.0;
            qtyVolume = 0.0;
            amtExpense = 0.0;
            count = 1;

            /*
             * Remove per Talisen for V.21.1
             *
             * }else{ addSvcPeriodVals(); }
             */

            currentBlId = bl_id;
            currentVnId = vn_id;
            currentVnAcId = vn_ac_id;
            currentBillId = bill_id;
            currentTimePeriod = time_period;
            currentBillType = bill_type_id;
        }
        populatePeriodOats();
    }

    /**
     * Deletes all records from the energy_bl_svc_period table
     */
    private static void deleteDailyServicePeriods() {
        final String SQL = "TRUNCATE table energy_bl_svc_period";
        SqlUtils.executeUpdate("energy_bl_svc_period", SQL);
    }

    /**
     * Fetches all the records from the bill_archive table
     */
    private static List<DataRecord> loadBillPeriods() {
        final String billTable = "bill_archive";
        final String[] billFields = { "date_service_end", "date_service_start", "time_period",
                "amount_expense", "amount_income", "qty_energy", "qty_power", "qty_volume",
                "bill_type_id", "vn_id", "vn_ac_id", "bill_id", "bl_id", "bill_type_id",
                "prorated_aggregated", "reference_bill_id" };
        final DataSource bill_ds =
                DataSourceFactory.createDataSourceForFields(billTable, billFields);
        bill_ds.addSort("time_period");
        bill_ds.addSort("bl_id");
        bill_ds.addSort("vn_id");
        bill_ds.addSort("vn_ac_id");
        bill_ds.addSort("bill_id");
        bill_ds.addSort("bill_type_id");
        // V23.1 add restriction to exclude source records for prorated/aggregated monthly bills
        final List<DataRecord> billRecords =
                bill_ds.getRecords("((bill_archive.prorated_aggregated = 'NO' "
                        + "AND bill_archive.reference_bill_id IS NULL "
                        + "AND NOT EXISTS (SELECT 1 FROM bill_archive b "
                        + "WHERE b.reference_bill_id = bill_archive.bill_id)) "
                        + "OR (bill_archive.prorated_aggregated <> 'NO'))");
        return billRecords;
    }

    /**
     * keeps track of values to sum up
     */
    private static void addSvcPeriodVals() {
        endDates.add(date_service_end);
        startDates.add(date_service_start);
        qtyEnergy += qty_energy;
        qtyPower += qty_power;
        qtyVolume += qty_volume;
        amtExpense += amount_expense;
        count = 2;
    }

    /**
     * Updates the period_oats from the energy_bl_svc_period table
     */
    private static void populatePeriodOats() {
        final String SQL =
                "" 
                        + "UPDATE energy_bl_svc_period " 
                        + "SET    energy_bl_svc_period.period_oat =  "
                        + "       ( SELECT                           "
                        + "               CASE                       "
                        + "                       WHEN COUNT(1) = 0  "
                        + "                       THEN -999          "
                        + "                       ELSE SUM(o.temp_outside_air) / COUNT(1) "
                        + "               END AS oat                 "
                        + "       FROM    weather_station_data o     "
                        + "               JOIN weather_station ws    "
                        + "               ON      ws.weather_station_id = o.weather_station_id "
                        + "               JOIN bl bl                  "
                        + "               ON      bl.weather_station_id = ws.weather_station_id "
                        + "               JOIN energy_bl_svc_period p "
                        + "               ON      p.bl_id          = bl.bl_id "
                        + "               AND     o.date_reported >= p.date_start "
                        + "               AND     o.date_reported  < p.date_end " //
                        + "       WHERE           p.vn_id            = energy_bl_svc_period.vn_id "
                        + "             AND       p.bill_id          = energy_bl_svc_period.bill_id "
                        + "             AND       p.vn_ac_id         = energy_bl_svc_period.vn_ac_id "
                        + "       )";

        SqlUtils.executeUpdate("energy_bl_svc_period", SQL);
    }
}
