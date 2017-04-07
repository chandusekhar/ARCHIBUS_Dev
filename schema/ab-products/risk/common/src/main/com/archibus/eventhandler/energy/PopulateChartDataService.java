package com.archibus.eventhandler.energy;

import org.apache.log4j.Logger;

import com.archibus.datasource.SqlUtils;

/**
 * PopulateChartData - Once all nightly calculation are performed, this class distributes all
 * updated values on the tables used for reporting
 *
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 *
 * 23.1 Revision to support multiple bills per building per bill type per month
 * @editor Eric Maxfield
 */
public class PopulateChartDataService {

    /**
     * Logger to write messages to archibus.log.
     */
    private final static Logger log = Logger.getLogger(PopulateChartDataService.class);

    /**
     * Invokes all sql statements that populate the Energy Chart Point table
     */
    public static boolean run() {
        if (log.isDebugEnabled()) {
            log.info("PopulateChartData");
        }
        deleteChartPoints();
        populateRegressionChartOat();
        populateRegressionChartConsumption();
        populateRegressionChartDemand();
        populateElectricChartPoints();
        populateGasChartPoints();

        return true;
    }

    /**
     * Deletes all contents of the energy_chart_point
     */
    protected static void deleteChartPoints() {
        final String SQL = "TRUNCATE TABLE energy_chart_point";
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }

    /**
     * Inserts el_oat and gas_oat record types into energy_chart_point
     */
    protected static void populateRegressionChartOat() {
        final String SQL =
                "" + "INSERT " + "INTO   energy_chart_point "
                        + "       ( "
                        + "              bl_id       , "
                        + "              vn_id       , "
                        + "              vn_ac_id    , "
                        + "              bill_id     , "
                        + "              value_name  , "
                        + "              time_period , "
                        + "              VALUE       , "
                        + "              outlier "
                        + "       ) "
                        + "SELECT px.* "
                        + "FROM   (SELECT p.bl_id , "
                        + "              p.vn_id       , "
                        + "              p.vn_ac_id    , "
                        + "              p.bill_id     , "
                        + "               CASE "
                        + "                       WHEN lower(p.bill_type_id) = 'electric' "
                        + "                       THEN 'el_oat' "
                        + "                       ELSE 'gas_oat' "
                        + "               END AS value_name , "
                        + "               p.time_period     , "
                        + "               AVG(p.period_oat) AS VALUE     , "
                        + "               0 AS outlier "
                        + "       FROM    energy_bl_svc_period p "
                        + "       WHERE   p.period_oat IS NOT NULL "
                        + "       AND     LOWER(p.bill_type_id) IN ('electric', "
                        + "                                         'gas - natural') "
                        + "       GROUP BY p.bl_id, p.vn_id, p.vn_ac_id, p.bill_id, p.time_period, p.bill_type_id "
                        + "       ) "
                        + "       px "
                        + "WHERE  NOT EXISTS "
                        + "       (SELECT 1 "
                        + "       FROM    energy_chart_point ecp "
                        + "       WHERE   ecp.bl_id             = px.bl_id "
                        + "       AND     ecp.vn_id             = px.vn_id "
                        + "       AND     ecp.vn_ac_id          = px.vn_ac_id "
                        + "       AND     ecp.bill_id           = px.bill_id "
                        + "       AND     ecp.time_period       = px.time_period "
                        + "       AND     LOWER(ecp.value_name) = LOWER(px.value_name) "
                        + "       )";

        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }

