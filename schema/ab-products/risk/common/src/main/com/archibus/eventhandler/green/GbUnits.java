package com.archibus.eventhandler.green;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;

/**
 * Green Building Units Handler
 * 
 * 
 * @author Ioan Draghici
 * 
 */
public class GbUnits {
    /**
     * Units data source.
     */
    private static DataSource dsUnit = null;
    
    private static final GbConstants gbConstants = new GbConstants();
    
    /**
     * Get default unit for unit type.
     * 
     * <p>
     * SELECT bill_unit_id FROM bill_unit WHERE bill_type_id = [unit_type_id] AND is_dflt = 1
     * 
     * @param unit_type_id string unit type.
     * @return unit_id string default unit id for unit type.
     */
    public static String getDefaultUnit(String unit_type_id) {
        DataRecord record = getUnitRecord(unit_type_id, null, true);
        return record.getString("bill_unit.bill_unit_id");
    }
    
    /**
     * Convert user entry to specified unit.
     * 
     * <p>
     * SELECT conversion_factor FROM bill_unit WHERE bill_type_id = [unit_type_id] AND bill_unit_id
     * = [unit_id]
     * <p>
     * return [entered_value]* conversion_factor
     * 
     * @param unit_type_id string unit type
     * @param unit_id string unit
     * @param entered_value double user entry
     * @return double converted value
     */
    public static double getConvertedValue(String unit_type_id, String unit_id,
            double entered_value, boolean isDivision) {
        try {
            DataRecord record = getUnitRecord(unit_type_id, unit_id, false);
            double conversionFactor = record.getDouble("bill_unit.conversion_factor");
            if (isDivision) {
                return (entered_value / conversionFactor);
            } else {
                return (entered_value * conversionFactor);
            }
        } catch (ExceptionBase originalException) {
            throw originalException;
        } catch (Throwable originalException) {
            ExceptionBase newException = new ExceptionBase(null,
                gbConstants.getLocalizedString(gbConstants.notLocalizedFactorNotFoundMsg),
                originalException);
            throw newException;
        }
    }
    
    /**
     * Reset the old default unit.
     * 
     * @param unit_type_id unit type
     * @param unit_id new default unit
     */
    public static void resetDefaultUnit(String unit_type_id, String unit_id) {
        DataRecord record = getUnitRecord(unit_type_id, unit_id, true);
        if (record != null) {
            record.setValue("bill_unit.is_dflt", 0);
            dsUnit.saveRecord(record);
        }
    }
    
    /**
     * Get unit record.
     * 
     * @param unit_type_id string unit type
     * @param unit_id string unit
     * @param isDefault boolean
     * @return dataRecord
     */
    private static DataRecord getUnitRecord(String unit_type_id, String unit_id, boolean isDefault) {
        String[] fields = { "bill_type_id", "bill_unit_id", "conversion_factor", "is_dflt" };
        dsUnit = DataSourceFactory.createDataSourceForFields("bill_unit", fields);
        dsUnit.addRestriction(Restrictions.eq("bill_unit", "bill_type_id", unit_type_id));
        if (isDefault) {
            dsUnit.addRestriction(Restrictions.eq("bill_unit", "is_dflt", "1"));
            if (unit_id != null) {
                dsUnit.addRestriction(Restrictions.ne("bill_unit", "bill_unit_id", unit_id));
            }
        } else {
            dsUnit.addRestriction(Restrictions.eq("bill_unit", "bill_unit_id", unit_id));
        }
        return (dsUnit.getRecord());
    }
}
