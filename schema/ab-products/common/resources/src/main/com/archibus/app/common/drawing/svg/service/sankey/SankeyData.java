package com.archibus.app.common.drawing.svg.service.sankey;

import java.util.Map;

import org.json.*;

import com.archibus.datasource.DataStatistics;

/**
 * Sankey Data Prototyping.
 * 
 * 
 * @author Yong
 * @author Emily
 * @since 21.3
 * 
 */

public class SankeyData {
    /**
     * afm_metric_trend_values table.
     */
    private static final String AFM_METRIC_TREND_VALUES = "afm_metric_trend_values";
    
    /**
     * metric_value field.
     */
    private static final String METRIC_VALUE = "metric_value";
    
    /**
     * Sum.
     */
    private static final String SUM = "sum";
    
    /**
     * Constant to avoid magic number.
     */
    private static final int THREE = 3;
    
    /**
     * Constant to avoid magic number.
     */
    private static final int FOUR = 4;
    
    /**
     * Get Sankey Data.
     * 
     * @param parameters Map.
     * @return data.toString() String
     */
    public String getSankeyData(final Map<String, String> parameters) {
        final JSONObject data = new JSONObject();
        
        final String blId = parameters.get("BL_ID");
        final String date = parameters.get("METRIC_DATE");
        
        // Incoming Electric Consumption 55.0
        final Double electricity = getElectricity(blId, date);
        
        // Incoming Gas Consumption 33.5
        final Double gas = getGas(blId, date);
        
        // getDriveEnergy(blId, date);
        
        // Lighting
        final Double lighting = getLighting(blId, date);
        // getNetHeating(blId, date);
        
        // Energy Provided 88.5 Gas + Electricity
        // getEnergyProvided(blId, date);
        
        data.put("nodes", getNodes());
        
        // Energy Consumed 35.0 Lighting + Drive Energy
        final Double energyConsumed = getEnergyConsumed(blId, date);
        
        // add database values to links
        data.put("links", getLinks(electricity, gas, lighting, energyConsumed));
        
        return data.toString();
    }
    
    /**
     * Gets nodes.
     * 
     * @return JSONArray.
     */
    private JSONArray getNodes() {
        final JSONArray nodes = new JSONArray();
        nodes.put(createNodeJSONObject("Electricity"));
        nodes.put(createNodeJSONObject("Heating"));
        nodes.put(createNodeJSONObject("Drive Energy"));
        nodes.put(createNodeJSONObject("Gas"));
        nodes.put(createNodeJSONObject("Lighting"));
        
        return nodes;
    }
    
    /**
     * Gets links.
     * 
     * @param electricity Double.
     * @param gas Double.
     * @param lighting Double.
     * @param energyConsumed Double.
     * @return JSONArray.
     */
    private JSONArray getLinks(final Double electricity, final Double gas, final Double lighting,
            final Double energyConsumed) {
        final JSONArray links = new JSONArray();
        
        // 20
        links.put(createLinkJSONObject(0, 1, electricity - energyConsumed));
        
        links.put(createLinkJSONObject(0, FOUR, electricity - lighting));
        links.put(createLinkJSONObject(0, 2, energyConsumed - (electricity - lighting)));
        
        // 33.5
        links.put(createLinkJSONObject(THREE, 1, gas));
        
        /*
         * links.put(createLinkJSONObject(0, 1, 20)); links.put(createLinkJSONObject(0, 4, 20));
         * links.put(createLinkJSONObject(0, 2, 15)); links.put(createLinkJSONObject(3, 1, gas));
         */
        
        /*
         * System.out.println("electricity ---->" + electricity);
         * System.out.println("gas         ---->" + gas); System.out.println("driveEnergy ---->" +
         * driveEnergy); System.out.println("lighting    ---->" + lighting);
         * System.out.println("heating     ---->" + heating);
         */
        return links;
    }
    
    /**
     * Create a json object for node.
     * 
     * @param name String
     * @return JSONObject
     */
    private JSONObject createNodeJSONObject(final String name) {
        final JSONObject jsonObj = new JSONObject();
        jsonObj.put("name", name);
        return jsonObj;
    }
    
    /**
     * Create a json object for links.
     * 
     * @param source String
     * @param target String
     * @param value Number
     * @return JSONObject
     */
    private JSONObject createLinkJSONObject(final Integer source, final Integer target,
            final Number value) {
        final JSONObject jsonObj = new JSONObject();
        jsonObj.put("source", source);
        jsonObj.put("target", target);
        jsonObj.put("value", value);
        return jsonObj;
    }
    