    /**
     * Inserts Consumption records into energy_chart_point
     */
    protected static void populateRegressionChartConsumption() {
        final String SQL =
                "" + "INSERT "
                        + "INTO   energy_chart_point "
                        + "       ( "
                        + "              bl_id       , "
                        + "              vn_id       , "
                        + "              vn_ac_id    , "
                        + "              bill_id     , "
                        + "              value_name  , "
                        + "              time_period , "
                        + "              VALUE       , "
                        + "              outlier "
                        + "       ) "
                        + "SELECT px.* "
                        + "FROM   (SELECT p.bl_id , "
                        + "              p.vn_id       , "
                        + "              p.vn_ac_id    , "
                        + "              p.bill_id     , "
                        + "               CASE "
                        + "                       WHEN LOWER(p.bill_type_id) = 'electric' "
                        + "                       THEN 'el_actual_rate' "
                        + "                       ELSE 'gas_actual_rate' "
                        + "               END AS value_name                   , "
                        + "               p.time_period                       , "
                        + "               SUM(p.consumption / p.num_days) AS VALUE , "
                        + "               MAX(p.outlier_consumption) AS outlier_consumption"
                        + "       FROM    energy_bl_svc_period p "
                        + "       WHERE   p.num_days > 0 "
                        + "       AND     LOWER(p.bill_type_id) IN ('electric', "
                        + "                                         'gas - natural') "
                        + "       AND     p.consumption IS NOT NULL "
                        + "       GROUP BY p.bl_id, p.vn_id, p.vn_ac_id, p.bill_id, p.time_period, p.bill_type_id "
                        + "       ) "
                        + "       px "
                        + "WHERE  NOT EXISTS "
                        + "       (SELECT 1 "
                        + "       FROM    energy_chart_point ecp "
                        + "       WHERE   ecp.bl_id             = px.bl_id "
                        + "       AND     ecp.vn_id             = px.vn_id "
                        + "       AND     ecp.vn_ac_id          = px.vn_ac_id "
                        + "       AND     ecp.bill_id           = px.bill_id "
                        + "       AND     ecp.time_period       = px.time_period "
                        + "       AND     LOWER(ecp.value_name) = LOWER(px.value_name) "
                        + "       )";
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }

    /**
     * Inserts Demand records into energy_chart_point
     */
    protected static void populateRegressionChartDemand() {
        final String SQL =
                "" + " INSERT " + " INTO   energy_chart_point "
                        + "        ( "
                        + "               bl_id       , "
                        + "               vn_id       , "
                        + "               vn_ac_id    , "
                        + "               bill_id     , "
                        + "               value_name  , "
                        + "               time_period , "
                        + "               VALUE       , "
                        + "               outlier "
                        + "        ) "
                        + " SELECT p.bl_id        , "
                        + "        p.vn_id        , "
                        + "        p.vn_ac_id     , "
                        + "        p.bill_id      , "
                        + "        'el_actual_kw' , "
                        + "        p.time_period  , "
                        + "        SUM(p.demand) AS demand , "
                        + "        MAX(p.outlier_demand) AS outlier "
                        + " FROM   energy_bl_svc_period p "
                        + " WHERE  p.num_days         > 0 "
                        + " AND    lower(p.bill_type_id) = 'electric' "
                        + " AND    p.demand IS NOT NULL"
                        + " GROUP BY p.bl_id, p.vn_id, p.vn_ac_id, p.bill_id, p.time_period";
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }

