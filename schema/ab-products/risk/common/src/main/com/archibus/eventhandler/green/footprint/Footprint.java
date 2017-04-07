package com.archibus.eventhandler.green.footprint;

import java.text.DecimalFormat;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.db.ViewField;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.green.GbConstants;
import com.archibus.jobmanager.JobStatus;

public class Footprint {
    
    /**
     * Job Status Message.
     */
    // @translatable
    private static String MESSAGE_CALCULATING_TOTALS = "Calculating totals...";
    
    /**
     * Job Status Message.
     */
    // @translatable
    private static String MESSAGE_SAVING_DATA = "Saving data...";
    
    /**
     * Building Code.
     */
    private String blId = null;
    
    /**
     * Scenario Id.
     */
    private String scenarioId = null;
    
    /**
     * Calculation year.
     */
    private int calcYear = 1800;
    
    /**
     * Constructor.
     * 
     * @param bl_id
     * @param calc_year
     * @param scenario_id
     */
    public Footprint(String bl_id, int calc_year, String scenario_id) {
        this.blId = bl_id;
        this.scenarioId = scenario_id;
        this.calcYear = calc_year;
    }
    
    /**
     * Summarize emissions for building code , year and scenario. Calculate totals from tables and
     * update/insert into gb_fp_totals table
     * <p>
     * Ex: s1_fuel_comb = (SELECT SUM(kg_co2) FROM gb_fp_s1_fuel_comb WHERE gb_fp_s1_fuel_comb.bl_id
     * = [bl_id] AND gb_fp_s1_fuel_comb.calc_year = [calc_year] AND gb_fp_s1_fuel_comb.scenario_id =
     * [scenario_id] ) * constant[kg_mt]
     * </p>
     * See specification for all queries
     * 
     * @param status job status
     */
    public void summarizeEmissions(JobStatus status) {
        
        // check if stop was requested
        if (status.isStopRequested()) {
            return;
        }
        
        status.setMessage(EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
            MESSAGE_CALCULATING_TOTALS, this.getClass().getName()));
        
        // get totals record
        String[] fields = { "bl_id", "calc_year", "s1_co_airc", "s1_co_road", "s1_fuel_comb",
                "s1_refrig_airc", "s2_purch_e", "s3_cont", "s3_em_air", "s3_em_rail", "s3_em_road",
                "s3_mat", "s3_outs", "s3_serv", "s3_waste_liq", "s3_waste_sol", "s_other",
                "scenario_id", "total", "total_s1_s2_s_other" };
        DataSource dsTotals = DataSourceFactory.createDataSourceForFields("gb_fp_totals", fields);
        dsTotals.addRestriction(Restrictions.and(
            Restrictions.eq("gb_fp_totals", "bl_id", this.blId),
            Restrictions.eq("gb_fp_totals", "calc_year", this.calcYear),
            Restrictions.eq("gb_fp_totals", "scenario_id", this.scenarioId)));
        // get current totals record
        DataRecord recordTotals = dsTotals.getRecord();
        // id don't exist create new record
        if (recordTotals == null) {
            recordTotals = dsTotals.createNewRecord();
        }
        
        status.setCurrentNumber(status.getCurrentNumber() + 2);
        
        // get total emissions
        double s1_fuel_comb = getTotalEmissionFromTable("gb_fp_s1_fuel_comb", "kg_co2",
            GbConstants.kg_mt, null);
        s1_fuel_comb = roundToNDecimals(s1_fuel_comb,
            recordTotals.findField("gb_fp_totals.s1_fuel_comb").getFieldDef());
        
        Clause customClause = Restrictions.eq("gb_fp_s1_s3_mobile", "scope_cat", "S1_COMPANY_ROAD");
        double s1_co_road = getTotalEmissionFromTable("gb_fp_s1_s3_mobile", "kg_co2",
            GbConstants.kg_mt, customClause);
        s1_co_road = roundToNDecimals(s1_co_road, recordTotals.findField("gb_fp_totals.s1_co_road")
            .getFieldDef());
        
        double s1_co_airc = getTotalEmissionFromTable("gb_fp_s1_co_airc", "kg_co2",
            GbConstants.kg_mt, null);
        s1_co_airc = roundToNDecimals(s1_co_airc, recordTotals.findField("gb_fp_totals.s1_co_airc")
            .getFieldDef());
        
        double s1_refrig_airc = getTotalEmissionFromTable("gb_fp_s1_refrig_ac", "kg_co2",
            GbConstants.kg_mt, null);
        s1_refrig_airc = roundToNDecimals(s1_refrig_airc,
            recordTotals.findField("gb_fp_totals.s1_refrig_airc").getFieldDef());
        