    /**
     * Calculate electricity.
     * 
     * @param blId String building id
     * @param date String Date
     * @return Double
     */
    public Double getElectricity(final String blId, final String date) {
        final String restriction =
                "metric_name = 'aips_Electricity_Consumption'" + getMetricDateClause(date);
        
        return getStatistic(AFM_METRIC_TREND_VALUES, METRIC_VALUE, SUM, restriction);
    }
    
    /**
     * Calculate gas.
     * 
     * @param blId String building id
     * @param date String Date
     * @return Double
     */
    public Double getGas(final String blId, final String date) {
        final String restriction =
                "metric_name = 'aips_Gas_Consumption'" + getMetricDateClause(date);
        
        return getStatistic(AFM_METRIC_TREND_VALUES, METRIC_VALUE, SUM, restriction);
    }
    
    /**
     * Calculate drive energy.
     * 
     * @param blId String building id
     * @param date String Date
     * @return Double
     */
    public Double getDriveEnergy(final String blId, final String date) {
        String restriction =
                "metric_name = 'aips_Equipment Electricity_Consumption'"
                        + getMetricDateClause(date);
        restriction += getCollectClause(blId);
        
        return getStatistic(AFM_METRIC_TREND_VALUES, METRIC_VALUE, SUM, restriction);
    }
    
    /**
     * Calculate lighting.
     * 
     * @param blId String building id
     * @param date String Date
     * @return Double
     */
    public Double getLighting(final String blId, final String date) {
        String restriction =
                "metric_name = 'aips_Room_Electricity_Consumption'" + getMetricDateClause(date);
        restriction +=
                " AND collect_group_by = 'bl_id;fl_id;rm_id' AND collect_by_value LIKE'" + blId
                        + "%'";
        
        return getStatistic(AFM_METRIC_TREND_VALUES, METRIC_VALUE, SUM, restriction);
    }
    
    /**
     * Calculate heading provided.
     * 
     * @param blId String building id
     * @param date String Date
     * @return Double
     */
    public Double getEnergyProvided(final String blId, final String date) {
        // in
        String restriction =
                "metric_name IN ('aips_Gas_Consumption', 'aips_Electricity_Consumption')"
                        + getMetricDateClause(date);
        restriction += getCollectClause(blId);
        
        return getStatistic(AFM_METRIC_TREND_VALUES, METRIC_VALUE, SUM, restriction);
    }
    
    /**
     * Calculate heating consumed.
     * 
     * @param blId String building id
     * @param date String Date
     * @return Double
     */
    public Double getEnergyConsumed(final String blId, final String date) {
        // in
        String restriction =
                "metric_name IN ('aips_Room_Electricity_Consumption', 'aips_Equipment_Electricity_Consumption')"
                        + getMetricDateClause(date);
        restriction += getCollectClause(blId);
        
        return getStatistic(AFM_METRIC_TREND_VALUES, METRIC_VALUE, SUM, restriction);
    }
    
    /**
     * Calculate Net Heating ("Heating").
     * 
     * @param blId String building id
     * @param date String Date
     * @return Double
     */
    public Double getNetHeating(final String blId, final String date) {
        // in
        String restriction1 =
                "metric_name IN ('aips_Gas_Consumption', 'aips_Electricity_Consumption' )"
                        + getMetricDateClause(date);
        restriction1 += getCollectClause(blId);
        
        String restriction2 =
                "metric_name IN ('aips_Room_Electricity_Consumption', 'aips_Equipment_Electricity_Consumption' )"
                        + getMetricDateClause(date);
        restriction2 += getCollectClause(blId);
        
        return getStatistic(AFM_METRIC_TREND_VALUES, METRIC_VALUE, SUM, restriction1)
                - getStatistic(AFM_METRIC_TREND_VALUES, METRIC_VALUE, SUM, restriction2);
    }
    
    /**
     * Create clause for metric date.
     * 
     * @param date String
     * @return String
     */
    private String getMetricDateClause(final String date) {
        return " AND metric_date = '" + date + "'";
    }
    
    /**
     * Create collect_group_by and collect_by_value restriction.
     * 
     * @param blId String
     * @return String
     */
    private String getCollectClause(final String blId) {
        String clause = " AND collect_group_by = 'bl_id'";
        clause += " AND collect_by_value = '" + blId + "' ";
        return clause;
    }
    
    /**
     * Get statistic.
     * 
     * @param table String table id
     * @param field String field id to perform statistic i.e. SUM(metric_value)
     * @param formula String i.e. "sum"
     * @param restriction String SQL restriction
     * @return Double
     */
    public Double getStatistic(final String table, final String field, final String formula,
            final String restriction) {
        return DataStatistics.getDouble(table, field, formula, restriction);
    }
}