    /**
     * Inserts Electric records into energy_chart_point
     */
    protected static void populateElectricChartPoints() {
        final String SQL =
                ""
                        + "INSERT "
                        + "INTO   energy_chart_point "
                        + "       ( "
                        + "              bl_id       , "
                        + "              vn_id       , "
                        + "              vn_ac_id    , "
                        + "              bill_id    , "
                        + "              value_name  , "
                        + "              time_period , "
                        + "              VALUE       , "
                        + "              outlier "
                        + "       ) "
                        + "SELECT p.bl_id                 , "
                        + "       p.vn_id                 , "
                        + "       p.vn_ac_id              , "
                        + "       p.bill_id               , "
                        + "       'el_actual_consumption' , "
                        + "       p.time_period           , "
                        + "       p.consumption AS VALUE    , "
                        + "       p.outlier_consumption AS outlier  "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) = 'electric' "
                        + "AND    p.consumption IS NOT NULL "
                        + " "
                        + "UNION ALL "
                        + " "
                        + "SELECT p.bl_id            , "
                        + "       p.vn_id            , "
                        + "       p.vn_ac_id         , "
                        + "       p.bill_id          , "
                        + "       'el_actual_demand' , "
                        + "       p.time_period      , "
                        + "       p.demand AS VALUE , "
                        + "       p.outlier_demand AS outlier "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) = 'electric' "
                        + "AND    p.demand IS NOT NULL "
                        + " "
                        + "UNION ALL "
                        + "SELECT p.bl_id             , "
                        + "       p.vn_id             , "
                        + "       p.vn_ac_id          , "
                        + "       p.bill_id           , "
                        + "       'el_billing_demand' , "
                        + "       p.time_period       , "
                        + "       1  AS VALUE         , "
                        + "       p.outlier_consumption "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) = 'electric' "
                        + " "
                        + "UNION ALL "
                        + " "
                        + "SELECT p.bl_id          , "
                        + "       p.vn_id          , "
                        + "       p.vn_ac_id       , "
                        + "       p.bill_id        , "
                        + "       'el_load_factor' , "
                        + "       p.time_period    , "
                        + "        CASE "
                        + "              WHEN "
                        + "                     ( "
                        + "                            p.demand   > 0.0 "
                        + "                     AND    p.num_days > 0 "
                        + "                     ) "
                        + "              THEN p.consumption / 0.003412 / p.demand / p.num_days / 24 * 100"
                        + "              ELSE 0 "
                        + "       END   AS VALUE , "
                        + "       p.outlier_consumption AS outlier "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) = 'electric' "
                        + " "
                        + "UNION ALL "
                        + " "
                        + "SELECT p.bl_id       , "
                        + "       p.vn_id       , "
                        + "       p.vn_ac_id    , "
                        + "       p.bill_id     , "
                        + "       'el_cost'     , "
                        + "       p.time_period , "
                        + "       p.COST AS VALUE     , "
                        + "       p.outlier_consumption AS outlier "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) = 'electric' "
                        + "AND    p.COST IS NOT NULL "
                        + " "
                        + "UNION ALL "
                        + " "
                        + "SELECT p.bl_id       , "
                        + "       p.vn_id       , "
                        + "       p.vn_ac_id    , "
                        + "       p.bill_id     , "
                        + "       'el_num_days' , "
                        + "       p.time_period , "
                        + "       p.num_days     , "
                        + "       p.outlier_consumption AS outlier "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) = 'electric' "
                        + " "
                        + "UNION ALL "
                        + " "
                        + "SELECT p.bl_id       , "
                        + "       p.vn_id       , "
                        + "       p.vn_ac_id    , "
                        + "       p.bill_id     , "
                        + "       'cdd'         , "
                        + "       p.time_period , "
                        + "       p.period_cdd  , "
                        + "       p.outlier_consumption "
                        + "FROM   energy_bl_svc_period p , "
                        + "       bl s "
                        + "WHERE  p.bl_id                = s.bl_id "
                        + "AND    p.bill_type_id         = s.utility_type_cool "
                        + "AND    p.period_cdd IS NOT NULL "
                        + " "
                        + "UNION ALL "
                        + " "
                        + "SELECT p.bl_id       , "
                        + "       p.vn_id       , "
                        + "       p.vn_ac_id    , "
                        + "       p.bill_id     , "
                        + "       'hdd'         , "
                        + "       p.time_period , "
                        + "       p.period_hdd  , "
                        + "       p.outlier_consumption "
                        + "FROM   energy_bl_svc_period p , "
                        + "       bl s "
                        + "WHERE  p.bl_id                = s.bl_id "
                        + "AND    p.bill_type_id         = s.utility_type_heat "
                        + "AND    p.period_hdd IS NOT NULL "
                        + " "
                        + "UNION ALL "
                        + " "
                        + "SELECT p.bl_id       , "
                        + "       p.vn_id       , "
                        + "       p.vn_ac_id    , "
                        + "       p.bill_id     , "
                        + "       'el_rate'     , "
                        + "       p.time_period , "
                        + "       CASE "
                        + "              WHEN p.consumption > 0.0 "
                        + "              THEN p.COST / p.consumption "
                        + "              ELSE 0.0 "
                        + "       END   AS VALUE  , "
                        + "       p.outlier_consumption "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) = 'electric'";

        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }

    /**
     * Inserts Gas records into energy_chart_point
     */
    protected static void populateGasChartPoints() {
        final String SQL =
                "" + "INSERT " + "INTO   energy_chart_point "
                        + "       ( "
                        + "              bl_id       , "
                        + "              vn_id     , "
                        + "              vn_ac_id  , "
                        + "              bill_id   , "
                        + "              value_name  , "
                        + "              time_period , "
                        + "              VALUE       , "
                        + "              outlier "
                        + "       ) "
                        + "SELECT p.bl_id                  , "
                        + "       p.vn_id                  , "
                        + "       p.vn_ac_id               , "
                        + "       p.bill_id                , "
                        + "       CASE lower(p.bill_type_id) "
                        + "          WHEN 'gas - natural' THEN 'gas_actual_consumption' "
                        + "          WHEN 'gas - propane' THEN 'propane_actual_consumption' "
                        + "          WHEN 'fuel oil 1' THEN 'fuel_oil_1_actual_consumption' "
                        + "          WHEN 'fuel oil 2' THEN 'fuel_oil_2_actual_consumption' "
                        + "       END , "
                        + "       p.time_period            , "
                        + "       p.consumption            , "
                        + "       p.outlier_consumption "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) IN ('gas - natural','gas - propane','fuel oil 1','fuel oil 2') "
                        + "AND    p.consumption IS NOT NULL "
                        + " "
                        + "UNION ALL "
                        + " "
                        + "SELECT p.bl_id       , "
                        + "       p.vn_id       , "
                        + "       p.vn_ac_id    , "
                        + "       p.bill_id     , "
                        + "       CASE lower(p.bill_type_id) "
                        + "          WHEN 'gas - natural' THEN 'gas_cost' "
                        + "          WHEN 'gas - propane' THEN 'propane_cost' "
                        + "          WHEN 'fuel oil 1' THEN 'fuel_oil_1_cost' "
                        + "          WHEN 'fuel oil 2' THEN 'fuel_oil_2_cost' "
                        + "       END , "
                        + "       p.time_period , "
                        + "       p.COST        , "
                        + "       p.outlier_consumption "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) IN ('gas - natural','gas - propane','fuel oil 1','fuel oil 2') "
                        + "AND    p.COST IS NOT NULL "
                        + " "
                        + "UNION ALL " + " "
                        + "SELECT p.bl_id        , "
                        + "       p.vn_id       , "
                        + "       p.vn_ac_id    , "
                        + "       p.bill_id     , "
                        + "       CASE lower(p.bill_type_id) "
                        + "          WHEN 'gas - natural' THEN 'gas_num_days' "
                        + "          WHEN 'gas - propane' THEN 'propane_num_days' "
                        + "          WHEN 'fuel oil 1' THEN 'fuel_oil_1_num_days' "
                        + "          WHEN 'fuel oil 2' THEN 'fuel_oil_2_num_days' "
                        + "       END , "
                        + "       p.time_period  , "
                        + "       p.num_days     , "
                        + "       p.outlier_consumption "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) IN ('gas - natural','gas - propane','fuel oil 1','fuel oil 2') "
                        + " "
                        + "UNION ALL "
                        + " "
                        + "SELECT p.bl_id       , "
                        + "       p.vn_id       , "
                        + "       p.vn_ac_id    , "
                        + "       p.bill_id     , "
                        + "       CASE lower(p.bill_type_id) "
                        + "          WHEN 'gas - natural' THEN 'gas_rate' "
                        + "          WHEN 'gas - propane' THEN 'propane_rate' "
                        + "          WHEN 'fuel oil 1' THEN 'fuel_oil_1_rate' "
                        + "          WHEN 'fuel oil 2' THEN 'fuel_oil_2_rate' "
                        + "       END , "
                        + "       p.time_period , "
                        + "       CASE "
                        + "              WHEN p.consumption > 0.0 "
                        + "              THEN p.COST / p.consumption "
                        + "              ELSE 0.0 "
                        + "       END , "
                        + "       p.outlier_consumption "
                        + "FROM   energy_bl_svc_period p "
                        + "WHERE  lower(p.bill_type_id) IN ('gas - natural','gas - propane','fuel oil 1','fuel oil 2') ";
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }
}