        status.setCurrentNumber(status.getCurrentNumber() + 2);
        
        double s2_purch_e = getTotalEmissionFromTable("gb_fp_s2_purch_e", "kg_co2",
            GbConstants.kg_mt, null);
        s2_purch_e = roundToNDecimals(s2_purch_e, recordTotals.findField("gb_fp_totals.s2_purch_e")
            .getFieldDef());
        
        double s3_waste_sol = getTotalEmissionFromTable("gb_fp_s3_waste_sol", "kg_co2",
            GbConstants.kg_mt, null);
        s3_waste_sol = roundToNDecimals(s3_waste_sol,
            recordTotals.findField("gb_fp_totals.s3_waste_sol").getFieldDef());
        
        double s3_waste_liq = getTotalEmissionFromTable("gb_fp_s3_waste_liq", "ch4_emiss", 1, null);
        s3_waste_liq = roundToNDecimals(s3_waste_liq,
            recordTotals.findField("gb_fp_totals.s3_waste_liq").getFieldDef());
        
        customClause = Restrictions.eq("gb_fp_s1_s3_mobile", "scope_cat", "S3_EMPLOYEE_ROAD");
        double s3_em_road = getTotalEmissionFromTable("gb_fp_s1_s3_mobile", "kg_co2",
            GbConstants.kg_mt, customClause);
        s3_em_road = roundToNDecimals(s3_em_road, recordTotals.findField("gb_fp_totals.s3_em_road")
            .getFieldDef());
        
        customClause = Restrictions.eq("gb_fp_s1_s3_mobile", "scope_cat", "S3_EMPLOYEE_RAIL");
        double s3_em_rail = getTotalEmissionFromTable("gb_fp_s1_s3_mobile", "kg_co2",
            GbConstants.kg_mt, customClause);
        s3_em_rail = roundToNDecimals(s3_em_rail, recordTotals.findField("gb_fp_totals.s3_em_rail")
            .getFieldDef());
        
        double s3_em_air = getTotalEmissionFromTable("gb_fp_s3_em_air", "kg_co2",
            GbConstants.kg_mt, null);
        s3_em_air = roundToNDecimals(s3_em_air, recordTotals.findField("gb_fp_totals.s3_em_air")
            .getFieldDef());
        
        double s3_mat = getTotalEmissionFromTable("gb_fp_s3_mat", "kg_co2", GbConstants.kg_mt, null);
        s3_mat = roundToNDecimals(s3_mat, recordTotals.findField("gb_fp_totals.s3_mat")
            .getFieldDef());
        
        customClause = Restrictions.eq("gb_fp_s1_s3_mobile", "scope_cat", "S3_CONTRACTOR_ROAD");
        double s3_cont = getTotalEmissionFromTable("gb_fp_s1_s3_mobile", "kg_co2",
            GbConstants.kg_mt, customClause);
        s3_cont = roundToNDecimals(s3_cont, recordTotals.findField("gb_fp_totals.s3_cont")
            .getFieldDef());
        
        double s3_outs = getTotalEmissionFromTable("gb_fp_s3_outs", "kg_co2", GbConstants.kg_mt,
            null);
        s3_outs = roundToNDecimals(s3_outs, recordTotals.findField("gb_fp_totals.s3_outs")
            .getFieldDef());
        
        double s3_serv = getTotalEmissionFromTable("gb_fp_s3_serv", "kg_co2", GbConstants.kg_mt,
            null);
        s3_serv = roundToNDecimals(s3_serv, recordTotals.findField("gb_fp_totals.s3_serv")
            .getFieldDef());
        
        double s_other = getTotalEmissionFromTable("gb_fp_s_other", "mt_co2", 1, null);
        s_other = roundToNDecimals(s_other, recordTotals.findField("gb_fp_totals.s_other")
            .getFieldDef());
        
        double total_s1_s2_s_other = s1_fuel_comb + s1_co_road + s1_co_airc + s1_refrig_airc
                + s2_purch_e + s_other;
        
        double total = total_s1_s2_s_other + s3_waste_sol + s3_waste_liq + s3_em_road + s3_em_rail
                + s3_em_air + s3_mat + s3_cont + s3_outs + s3_serv;
        
        // check if stop was requested
        if (status.isStopRequested()) {
            return;
        }
        
        status.setCurrentNumber(status.getCurrentNumber() + 2);
        
