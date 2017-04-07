package com.archibus.eventhandler.green.footprint;

import java.util.List;

import org.json.JSONObject;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.green.GbConstants;
import com.archibus.jobmanager.JobStatus;

public class FootprintScope3 {
    private final GbConstants gbConstants = new GbConstants();
    
    /**
     * source_id is optional - the default value if there is no source_id should be 0
     **/
    public JSONObject calculateScope3WasteSolid(String bl_id, int calc_year, String scenario_id,
            int source_id, JobStatus status) {
        
        JSONObject jsonExpression = new JSONObject();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        
        // First get setup values for given building, year and scenario that will be used to get the
        DataSource dsSetup = DataSourceFactory.createDataSource();
        dsSetup.addTable("gb_fp_setup", DataSource.ROLE_MAIN);
        dsSetup.addField("gb_fp_setup", "waste_sol_version");
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
        
        // Get the setup value
        String waste_sol_version = setupRecord.getString("gb_fp_setup.waste_sol_version");
        
        // Get emission sources and disposal and recycling amounts
        DataSource dsSource = DataSourceFactory.createDataSource();
        dsSource.addTable("gb_fp_s3_waste_sol", DataSource.ROLE_MAIN);
        dsSource.addField("gb_fp_s3_waste_sol", "source_id");
        dsSource.addField("gb_fp_s3_waste_sol", "waste_name");
        dsSource.addField("gb_fp_s3_waste_sol", "amount_disposed");
        dsSource.addField("gb_fp_s3_waste_sol", "amount_recycled");
        dsSource.addField("gb_fp_s3_waste_sol", "kg_co2");
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_waste_sol", "bl_id", bl_id));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_waste_sol", "calc_year", calc_year));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_waste_sol", "scenario_id", scenario_id));
        if (source_id != 0) {
            dsSource.addRestriction(Restrictions.eq("gb_fp_s3_waste_sol", "source_id", source_id));
        }
        
        // Proceed to get the records for the emission sources and then loop through them to run the
        // calcs
        List<DataRecord> records = dsSource.getRecords();
        
        int current = 0;
        int totalRecords = records.size();
        status.setCurrentNumber(current);
        status.setTotalNumber(totalRecords);
        
        // Define variables / default values outside the loop
        Double disp_emiss_fact = 0.0;
        Double recy_emiss_fact = 0.0;
        Double amount_disp_tons = 0.0;
        Double amount_recy_tons = 0.0;
        Double emiss_mtce = 0.0;
        Double kg_CO2 = 0.0;
        
        for (DataRecord record : records) {
            // Get the solid waste disposal and recycling amounts
            Double amount_disposed = record.getDouble("gb_fp_s3_waste_sol.amount_disposed");
            Double amount_recycled = record.getDouble("gb_fp_s3_waste_sol.amount_recycled");
            String waste_name = record.getString("gb_fp_s3_waste_sol.waste_name");
            
            // Get the Disposal and Recycling Emission Factors from the data table
            String table = "gb_fp_waste_sol_data";
            String[] fields = { "composite_disposal", "recycling" };
            Clause[] restrictionClauses;
            restrictionClauses = new Clause[3];
            restrictionClauses[0] = Restrictions.eq("gb_fp_waste_sol_data", "version_type",
                "gb_fp_waste_sol_data");
            restrictionClauses[1] = Restrictions.eq("gb_fp_waste_sol_data", "version_name",
                waste_sol_version);
            restrictionClauses[2] = Restrictions.eq("gb_fp_waste_sol_data", "waste_name",
                waste_name);
            DataRecord factorRecord = getSingleRecord(table, fields,
                Restrictions.and(restrictionClauses));
            
            if (factorRecord != null) {
                // Disposal Emission Factor (MTCE/Ton)
                disp_emiss_fact = factorRecord.getDouble("gb_fp_waste_sol_data.composite_disposal");
                // Recycling Emission Factor (MTCE/Ton)
                recy_emiss_fact = factorRecord.getDouble("gb_fp_waste_sol_data.recycling");
            } else {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
            }
            
            // Solid waste disposal and recycling anounts - converted to Tons
            amount_disp_tons = amount_disposed * GbConstants.lb_ton;
            amount_recy_tons = amount_recycled * GbConstants.lb_ton;
            
            // Emissions
            emiss_mtce = (amount_disp_tons * disp_emiss_fact)
                    + (amount_recy_tons * recy_emiss_fact);
            
            // Total Carbon emissions
            kg_CO2 = (emiss_mtce * GbConstants.c_co2) * GbConstants.mt_kg;
            
            // Update the value for the total emissions
            record.setValue("gb_fp_s3_waste_sol.kg_co2", kg_CO2);
            dsSource.saveRecord(record);
            
            status.setCurrentNumber(++current);
        }
        
        if (source_id != 0) {
            jsonExpression.put("amount_disp_tons", amount_disp_tons);
            jsonExpression.put("disp_emiss_fact", disp_emiss_fact);
            jsonExpression.put("amount_recy_tons", amount_recy_tons);
            jsonExpression.put("recy_emiss_fact", recy_emiss_fact);
            jsonExpression.put("emiss_mtce", emiss_mtce);
            jsonExpression.put("c_CO2", GbConstants.c_co2);
            jsonExpression.put("kg_CO2", kg_CO2);
        }
        
        return jsonExpression;
    }
    
    /**
     * source_id is optional - the default value if there is no source_id should be 0
     **/
    public JSONObject calculateScope3WasteLiquid(String bl_id, int calc_year, String scenario_id,
            int source_id, JobStatus status) {
        
        JSONObject jsonExpression = new JSONObject();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        
        // First get setup values for given building, year and scenario
        DataSource dsSetup = DataSourceFactory.createDataSource();
        dsSetup.addTable("gb_fp_setup", DataSource.ROLE_MAIN);
        dsSetup.addField("gb_fp_setup", "waste_liq_version");
        dsSetup.addField("gb_fp_setup", "gwp_version");
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
        String waste_liq_version = setupRecord.getString("gb_fp_setup.waste_liq_version");
        
        // Get Methane Global Warming Potential Factor
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
        
        // Get each emission source the quantity of treated waste and the treatment system id
        DataSource dsSource = DataSourceFactory.createDataSource();
        dsSource.addTable("gb_fp_s3_waste_liq", DataSource.ROLE_MAIN);
        dsSource.addField("gb_fp_s3_waste_liq", "source_id");
        dsSource.addField("gb_fp_s3_waste_liq", "qty_treated");
        dsSource.addField("gb_fp_s3_waste_liq", "treatment_id");
        dsSource.addField("gb_fp_s3_waste_liq", "mtce_ch4");
        dsSource.addField("gb_fp_s3_waste_liq", "ch4_emiss");
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_waste_liq", "bl_id", bl_id));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_waste_liq", "calc_year", calc_year));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_waste_liq", "scenario_id", scenario_id));
        if (source_id != 0) {
            dsSource.addRestriction(Restrictions.eq("gb_fp_s3_waste_liq", "source_id", source_id));
        }
        
        // Proceed to get the records for the emission sources and then loop through them to get the
        // emission factors for each source and run the calcs
        List<DataRecord> records = dsSource.getRecords();
        
        int current = 0;
        int totalRecords = records.size();
        status.setCurrentNumber(current);
        status.setTotalNumber(totalRecords);
        
        // Set default values
        Double percent_treat_anaerob = 0.0;
        Double mgBOD5_gal_wastewater = 0.0;
        Double mgCH4_mgBOD5 = 0.0;
        Double conv1 = 0.0;
        Double conv2 = 0.0;
        Double mtce_CH4 = 0.0;
        Double CH4_emiss = 0.0;
        
        for (DataRecord record : records) {
            // Get the quantity treated
            Double qty_treated = record.getDouble("gb_fp_s3_waste_liq.qty_treated");
            
            // Get the treatment system id
            String treatment_id = record.getString("gb_fp_s3_waste_liq.treatment_id");
            
            // Get the % treated anaerobically, mg BOD5/gallon of wastewater, mg CH4/mg BOD5 values
            // from gb_fp_waste_liq_data
            String table = "gb_fp_waste_liq_data";
            String[] fields = { "percent_anaerobic", "bod5_wastewater", "ch4_bod5" };
            Clause[] restrictionClauses;
            restrictionClauses = new Clause[3];
            restrictionClauses[0] = Restrictions.eq("gb_fp_waste_liq_data", "version_type",
                "gb_fp_waste_liq_data");
            restrictionClauses[1] = Restrictions.eq("gb_fp_waste_liq_data", "version_name",
                waste_liq_version);
            restrictionClauses[2] = Restrictions.eq("gb_fp_waste_liq_data", "treatment_id",
                treatment_id);
            DataRecord factorRecord = getSingleRecord(table, fields,
                Restrictions.and(restrictionClauses));
            
            if (factorRecord != null) {
                percent_treat_anaerob = factorRecord
                    .getDouble("gb_fp_waste_liq_data.percent_anaerobic") / 100.0;
                mgBOD5_gal_wastewater = factorRecord
                    .getDouble("gb_fp_waste_liq_data.bod5_wastewater");
                mgCH4_mgBOD5 = factorRecord.getDouble("gb_fp_waste_liq_data.ch4_bod5");
            } else {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
            }
            
            // Calculate emissions
            conv1 = GbConstants.co2_c * GbConstants.mg_gr;
            conv2 = GbConstants.mt_gr;
            mtce_CH4 = qty_treated * percent_treat_anaerob * mgBOD5_gal_wastewater * mgCH4_mgBOD5
                    * (conv1 / conv2) * CH4_gwp_fact;
            CH4_emiss = mtce_CH4 * GbConstants.c_co2;
            
            // Update the emission values for this source
            record.setValue("gb_fp_s3_waste_liq.mtce_ch4", mtce_CH4);
            record.setValue("gb_fp_s3_waste_liq.ch4_emiss", CH4_emiss);
            dsSource.saveRecord(record);
            
            status.setCurrentNumber(++current);
        }
        
        if (source_id != 0) {
            jsonExpression.put("percent_treat_anaerob", percent_treat_anaerob);
            jsonExpression.put("mgBOD5_gal_wastewater", mgBOD5_gal_wastewater);
            jsonExpression.put("mgCH4_mgBOD5", mgCH4_mgBOD5);
            jsonExpression.put("conv1", conv1);
            jsonExpression.put("conv2", conv2);
            jsonExpression.put("CH4_gwp_fact", CH4_gwp_fact);
            jsonExpression.put("mtce_CH4", mtce_CH4);
            jsonExpression.put("c_CO2", GbConstants.c_co2);
            jsonExpression.put("CH4_emiss", CH4_emiss);
        }
        
        return jsonExpression;
    }
    
    /**
     * source_id is optional - the default value if there is no source_id should be 0
     **/
    public JSONObject calculateScope3EmployeeAircraft(String bl_id, int calc_year,
            String scenario_id, int source_id, JobStatus status) {
        
        JSONObject jsonExpression = new JSONObject();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        
        // First get setup values for the given building, year and scenario
        DataSource dsSetup = DataSourceFactory.createDataSource();
        dsSetup.addTable("gb_fp_setup", DataSource.ROLE_MAIN);
        dsSetup.addField("gb_fp_setup", "gwp_version");
        dsSetup.addField("gb_fp_setup", "comm_airc_version");
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
        
        // Global warming potential factors
        String gwp_version = setupRecord.getString("gb_fp_setup.gwp_version");
        // Commercial aircraft version
        String comm_airc_version = setupRecord.getString("gb_fp_setup.comm_airc_version");
        
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
        
        // Get all emission sources for employee air transportation and the distance traveled
        DataSource dsSource = DataSourceFactory.createDataSource();
        dsSource.addTable("gb_fp_s3_em_air", DataSource.ROLE_MAIN);
        dsSource.addField("gb_fp_s3_em_air", "source_id");
        dsSource.addField("gb_fp_s3_em_air", "distance");
        dsSource.addField("gb_fp_s3_em_air", "seating_type");
        dsSource.addField("gb_fp_s3_em_air", "distance_type");
        dsSource.addField("gb_fp_s3_em_air", "kg_co2");
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_em_air", "bl_id", bl_id));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_em_air", "calc_year", calc_year));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_em_air", "scenario_id", scenario_id));
        if (source_id != 0) {
            dsSource.addRestriction(Restrictions.eq("gb_fp_s3_em_air", "source_id", source_id));
        }
        
        // Proceed to get the sources and then loop through them to get the factors and run the
        // calcs
        List<DataRecord> records = dsSource.getRecords();
        
        int current = 0;
        int totalRecords = records.size();
        status.setCurrentNumber(current);
        status.setTotalNumber(totalRecords);
        
        // Default values
        Double emiss_fact = 0.0;
        Double CH4_emiss_fact = 0.0;
        Double N2O_emiss_fact = 0.0;
        Double emiss_kgCO2 = 0.0;
        Double CH4_emiss_kgCO2 = 0.0;
        Double N2O_emiss_kgCO2 = 0.0;
        Double kg_CO2 = 0.0;
        
        for (DataRecord record : records) {
            // Get the distance traveled, the distance type and the seating type
            Double distance = record.getDouble("gb_fp_s3_em_air.distance");
            String seating_type = record.getString("gb_fp_s3_em_air.seating_type");
            String distance_type = record.getString("gb_fp_s3_em_air.distance_type");
            
            // Get the carbon, methane and n2o emission factors per seat mile from the
            // gb_fp_comm_airc_data table
            String table = "gb_fp_comm_airc_data";
            String[] fields = { "co2", "ch4", "n2o" };
            Clause[] restrictionClauses;
            restrictionClauses = new Clause[4];
            restrictionClauses[0] = Restrictions.eq("gb_fp_comm_airc_data", "version_type",
                "gb_fp_comm_airc_data");
            restrictionClauses[1] = Restrictions.eq("gb_fp_comm_airc_data", "version_name",
                comm_airc_version);
            restrictionClauses[2] = Restrictions.eq("gb_fp_comm_airc_data", "seating_type",
                seating_type);
            restrictionClauses[3] = Restrictions.eq("gb_fp_comm_airc_data", "distance_type",
                distance_type);
            DataRecord factorRecord = getSingleRecord(table, fields,
                Restrictions.and(restrictionClauses));
            
            if (factorRecord != null) {
                emiss_fact = factorRecord.getDouble("gb_fp_comm_airc_data.co2");
                CH4_emiss_fact = GbConstants.gr_kg
                        * factorRecord.getDouble("gb_fp_comm_airc_data.ch4");
                N2O_emiss_fact = GbConstants.gr_kg
                        * factorRecord.getDouble("gb_fp_comm_airc_data.n2o");
            } else {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
            }
            
            // Carbon emissions in kilograms
            emiss_kgCO2 = distance * emiss_fact;
            
            // Methane CO2 emissions in kilograms
            CH4_emiss_kgCO2 = distance * CH4_emiss_fact * CH4_gwp_fact;
            
            // Nitrogen Oxide CO2 emissions in kilograms
            N2O_emiss_kgCO2 = distance * N2O_emiss_fact * N2O_gwp_fact;
            
            // Total Carbon emissions in kilograms
            kg_CO2 = emiss_kgCO2 + CH4_emiss_kgCO2 + N2O_emiss_kgCO2;
            
            // Update the value for the total emissions
            record.setValue("gb_fp_s3_em_air.kg_co2", kg_CO2);
            dsSource.saveRecord(record);
            
            status.setCurrentNumber(++current);
        }
        
        if (source_id != 0) {
            jsonExpression.put("emiss_fact", emiss_fact);
            jsonExpression.put("emiss_kgCO2", emiss_kgCO2);
            jsonExpression.put("CH4_emiss_fact", CH4_emiss_fact);
            jsonExpression.put("CH4_gwp_fact", CH4_gwp_fact);
            jsonExpression.put("CH4_emiss_kgCO2", CH4_emiss_kgCO2);
            jsonExpression.put("N2O_emiss_fact", N2O_emiss_fact);
            jsonExpression.put("N2O_gwp_fact", N2O_gwp_fact);
            jsonExpression.put("N2O_emiss_kgCO2", N2O_emiss_kgCO2);
            jsonExpression.put("kg_CO2", kg_CO2);
        }
        
        return jsonExpression;
    }
    
    /**
     * source_id is optional - the default value if there is no source_id should be 0
     **/
    public JSONObject calculateScope3PurchasedMaterials(String bl_id, int calc_year,
            String scenario_id, int source_id, JobStatus status) {
        
        JSONObject jsonExpression = new JSONObject();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        
        // First get setup values for given building, year and scenario that will be used to get the
        DataSource dsSetup = DataSourceFactory.createDataSource();
        dsSetup.addTable("gb_fp_setup", DataSource.ROLE_MAIN);
        dsSetup.addField("gb_fp_setup", "waste_sol_version");
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
        
        // Get the setup value
        String waste_sol_version = setupRecord.getString("gb_fp_setup.waste_sol_version");
        
        // Get emission sources for purchased materials and the amounts
        DataSource dsSource = DataSourceFactory.createDataSource();
        dsSource.addTable("gb_fp_s3_mat", DataSource.ROLE_MAIN);
        dsSource.addField("gb_fp_s3_mat", "source_id");
        dsSource.addField("gb_fp_s3_mat", "waste_name");
        dsSource.addField("gb_fp_s3_mat", "amount_purchased");
        dsSource.addField("gb_fp_s3_mat", "recycled_content");
        dsSource.addField("gb_fp_s3_mat", "kg_co2");
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_mat", "bl_id", bl_id));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_mat", "calc_year", calc_year));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_mat", "scenario_id", scenario_id));
        if (source_id != 0) {
            dsSource.addRestriction(Restrictions.eq("gb_fp_s3_mat", "source_id", source_id));
        }
        
        // Proceed to get the sources and then loop through them to get the factors and run the
        // calcs
        List<DataRecord> records = dsSource.getRecords();
        
        int current = 0;
        int totalRecords = records.size();
        status.setCurrentNumber(current);
        status.setTotalNumber(totalRecords);
        
        // Default values
        Double raw_mat_acquis = 0.0;
        Double product_manuf = 0.0;
        Double forest_carbon = 0.0;
        Double virgin_amount_purch = 0.0;
        Double recy_amount_purch = 0.0;
        Double emiss_mtce = 0.0;
        Double kg_CO2 = 0.0;
        
        for (DataRecord record : records) {
            // Get the amount of purchased materials and the average recycled content
            Double amount_purchased = record.getDouble("gb_fp_s3_mat.amount_purchased");
            Double recycled_content = record.getDouble("gb_fp_s3_mat.recycled_content");
            String waste_name = record.getString("gb_fp_s3_mat.waste_name");
            
            // Get key factors from the gb_fp_waste_sol_data table
            String table = "gb_fp_waste_sol_data";
            String[] fields = { "raw_acquisition", "manufacture_recycled", "carbon_sequestration" };
            Clause[] restrictionClauses;
            restrictionClauses = new Clause[3];
            restrictionClauses[0] = Restrictions.eq("gb_fp_waste_sol_data", "version_type",
                "gb_fp_waste_sol_data");
            restrictionClauses[1] = Restrictions.eq("gb_fp_waste_sol_data", "version_name",
                waste_sol_version);
            restrictionClauses[2] = Restrictions.eq("gb_fp_waste_sol_data", "waste_name",
                waste_name);
            DataRecord factorRecord = getSingleRecord(table, fields,
                Restrictions.and(restrictionClauses));
            
            if (factorRecord != null) {
                raw_mat_acquis = factorRecord.getDouble("gb_fp_waste_sol_data.raw_acquisition");
                product_manuf = factorRecord.getDouble("gb_fp_waste_sol_data.manufacture_recycled");
                forest_carbon = factorRecord.getDouble("gb_fp_waste_sol_data.carbon_sequestration");
            } else {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
            }
            
            // Emission calculations
            virgin_amount_purch = amount_purchased * (1 - recycled_content / 100)
                    * GbConstants.lb_ton;
            recy_amount_purch = amount_purchased * (recycled_content / 100) * GbConstants.lb_ton;
            emiss_mtce = (virgin_amount_purch * raw_mat_acquis)
                    + (recy_amount_purch * product_manuf) + (recy_amount_purch * forest_carbon);
            
            // Total Carbon emissions in kilograms
            kg_CO2 = (emiss_mtce * GbConstants.c_co2) * GbConstants.mt_kg;
            
            // Update the value for the total emissions
            record.setValue("gb_fp_s3_mat.kg_co2", kg_CO2);
            dsSource.saveRecord(record);
            
            status.setCurrentNumber(++current);
        }
        
        if (source_id != 0) {
            jsonExpression.put("virgin_amount_purch", virgin_amount_purch);
            jsonExpression.put("raw_mat_acquis", raw_mat_acquis);
            jsonExpression.put("recy_amount_purch", recy_amount_purch);
            jsonExpression.put("product_manuf", product_manuf);
            jsonExpression.put("forest_carbon", forest_carbon);
            jsonExpression.put("emiss_mtce", emiss_mtce);
            jsonExpression.put("c_CO2", GbConstants.c_co2);
            jsonExpression.put("kg_CO2", kg_CO2);
        }
        
        return jsonExpression;
    }
    
    /**
     * source_id is optional - the default value if there is no source_id should be 0
     **/
    public JSONObject calculateScope3Outsourced(String bl_id, int calc_year, String scenario_id,
            int source_id, JobStatus status) {
        
        JSONObject jsonExpression = new JSONObject();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        
        // First get setup values for given building, year and scenario
        DataSource dsSetup = DataSourceFactory.createDataSource();
        dsSetup.addTable("gb_fp_setup", DataSource.ROLE_MAIN);
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
        String egrid_version = setupRecord.getString("gb_fp_setup.egrid_version");
        String subregion_code = setupRecord.getString("gb_fp_setup.subregion_code");
        
        // Get the Carbon emission factor from gb_fp_egrid_subregions
        DataSource dsSubregion = DataSourceFactory.createDataSource();
        dsSubregion.addTable("gb_fp_egrid_subregions", DataSource.ROLE_MAIN);
        dsSubregion.addField("gb_fp_egrid_subregions", "co2");
        dsSubregion.addRestriction(Restrictions.eq("gb_fp_egrid_subregions", "version_type",
            "gb_fp_egrid_subregions"));
        dsSubregion.addRestriction(Restrictions.eq("gb_fp_egrid_subregions", "version_name",
            egrid_version));
        dsSubregion.addRestriction(Restrictions.eq("gb_fp_egrid_subregions", "subregion_code",
            subregion_code));
        DataRecord subregionRecord = dsSubregion.getRecord();
        
        Double emiss_fact = 0.0;
        if (subregionRecord != null) {
            emiss_fact = GbConstants.kwh_mwh
                    * subregionRecord.getDouble("gb_fp_egrid_subregions.co2");
        } else {
            jsonExpression
                .put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
        }
        
        // Get all emission sources and the number of copies
        DataSource dsSource = DataSourceFactory.createDataSource();
        dsSource.addTable("gb_fp_s3_outs", DataSource.ROLE_MAIN);
        dsSource.addField("gb_fp_s3_outs", "source_id");
        dsSource.addField("gb_fp_s3_outs", "num_copies");
        dsSource.addField("gb_fp_s3_outs", "kg_co2");
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_outs", "bl_id", bl_id));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_outs", "calc_year", calc_year));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_outs", "scenario_id", scenario_id));
        if (source_id != 0) {
            dsSource.addRestriction(Restrictions.eq("gb_fp_s3_outs", "source_id", source_id));
        }
        
        // Proceed to get the records for the emission sources and then loop through them to get the
        // emission factors for each source and run the calcs
        List<DataRecord> records = dsSource.getRecords();
        
        int current = 0;
        int totalRecords = records.size();
        status.setCurrentNumber(current);
        status.setTotalNumber(totalRecords);
        
        // Defaults
        Double kWh_copy = 0.0;
        Double energy_consumption = 0.0;
        Double kg_CO2 = 0.0;
        
        for (DataRecord record : records) {
            // Get the number of copies
            int num_copies = record.getInt("gb_fp_s3_outs.num_copies");
            
            // Calculate emissions
            // kWh per Copy
            kWh_copy = getActivityParameter("AbRiskGreenBuilding", "avg_copy_rate");
            
            // Energy consumption
            energy_consumption = num_copies * kWh_copy;
            
            // Total CO2 emissions
            kg_CO2 = energy_consumption * emiss_fact;
            
            // Update the total emissions in the table
            record.setValue("gb_fp_s3_outs.kg_co2", kg_CO2);
            dsSource.saveRecord(record);
            
            status.setCurrentNumber(++current);
        }
        
        if (source_id != 0) {
            jsonExpression.put("kWh_copy", kWh_copy);
            jsonExpression.put("energy_consumption", energy_consumption);
            jsonExpression.put("emiss_fact", emiss_fact);
            jsonExpression.put("kg_CO2", kg_CO2);
        }
        
        return jsonExpression;
    }
    
    /**
     * source_id is optional - the default value if there is no source_id should be 0
     **/
    public JSONObject calculateScope3OffSiteServers(String bl_id, int calc_year,
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
        dsSource.addTable("gb_fp_s3_serv", DataSource.ROLE_MAIN);
        dsSource.addField("gb_fp_s3_serv", "source_id");
        dsSource.addField("gb_fp_s3_serv", "consumption");
        dsSource.addField("gb_fp_s3_serv", "kg_co2");
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_serv", "bl_id", bl_id));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_serv", "calc_year", calc_year));
        dsSource.addRestriction(Restrictions.eq("gb_fp_s3_serv", "scenario_id", scenario_id));
        if (source_id != 0) {
            dsSource.addRestriction(Restrictions.eq("gb_fp_s3_serv", "source_id", source_id));
        }
        
        // Proceed to get the records for the emission sources and then loop through them to get the
        // emission factors for each source and run the calcs
        List<DataRecord> records = dsSource.getRecords();
        
        int current = 0;
        int totalRecords = records.size();
        status.setCurrentNumber(current);
        status.setTotalNumber(totalRecords);
        
        // Defaults
        Double emiss_kgCO2 = 0.0;
        Double CH4_emiss_kg = 0.0;
        Double CH4_emiss_kgCO2 = 0.0;
        Double N2O_emiss_kg = 0.0;
        Double N2O_emiss_kgCO2 = 0.0;
        Double kg_CO2 = 0.0;
        
        for (DataRecord record : records) {
            // Get the consumption
            Double consumption = record.getDouble("gb_fp_s3_serv.consumption");
            
            // Calculate emissions
            // Carbon emissions
            emiss_kgCO2 = consumption * emiss_fact;
            
            // Methane Carbon emissions
            CH4_emiss_kg = consumption * CH4_emiss_fact;
            CH4_emiss_kgCO2 = CH4_emiss_kg * CH4_gwp_fact;
            
            // Nitrogen Oxide Carbon emissions
            N2O_emiss_kg = consumption * N2O_emiss_fact;
            N2O_emiss_kgCO2 = N2O_emiss_kg * N2O_gwp_fact;
            
            // Total Carbon emissions in kilograms
            kg_CO2 = emiss_kgCO2 + CH4_emiss_kgCO2 + N2O_emiss_kgCO2;
            
            // Update the total CO2 emissions for this source
            record.setValue("gb_fp_s3_serv.kg_co2", kg_CO2);
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
        
        return jsonExpression;
    }
    
    /**
     * Return a single record based on the restriction
     * 
     * @param tableName table name
     * @param fields list of fields
     * @param restriction restriction object
     * @return data record
     */
    private DataRecord getSingleRecord(String tableName, String[] fields, Restriction restriction) {
        DataSource ds = DataSourceFactory.createDataSourceForFields(tableName, fields);
        ds.addRestriction(restriction);
        return ds.getRecord();
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