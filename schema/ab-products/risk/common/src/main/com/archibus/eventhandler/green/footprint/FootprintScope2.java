package com.archibus.eventhandler.green.footprint;

import java.util.List;

import org.json.JSONObject;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.green.GbConstants;
import com.archibus.jobmanager.JobStatus;

public class FootprintScope2 {
    private final GbConstants gbConstants = new GbConstants();
    
    /**
     * If there is no source_id the value passed should be 0
     **/
    public JSONObject calculateScope2PurchasedElectricity(String bl_id, int calc_year,
            String scenario_id, int source_id, JobStatus status) {
        
        JSONObject jsonExpression = new JSONObject();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        
        // First get setup values for given building, year and scenario
        DataSource dsSetup = DataSourceFactory.createDataSource();
        dsSetup.addTable("gb_fp_setup", DataSource.ROLE_MAIN);
        dsSetup.addField("gb_fp_setup", "gwp_version");
        dsSetup.addField("gb_fp_setup", "egrid_version");
        dsSetup.addField("gb_fp_setup", "subregion_code");
        dsSetup.addRestriction(Restrictions.eq("gb_fp_setup", "bl_id", bl_id));
        dsSetup.addRestriction(Restrictions.eq("gb_fp_setup", "calc_year", calc_year));
        dsSetup.addRestriction(Restrictions.eq("gb_fp_setup", "scenario_id", scenario_id));
        DataRecord setupRecord = dsSetup.getRecord();
        
        // If there is no setup record we stop
        if (setupRecord == null) {
            String message = this.gbConstants
                .getLocalizedString(this.gbConstants.SETUP_RECORD_NOT_FOUND);
            message = message.replace("{0}", bl_id);
            message = message.replace("{1}", String.valueOf(calc_year));
            message = message.replace("{2}", scenario_id);
            jsonExpression.put("message", message);
            return (jsonExpression);
        }
        
        // Get the setup values
        String gwp_version = setupRecord.getString("gb_fp_setup.gwp_version");
        String egrid_version = setupRecord.getString("gb_fp_setup.egrid_version");
        String subregion_code = setupRecord.getString("gb_fp_setup.subregion_code");
        
        // Get Carbon, Methane and Nitrogen Oxide emission factors from gb_fp_egrid_subregions
        DataSource dsSubregion = DataSourceFactory.createDataSource();
        dsSubregion.addTable("gb_fp_egrid_subregions", DataSource.ROLE_MAIN);
        dsSubregion.addField("gb_fp_egrid_subregions", "co2");
        dsSubregion.addField("gb_fp_egrid_subregions", "ch4");
        dsSubregion.addField("gb_fp_egrid_subregions", "n2o");
        dsSubregion.addRestriction(Restrictions.eq("gb_fp_egrid_subregions", "version_type",
            "gb_fp_egrid_subregions"));
        dsSubregion.addRestriction(Restrictions.eq("gb_fp_egrid_subregions", "version_name",
            egrid_version));
        dsSubregion.addRestriction(Restrictions.eq("gb_fp_egrid_subregions", "subregion_code",
            subregion_code));
        DataRecord subregionRecord = dsSubregion.getRecord();
        
        Double emiss_fact = 0.0;
        Double CH4_emiss_fact = 0.0;
        Double N2O_emiss_fact = 0.0;
        if (subregionRecord != null) {
            emiss_fact = GbConstants.kwh_mwh
                    * subregionRecord.getDouble("gb_fp_egrid_subregions.co2");
            CH4_emiss_fact = GbConstants.kwh_gwh
                    * subregionRecord.getDouble("gb_fp_egrid_subregions.ch4");
            N2O_emiss_fact = GbConstants.kwh_gwh
                    * subregionRecord.getDouble("gb_fp_egrid_subregions.n2o");
        } else {
            jsonExpression
                .put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
        }
        
        // Get GWP factor for Methane
        DataSource dsgwp1 = DataSourceFactory.createDataSource();
        dsgwp1.addTable("gb_fp_gwp_data", DataSource.ROLE_MAIN);
        dsgwp1.addField("gb_fp_gwp_data", "gwp");
        dsgwp1.addRestriction(Restrictions.eq("gb_fp_gwp_data", "version_type", "gb_fp_gwp_data"));
        dsgwp1.addRestriction(Restrictions.eq("gb_fp_gwp_data", "version_name", gwp_version));
        dsgwp1.addRestriction(Restrictions.eq("gb_fp_gwp_data", "gas_ref_name", "CH4"));
        DataRecord gwp1Record = dsgwp1.getRecord();
        
        Double CH4_gwp_fact;
        if (gwp1Record == null) {
            CH4_gwp_fact = getActivityParameter("AbRiskGreenBuilding", "ch4_gwp");
        } else {
            CH4_gwp_fact = gwp1Record.getDouble("gb_fp_gwp_data.gwp");
        }
        
        // Get GWP factor for Nitrogen Oxide
        DataSource dsgwp2 = DataSourceFactory.createDataSource();
        dsgwp2.addTable("gb_fp_gwp_data", DataSource.ROLE_MAIN);
        dsgwp2.addField("gb_fp_gwp_data", "gwp");
        dsgwp2.addRestriction(Restrictions.eq("gb_fp_gwp_data", "version_type", "gb_fp_gwp_data"));
        dsgwp2.addRestriction(Restrictions.eq("gb_fp_gwp_data", "version_name", gwp_version));
        dsgwp2.addRestriction(Restrictions.eq("gb_fp_gwp_data", "gas_ref_name", "N2O"));
        DataRecord gwp2Record = dsgwp2.getRecord();
        
        Double N2O_gwp_fact;
        if (gwp2Record == null) {
            N2O_gwp_fact = getActivityParameter("AbRiskGreenBuilding", "n2o_gwp");
        } else {
            N2O_gwp_fact = gwp2Record.getDouble("gb_fp_gwp_data.gwp");
        }
        
        // Get all emission sources and their electricity consumption
        DataSource dsSource = DataSourceFactory.createDataSource();
        dsSource.addTable("gb_fp_s2_purch_e", DataSource.ROLE_MAIN);
        dsSource.addField("gb_fp_s2_purch_e", "source_id");
        dsSource.addField("gb_fp_s2_purch_e", "consumption");
        dsSource.addField("gb_fp_s2_purch_e", "kg_co2");
        dsSource.addRestriction(Restrictions.eq("gb_fp_s2_purch_e", "bl_id", bl_id));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s2_purch_e", "calc_year", calc_year));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s2_purch_e", "scenario_id", scenario_id));
        if (source_id != 0) {
            dsSource.addRestriction(Restrictions.eq("gb_fp_s2_purch_e", "source_id", source_id));
        }
        
        // Proceed to get the records for the emission sources and then loop through them to get the
        // emission factors for each source and run the calcs
        List<DataRecord> records = dsSource.getRecords();
        
        int current = 0;
        int totalRecords = records.size();
        status.setCurrentNumber(current);
        status.setTotalNumber(totalRecords);
        
        // Default values
        Double emiss_kgCO2 = 0.0;
        Double CH4_emiss_kg = 0.0;
        Double CH4_emiss_kgCO2 = 0.0;
        Double N2O_emiss_kg = 0.0;
        Double N2O_emiss_kgCO2 = 0.0;
        Double kg_CO2 = 0.0;
        
        for (DataRecord record : records) {
            // Get the consumption of the electricity emission source
            Double consumption = record.getDouble("gb_fp_s2_purch_e.consumption");
            
            // Carbon emissions
            emiss_kgCO2 = consumption * emiss_fact;
            
            // Methane Carbon emissions
            CH4_emiss_kg = consumption * CH4_emiss_fact;
            CH4_emiss_kgCO2 = CH4_emiss_kg * CH4_gwp_fact;
            
            // Nitrogen Oxide Carbon emissions
            N2O_emiss_kg = consumption * N2O_emiss_fact;
            N2O_emiss_kgCO2 = N2O_emiss_kg * N2O_gwp_fact;
            
            // Total Carbon emissions for the source
            kg_CO2 = emiss_kgCO2 + CH4_emiss_kgCO2 + N2O_emiss_kgCO2;
            
            // Update the Carbon emissions for each emission source
            record.setValue("gb_fp_s2_purch_e.kg_co2", kg_CO2);
            dsSource.saveRecord(record);
            
            status.setCurrentNumber(++current);
        }
        
        if (source_id != 0) {
            jsonExpression.put("emiss_fact", emiss_fact);
            jsonExpression.put("emiss_kgCO2", emiss_kgCO2);
            jsonExpression.put("CH4_emiss_fact", CH4_emiss_fact);
            jsonExpression.put("CH4_emiss_kg", CH4_emiss_kg);
            jsonExpression.put("CH4_gwp_fact", CH4_gwp_fact);
            jsonExpression.put("CH4_emiss_kgCO2", CH4_emiss_kgCO2);
            jsonExpression.put("N2O_emiss_fact", N2O_emiss_fact);
            jsonExpression.put("N2O_emiss_kg", N2O_emiss_kg);
            jsonExpression.put("N2O_gwp_fact", N2O_gwp_fact);
            jsonExpression.put("N2O_emiss_kgCO2", N2O_emiss_kgCO2);
            jsonExpression.put("kg_CO2", kg_CO2);
        }
        return (jsonExpression);
    }
    
    /**
     * Get activity parameter
     * 
     * @param activityId
     * @param paramName
     * @return
     */
    public Double getActivityParameter(String activityId, String paramName) {
        Context context = ContextStore.get();
        return EventHandlerBase.getActivityParameterDouble(context.getEventHandlerContext(),
            activityId, paramName);
    }
}