        status.setMessage(EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
            MESSAGE_SAVING_DATA, this.getClass().getName()));
        
        // set record values
        recordTotals.setValue("gb_fp_totals.bl_id", this.blId);
        recordTotals.setValue("gb_fp_totals.calc_year", this.calcYear);
        recordTotals.setValue("gb_fp_totals.scenario_id", this.scenarioId);
        recordTotals.setValue("gb_fp_totals.total", total);
        recordTotals.setValue("gb_fp_totals.total_s1_s2_s_other", total_s1_s2_s_other);
        recordTotals.setValue("gb_fp_totals.s1_co_airc", s1_co_airc);
        recordTotals.setValue("gb_fp_totals.s1_co_road", s1_co_road);
        recordTotals.setValue("gb_fp_totals.s1_fuel_comb", s1_fuel_comb);
        recordTotals.setValue("gb_fp_totals.s1_refrig_airc", s1_refrig_airc);
        recordTotals.setValue("gb_fp_totals.s2_purch_e", s2_purch_e);
        recordTotals.setValue("gb_fp_totals.s3_cont", s3_cont);
        recordTotals.setValue("gb_fp_totals.s3_em_air", s3_em_air);
        recordTotals.setValue("gb_fp_totals.s3_em_rail", s3_em_rail);
        recordTotals.setValue("gb_fp_totals.s3_em_road", s3_em_road);
        recordTotals.setValue("gb_fp_totals.s3_mat", s3_mat);
        recordTotals.setValue("gb_fp_totals.s3_outs", s3_outs);
        recordTotals.setValue("gb_fp_totals.s3_serv", s3_serv);
        recordTotals.setValue("gb_fp_totals.s3_waste_liq", s3_waste_liq);
        recordTotals.setValue("gb_fp_totals.s3_waste_sol", s3_waste_sol);
        recordTotals.setValue("gb_fp_totals.s_other", s_other);
        
        // save record to database
        dsTotals.saveRecord(recordTotals);
        
        status.setCurrentNumber(status.getCurrentNumber() + 4);
    }
    
    /**
     * Calculate emissions for specified source.
     * 
     * @param status
     */
    public void calculateEmissions(JobStatus status) {
        // check if stop was requested
        if (status.isStopRequested()) {
            return;
        }
        FootprintScope1 footPrintScope1 = new FootprintScope1();
        FootprintScope2 footprintScope2 = new FootprintScope2();
        FootprintScope3 footprintScope3 = new FootprintScope3();
        
        JobStatus fakeStatus = new JobStatus();
        
        footPrintScope1.calculateScope1FuelCombustion(this.blId, this.calcYear, this.scenarioId, 0,
            fakeStatus);
        footPrintScope1.calculateScope1Scope3Mobile(this.blId, this.calcYear, this.scenarioId, 0,
            "S1_COMPANY_ROAD", fakeStatus);
        footPrintScope1.calculateScope1CompanyOwnedAircraft(this.blId, this.calcYear,
            this.scenarioId, 0, fakeStatus);
        footPrintScope1.calculateScope1RefrigerantAC(this.blId, this.calcYear, this.scenarioId, 0,
            fakeStatus);
        
        footprintScope2.calculateScope2PurchasedElectricity(this.blId, this.calcYear,
            this.scenarioId, 0, fakeStatus);
        footprintScope3.calculateScope3WasteSolid(this.blId, this.calcYear, this.scenarioId, 0,
            fakeStatus);
        footprintScope3.calculateScope3WasteLiquid(this.blId, this.calcYear, this.scenarioId, 0,
            fakeStatus);
        
        footPrintScope1.calculateScope1Scope3Mobile(this.blId, this.calcYear, this.scenarioId, 0,
            "S3_EMPLOYEE_ROAD", fakeStatus);
        footPrintScope1.calculateScope1Scope3Mobile(this.blId, this.calcYear, this.scenarioId, 0,
            "S3_EMPLOYEE_RAIL", fakeStatus);
        footprintScope3.calculateScope3EmployeeAircraft(this.blId, this.calcYear, this.scenarioId,
            0, fakeStatus);
        footprintScope3.calculateScope3PurchasedMaterials(this.blId, this.calcYear,
            this.scenarioId, 0, fakeStatus);
        footPrintScope1.calculateScope1Scope3Mobile(this.blId, this.calcYear, this.scenarioId, 0,
            "S3_CONTRACTOR_ROAD", fakeStatus);
        
        footprintScope3.calculateScope3Outsourced(this.blId, this.calcYear, this.scenarioId, 0,
            fakeStatus);
        footprintScope3.calculateScope3OffSiteServers(this.blId, this.calcYear, this.scenarioId, 0,
            fakeStatus);
        summarizeEmissions(fakeStatus);
        
    }
    
    // ----------------- Private Methods --------------------
    
    /**
     * Calculate total emissions from table.
     * 
     * @param table: table name
     * @param field: emission field
     * @param factor: conversion factor
     * @param customClause: custom clause, is not exist send null
     * @return total emissions
     */
    private double getTotalEmissionFromTable(String table, String field, double factor,
            Clause customClause) {
        
        DataSourceGroupingImpl dsSumm = new DataSourceGroupingImpl();
        dsSumm.addTable(table);
        dsSumm.addGroupByField(table, "bl_id", DataSource.DATA_TYPE_TEXT);
        dsSumm.addGroupByField(table, "calc_year", DataSource.DATA_TYPE_INTEGER);
        dsSumm.addGroupByField(table, "scenario_id", DataSource.DATA_TYPE_TEXT);
        dsSumm.addCalculatedField(table, field + "_total", DataSource.DATA_TYPE_NUMBER,
            DataSourceGroupingImpl.FORMULA_SUM, table + "." + field);
        
        dsSumm.addRestriction(Restrictions.and(Restrictions.eq(table, "bl_id", this.blId),
            Restrictions.eq(table, "calc_year", this.calcYear),
            Restrictions.eq(table, "scenario_id", this.scenarioId)));
        
        if (customClause != null) {
            dsSumm.addRestriction(customClause);
        }
        
        DataRecord record = dsSumm.getRecord();
        double result = 0.0;
        if (record != null) {
            result = record.getDouble(table + "." + field + "_total") * factor;
        }
        return (result);
    }
    
    /**
     * Format double to specified number of decimals.
     * 
     * @param input
     * @param decimals
     * @return
     */
    private double roundToNDecimals(double input, int decimals) {
        String pattern = "#.";
        for (int i = 0; i < decimals - 1; i++) {
            pattern += "#";
        }
        DecimalFormat formatter = new DecimalFormat(pattern);
        
        return Double.valueOf(formatter.format(input));
        
    }
    
    /**
     * Format double to specified number of decimals.
     * 
     * @param input
     * @param fieldDef
     * @return
     */
    private double roundToNDecimals(double input, ViewField.Immutable fieldDef) {
        Double dblValue = Double.valueOf(input);
        String strValue = fieldDef.formatFieldValue(dblValue);
        dblValue = (Double) fieldDef.parseFieldValue(strValue);
        return dblValue.doubleValue();
        
    }
    
    /**
     * Copies footprint sources records from the current footprint to the given footprint
     * 
     * @param destBl_id
     * @param destCalc_year
     * @param destScenario_id
     * @param setEmissionsZero true if the consumptions and emissions should be set to zero, false
     *            otherwise
     */
    public void copyFootprintSources(String destBl_id, int destCalc_year, String destScenario_id,
            boolean setEmissionsZero) {
        
        String sqlInsert = "INSERT INTO tableName (bl_id, calc_year, scenario_id, ";
        String sqlSelect = ") SELECT '" + SqlUtils.makeLiteralOrBlank(destBl_id) + "', "
                + destCalc_year + ", '" + SqlUtils.makeLiteralOrBlank(destScenario_id) + "', ";
        String sqlFrom = " FROM tableName";
        String sqlWhere = " WHERE bl_id = '" + SqlUtils.makeLiteralOrBlank(this.blId)
                + "' AND calc_year = " + this.calcYear + " AND scenario_id = '"
                + SqlUtils.makeLiteralOrBlank(this.scenarioId) + "'";
        
        /****** Scope1 Stationary Fuel Combustion ************************/
        String tableName = "gb_fp_s1_fuel_comb";
        String insertFields = "tech_base_code, source_name, sector_name, oxid_factor_val, kg_co2, fuel_units_type, fuel_units, fuel_name, tech_mode, fuel_mode, fuel_base_code, emiss_factor_n2o_val, emiss_factor_n2o_entry, emiss_factor_ch4_val, emiss_factor_ch4_entry, ch4_n2o_units_type, fuel_consumed_entry, ch4_n2o_units, fuel_consumed, technology";
        String selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("fuel_consumed_entry", "0")
                .replace("fuel_consumed", "0").replace("kg_co2", "0");
        }
        String sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope1 Company-Owned Transportation (Road) ***************/
        tableName = "gb_fp_s1_s3_mobile";
        insertFields = "distance, distance_entry, kg_co2, scope_cat, units, units_type, vehicle_type";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("distance_entry", "0").replace("distance", "0")
                .replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName)
                + sqlWhere.concat(" AND scope_cat = 'S1_COMPANY_ROAD'");
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope1 Company-Owned Transportation (Air) ***************/
        tableName = "gb_fp_s1_co_airc";
        insertFields = "aircraft_type, hours, kg_co2";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("hours", "0").replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope1 Refrigerant and Air Conditioning ***************/
        tableName = "gb_fp_s1_refrig_ac";
        insertFields = "kg_co2, refrig_ac_count, refrig_ac_type, refrigerant_type";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("refrig_ac_count", "0").replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope2 Purchased Electricity, Heat and Steam ***************/
        tableName = "gb_fp_s2_purch_e";
        insertFields = "consumption, consumption_entry, kg_co2, units, units_type";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("consumption_entry", "0")
                .replace("consumption", "0").replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope3 Wastes (Solid) ***************/
        tableName = "gb_fp_s3_waste_sol";
        insertFields = "amount_disposed, amount_disposed_entry, amount_recycled, amount_recycled_entry, kg_co2, units, units_type, waste_name";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("amount_disposed_entry", "0")
                .replace("amount_disposed", "0").replace("amount_recycled_entry", "0")
                .replace("amount_recycled", "0").replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope3 Wastes (Liquid) ***************/
        tableName = "gb_fp_s3_waste_liq";
        insertFields = "ch4_emiss, mtce_ch4, qty_treated, qty_treated_entry, treatment_id, units, units_type";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("qty_treated_entry", "0")
                .replace("qty_treated", "0").replace("ch4_emiss", "0").replace("mtce_ch4", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope3 Employee Transportation (Road) ***************/
        tableName = "gb_fp_s1_s3_mobile";
        insertFields = "distance, distance_entry, kg_co2, scope_cat, units, units_type, vehicle_type";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("distance_entry", "0").replace("distance", "0")
                .replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName)
                + sqlWhere.concat(" AND scope_cat = 'S3_EMPLOYEE_ROAD'");
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope3 Employee Transportation (Rail) ***************/
        tableName = "gb_fp_s1_s3_mobile";
        insertFields = "distance, distance_entry, kg_co2, scope_cat, units, units_type, vehicle_type";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("distance_entry", "0").replace("distance", "0")
                .replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName)
                + sqlWhere.concat(" AND scope_cat = 'S3_EMPLOYEE_RAIL'");
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope3 Employee Transportation (Air) ***************/
        tableName = "gb_fp_s3_em_air";
        insertFields = "kg_co2, distance, distance_entry, distance_type, seating_type, units, units_type";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("distance_entry", "0").replace("distance,", "0,")
                .replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope3 Purchased Materials ***************/
        tableName = "gb_fp_s3_mat";
        insertFields = "amount_purchased, amount_purchased_entry, kg_co2, recycled_content, units, units_type, waste_name";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("amount_purchased_entry", "0")
                .replace("amount_purchased", "0").replace("recycled_content", "0")
                .replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope3 Contractor-Owned Vehicles ***************/
        tableName = "gb_fp_s1_s3_mobile";
        insertFields = "distance, distance_entry, kg_co2, scope_cat, units, units_type, vehicle_type";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("distance_entry", "0").replace("distance", "0")
                .replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName)
                + sqlWhere.concat(" AND scope_cat = 'S3_CONTRACTOR_ROAD'");
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope3 Outsourced Activities ***************/
        tableName = "gb_fp_s3_outs";
        insertFields = "description, kg_co2, num_copies";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("num_copies", "0").replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** Scope3 Off-Site Servers ***************/
        tableName = "gb_fp_s3_serv";
        insertFields = "consumption, consumption_entry, description, kg_co2, units, units_type";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("consumption_entry", "0")
                .replace("consumption", "0").replace("kg_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        /****** ScopeOther ***************/
        tableName = "gb_fp_s_other";
        insertFields = "mt_co2, source_name";
        selectFields = new String(insertFields);
        
        // set to zero the consumption and the emissions
        if (setEmissionsZero) {
            selectFields = selectFields.replace("mt_co2", "0");
        }
        sqlQuery = sqlInsert.replace("tableName", tableName) + insertFields + sqlSelect
                + selectFields + sqlFrom.replace("tableName", tableName) + sqlWhere;
        
        SqlUtils.executeUpdate(tableName, sqlQuery);
        
        SqlUtils.commit();
    }
    
}
