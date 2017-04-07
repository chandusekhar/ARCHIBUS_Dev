package com.archibus.eventhandler.energy;

import java.util.*;

/**
 * RegressionConstants - Holds key values needed for the regression calculation.
 *
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 */

public class RegressionConstantsService {
    public static double EST_COOLING_OAT = 63.0;

    public static double EST_HEATING_OAT = 55.0;

    public static int MIN_EST_POINTS = 3;

    public static int MIN_VALID_DAYS = 325;

    public static double MAX_BALANCE_POINT = 65.0;

    public static double MIN_BALANCE_POINT = 52.0;

    public static double AVG_DAYS_PER_MONTH = 365.25 / 12.0;

    public static double ERROR_THRESHOLD = 3.0;

    public static double MIN_PERCENTAGE_ERROR_THRESHOLD = 0.3;

    public static double MAX_PERCENTAGE_ERROR_THRESHOLD = 0.5;

    public static double MIN_INTERVALS = 96;

    public static double DEFAULT_BALANCE_POINT = 60.0;

    public static final String ELECTRIC = "ELECTRIC";

    public static final String GASNATURAL = "GAS - NATURAL";

    public static final String GASPROPANE = "GAS - PROPANE";

    public static final String FUEL_OIL_ONE = "FUEL OIL 1";

    public static final String FUEL_OIL_TWO = "FUEL OIL 2";

    public static final String SEWER = "UTILITY - SEWER";

    public static final String WATER = "WATER";

    public static final String[] UTILITY_TYPE = { ELECTRIC, GASNATURAL, GASPROPANE, SEWER, WATER, FUEL_OIL_ONE, FUEL_OIL_TWO};

    public static final String CONSUMPTION = "CONSUMPTION";

    public static final String DEMAND = "DEMAND";

    public static final String HDD = "HDD";

    public static final String CDD = "CDD";

    public static final String HDD_CDD = "HDD_CDD";

    public static final String COOLING = "COOLING";

    public static final String HEATING = "HEATING";

    public static final String DEMAND_REGRESSION_TYPE = "el_demand_regression";

    public static final Map<String, String> CONSUMPTION_REGRESSION_TYPE =
            new HashMap<String, String>() {
        /**
         * Property: serialVersionUID.
         */
        private static final long serialVersionUID = 1L;

        {
            put(ELECTRIC, "el_regression");
            put(GASNATURAL, "gas_natural_regression");
            put(GASPROPANE, "gas_propane_regression");
            put(FUEL_OIL_ONE, "fuel_oil_1_regression");
            put(FUEL_OIL_TWO, "fuel_oil_2_regression");
            // put(WATER, "water"); -- not currently used as of V.21.1
        }
    };
}
