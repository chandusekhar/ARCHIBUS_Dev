package com.archibus.eventhandler.green;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;

/**
 * Green Building Constants.
 * 
 * @author Ioan Draghici
 * 
 */
public class GbConstants {
    /**
     * Generic message to use when factors are not defined.
     */
    // @translatable
    public final String notLocalizedFactorNotFoundMsg = "One or more expected carbon footprint factors are not defined.  Please supply missing factor values to ensure accurate totals.";
    
    /**
     * KB 3030899 - Localized generic message displayed when factors are not defined.
     */
    
    // @translatable
    public final String SETUP_RECORD_NOT_FOUND = "Setup record not found for Building Code '{0}', Calculation Year  {1} and Scenario Code '{2}'.";
    
    // @translatable
    public final String CALCULATING_EMISSIONS = "Calculating Emissions ...";
    
    /**
     * Conversion Factor: <b><i>Kilogram to Metric Ton</i></b>.
     */
    public static final double kg_mt = 0.001;
    
    /**
     * Conversion Factor: <b><i>Gram to Kilogram</i></b>.
     */
    public static final double gr_kg = 0.001;
    
    /**
     * Conversion Factor: <b><i>Milligram to Gram</i></b>.
     */
    public static final double mg_gr = 0.001;
    
    /**
     * Conversion Factor: <b><i>Metric Ton to Kilogram</i></b>.
     */
    public static final double mt_kg = 1000;
    
    /**
     * Conversion Factor: <b><i>Metric Ton to Gram</i></b>.
     */
    public static final double mt_gr = 1000000;
    
    /**
     * Conversion Factor: <b><i>Mega Joule to Giga Joule</i></b>.
     */
    public static final double mj_gj = 0.001;
    
    /**
     * Conversion Factor: <b><i>Pound to Short Ton</i></b>.
     */
    public static final double lb_ton = 0.0005;
    
    /**
     * Conversion Factor: <b><i>Carbon to Carbon Dioxide</i></b>.
     */
    public static final double c_co2 = 3.666666666666667;
    
    /**
     * Conversion Factor: <b><i>Carbon Dioxide to Carbon</i></b>.
     */
    public static final double co2_c = 0.272727273;
    
    /**
     * Conversion Factor: <b><i>Gallon to Cubic Meter</i></b>.
     */
    public static final double gal_m3 = 0.00378541178;
    
    /**
     * Conversion Factor: <b><i>Kilowatt hour to Megawatt hour</i></b>.
     */
    public static final double kwh_mwh = 0.001;
    
    /**
     * Conversion Factor: <b><i>Kilowatt hour to Gigawatt hour</i></b>.
     */
    public static final double kwh_gwh = 0.000001;
    
    /**
     * Version type fuel density data.
     */
    public static final String VERSION_TYPE_FUEL_DENSITY = "gb_fp_fuel_dens_data";
    
    /**
     * Version type heat content data.
     */
    public static final String VERSION_TYPE_HEAT_CONTENT = "gb_fp_heat_data";
    
    /**
     * Version type carbon content data.
     */
    public static final String VERSION_TYPE_CARBON_CONTENT = "gb_fp_carbon_data";
    
    /**
     * Version type GWP.
     */
    public static final String VERSION_TYPE_GWP_CONTENT = "gb_fp_gwp_data";
    
    /**
     * Version type Mobile.
     */
    public static final String VERSION_TYPE_MOBILE_CONTENT = "gb_fp_mobile_data";
    
    /**
     * Version type Aircraft data
     */
    public static final String VERSION_TYPE_AIRC_CONTENT = "gb_fp_airc_data";
    
    /**
     * Version type Refrigeration data
     */
    public static final String VERSION_TYPE_REFRIG_CONTENT = "gb_fp_refrig_data";
    
    public String getLocalizedString(String constant) {
        return EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
            constant, this.getClass().getName());
    }
}
