package com.archibus.eventhandler.green.footprint;

import java.text.ParseException;
import java.util.*;

import org.json.JSONArray;

import com.archibus.datasource.DataSourceTestBase;

public class FootprintHandlerTest extends DataSourceTestBase {
    
    FootprintHandler classHandler = null;
    
    public void testGetDefaultUnit() {
        this.classHandler = new FootprintHandler();
        String unit_type = "AIRCRAFT FUEL CONSUMPTION";
        String unit_id = this.classHandler.getDefaultUnit(unit_type);
        System.out.println("Default Unit ID = " + unit_id);
    }
    
    public void testGetConvertedValue() {
        this.classHandler = new FootprintHandler();
        String unit_type = "AIRCRAFT FUEL CONSUMPTION";
        String unit_id = "liters/hour";
        double entered_value = 120.55;
        double convertedValue;
        boolean isDivision = true;
        
        convertedValue = this.classHandler.getConvertedValue(unit_type, unit_id, entered_value,
            isDivision);
        
        System.out.println("Converted value = " + convertedValue);
    }
    
    public void testSummarizeEmissions() {
        List<String> bl_id = new ArrayList<String>();
        bl_id.add("HQ");
        bl_id.add("XC");
        bl_id.add("JACQUES");
        List<String> calc_year = new ArrayList<String>();
        calc_year.add("2010");
        calc_year.add("2011");
        List<String> scenario_id = new ArrayList<String>();
        scenario_id.add("Scenario 1");
        
        this.classHandler = new FootprintHandler();
        this.classHandler.summarizeEmissions(bl_id, calc_year, scenario_id);
    }
    
    public void testCalculateEmissions() {
        
        List<String> bl_id = new ArrayList<String>();
        bl_id.add("HQ");
        bl_id.add("XC");
        bl_id.add("JACQUES");
        List<String> calc_year = new ArrayList<String>();
        calc_year.add("2010");
        calc_year.add("2011");
        List<String> scenario_id = new ArrayList<String>();
        scenario_id.add("Scenario 1");
        
        this.classHandler = new FootprintHandler();
        this.classHandler.calculateEmissions(bl_id, calc_year, scenario_id);
    }
    
    public void testCalculateScope1FuelCombustion() {
        String blId = "HQ";
        String scenarioId = "SCN1";
        int calcYear = 2009;
        int sourceId = 0;
        
        this.classHandler = new FootprintHandler();
        this.classHandler.calculateScope1FuelCombustion(blId, calcYear, scenarioId, sourceId);
    }
    
    public void testCalculateScope1CompanyOwnedAircraft() {
        String blId = "HQ";
        String scenarioId = "Scenario 1";
        int calcYear = 2010;
        int sourceId = 0;
        
        this.classHandler = new FootprintHandler();
        this.classHandler.calculateScope1CompanyOwnedAircraft(blId, calcYear, scenarioId, sourceId);
        
    }
    
    public void testCalculateScope1Scope3Mobile() {
        String blId = "HQ";
        String scenarioId = "Scenario 1";
        String costCateg = "S1_COMPANY_ROAD";
        int calcYear = 2010;
        int sourceId = 0;
        
        this.classHandler = new FootprintHandler();
        this.classHandler.calculateScope1Scope3Mobile(blId, calcYear, scenarioId, sourceId,
            costCateg);
    }
    
    public void testCalculateScope1RefrigerantAC() {
        String blId = "HQ";
        String scenarioId = "Scenario 1";
        int calcYear = 2010;
        int sourceId = 0;
        
        this.classHandler = new FootprintHandler();
        this.classHandler.calculateScope1RefrigerantAC(blId, calcYear, scenarioId, sourceId);
    }
    
    public void testExportEnergyStarData() throws ParseException {
        String recordsString = "[{values:{bl.use1:'MIXED USE',gb_fp_setup.bl_id:'HQ', gb_fp_setup.calc_year:'2011',"
                + "gb_fp_setup.scenario_id:'FP-SCN1', gb_fp_setup.calc_year:'2011'}" + "}]";
        
        String dataSourcesDefFromViewString = "[{blUse:'ALL',id:'abGbFpEsExpFacilitiesDS', title:'Facilities', fieldDefs:["
                + "{fullName:'bl.name',title:'Facility Name',hidden:false},"
                + "{fullName:'gb_fp_setup.address',title:'Street Address',hidden:false},"
                + "{fullName:'bl.city_id',title:'City',hidden:false},"
                + "{fullName:'bl.state_id',title:'State',hidden:false}]}]";
        
        JSONArray records = new JSONArray(recordsString);
        JSONArray dataSourcesDefFromView = new JSONArray(dataSourcesDefFromViewString);
        
        this.classHandler = new FootprintHandler();
        this.classHandler.exportEnergyStarData(records, dataSourcesDefFromView);
    }
    
    public void testGenerateGridXLSReport() {
        
        List<Map<String, Object>> visibleFieldDefs = new ArrayList<Map<String, Object>>();
        String dataSourceId = "abGbRptFpSiteBlg_bl_ds";
        String restriction = "";
        Map<String, Object> parameters = new HashMap<String, Object>();
        parameters.put("isGroupPerArea", "false");
        String reportTitle = "Title";
        String reportViewName = "ab-gb-rpt-fp-site-blg.axvw";
        boolean isPerArea = false;
        boolean isAtTheBottom = false;
        String areaExtFieldName = "gb_fp_totals.vf_ext_gross_area";
        
        this.classHandler = new FootprintHandler();
        this.classHandler.generateGridXLSReport(reportViewName, dataSourceId, reportTitle,
            visibleFieldDefs, restriction, parameters, isPerArea, isAtTheBottom, areaExtFieldName);
    }
}
