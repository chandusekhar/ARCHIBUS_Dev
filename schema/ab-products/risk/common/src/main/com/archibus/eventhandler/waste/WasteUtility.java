package com.archibus.eventhandler.waste;

import java.sql.Time;
import java.text.*;
import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;

/**
 * Constants for Waste Management Activity.
 * 
 * 
 * @author ASC-BJ
 */
public final class WasteUtility {
    
    /**
     * Indicates exception when calling Aspose API to generate PDF form.
     * 
     */
    private static final String ERROR_MESSAGE =
            "Get erros when calling Aspose API to generate PDF form";
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteUtility() {
        
    }
    
    /**
     * Prepare datasources for generate label wfr.
     * 
     * 
     * @param wasteoutDS datasource of waste record
     * @param generatorDS datasource of waste generator record
     */
    public static void initialDatsaSourcesForLabels(final DataSource wasteoutDS,
            final DataSource generatorDS) {
        // Define fields for wasteoutDS
        final String[] tableField =
                new String[] { WasteConstants.WASTE_ID, WasteConstants.GENERATOR_ID,
                        WasteConstants.MANIFEST_NUMBER, "waste_generators.bl_id",
                        "waste_generators.pr_id", "quantity", "units", "container_id",
                        WasteConstants.F_WASTE_AREAS_DOT_AREA_TYPE,
                        "waste_generators.generator_name",
                        WasteConstants.WASTE_GENERATORS_GENERATOR_ID,
                        "waste_profiles.waste_profile", "waste_profiles.waste_name", "date_end",
                        "date_start", WasteConstants.MANIFEST_NUMBER,
                        "waste_profiles.transp_classification",
                        "waste_profiles.transp_shipping_name", "units_type",
                        WasteConstants.WASTE_PROFILES_WASTE_TYPE };
        // Add tables for wasteoutDS
        wasteoutDS.addTable(WasteConstants.WASTE_OUT);
        wasteoutDS.addTable("waste_profiles", DataSource.ROLE_STANDARD);
        wasteoutDS.addTable("waste_manifests", DataSource.ROLE_STANDARD);
        wasteoutDS.addTable(WasteConstants.WASTE_GENERATORS, DataSource.ROLE_STANDARD);
        wasteoutDS.addTable("waste_areas", DataSource.ROLE_STANDARD);
        // Add fields for wasteoutDS
        for (final String element : tableField) {
            final String[] tableAndField = element.split(WasteConstants.DOT_SEPERATOR);
            if (tableAndField.length > 1) {
                wasteoutDS.addField(tableAndField[0], tableAndField[1]);
            } else {
                wasteoutDS.addField(element);
            }
        }
        generatorDS.addTable(WasteConstants.WASTE_GENERATORS);
        generatorDS.addTable("bl", DataSource.ROLE_STANDARD);
        generatorDS.addTable("property", DataSource.ROLE_STANDARD);
        generatorDS.addTable("site", DataSource.ROLE_STANDARD);
        // Define fields for generatorDS
        final String[] addressValue =
                new String[] { WasteConstants.WASTE_GENERATORS_GENERATOR_ID, "bl.address1",
                        "bl.address2", "bl.state_id", "bl.city_id", "bl.zip", "property.address1",
                        "property.address2", "property.state_id", "property.city_id",
                        "property.zip", "site.site_id", "site.state_id", "site.city_id" };
        // Add fields for generatorDS
        for (final String element : addressValue) {
            final String[] tableAndField = element.split(WasteConstants.DOT_SEPERATOR);
            if (tableAndField.length > 1) {
                generatorDS.addField(tableAndField[0], tableAndField[1]);
            } else {
                generatorDS.addField(element);
            }
        }
    }
    
    /**
     * check is ? "" : *
     * 
     * @param str String
     * @return String
     */
    public static String isNull(final String str) {
        return null == str || "null".endsWith(str) ? "" : str;
    }
    
    /**
     * Process matched waste record.
     * 
     * @param fieldName String
     * @param wasteObject JSONObject
     * @return Object
     */
    public static Object convertField(final String fieldName, final JSONObject wasteObject) {
        final Object fieldValue = wasteObject.get(fieldName);
        Object convertValue = fieldValue;
        if (fieldName.indexOf("date") != -1) {
            convertValue = getDateByString(fieldValue.toString());
        }
        if (fieldName.indexOf("time") != -1) {
            convertValue = getTimeFromString(fieldValue.toString());
        }
        if ("waste_out.number_containers".equals(fieldName)) {
            if ("".equals(fieldValue.toString())) {
                convertValue = 0;
            } else {
                convertValue = Integer.parseInt(fieldValue.toString());
            }
        }
        if ("waste_out.quantity".equals(fieldName)) {
            if ("".equals(fieldValue.toString())) {
                convertValue = 0.00;
            } else {
                convertValue = Double.parseDouble(fieldValue.toString());
            }
        }
        return convertValue;
    }
    
    /**
     * Process matched waste record.
     * 
     * @param dateStr String string format date value 'yyyy-mm-dd'
     * @return date
     */
    public static Date getDateByString(final String dateStr) {
        final SimpleDateFormat dateFormat =
                new SimpleDateFormat(WasteConstants.DATE_FORMAT, Locale.getDefault());
        Date newDate = null;
        if (!"".equals(dateStr)) {
            try {
                newDate = dateFormat.parse(dateStr);
            } catch (final ParseException originalException) {
                // Wrap original exception into ExceptionBase, supplying user-friendly error
                // message.
                // @translatable
                final ExceptionBase exception =
                        ExceptionBaseFactory
                            .newNonTranslatableException("Convert date Error", null);
                exception.setNested(originalException);
                
                throw exception;
            }
        }
        return newDate;
    }
    
    /**
     * get Converted quanity Value.
     * 
     * @param unitType String Unit Type id
     * @param sourceUnit String source Unit of value
     * @param destUnit String destination Unit of value
     * @param sourceValue double value need to be converted from sourceUnit to destUnit
     * @return double
     */
    public static double getConvertedValueByUnit(final String unitType, final String sourceUnit,
            final String destUnit, final double sourceValue) {
        // creat DataSource
        final DataSource billUnitDS =
                DataSourceFactory.createDataSourceForFields("bill_unit", new String[] {
                        WasteConstants.F_BILL_UNIT_DOT_BILL_TYPE_ID,
                        WasteConstants.F_BILL_UNIT_DOT_BILL_UNIT_ID,
                        WasteConstants.F_BILL_UNIT_DOT_CONVERSION_FACTOR });
        // add restriction to get sourceUnit record
        billUnitDS.addRestriction(Restrictions.eq(WasteConstants.T_BILL_UNIT,
            WasteConstants.F_BILL_TYPE_ID, unitType));
        billUnitDS.addRestriction(Restrictions.eq(WasteConstants.T_BILL_UNIT,
            WasteConstants.F_BILL_UNIT_ID, sourceUnit));
        final DataRecord sourceBillUnit = billUnitDS.getRecord();
        // add restriction to get destUnit record
        billUnitDS.clearRestrictions();
        billUnitDS.addRestriction(Restrictions.eq(WasteConstants.T_BILL_UNIT,
            WasteConstants.F_BILL_TYPE_ID, unitType));
        billUnitDS.addRestriction(Restrictions.eq(WasteConstants.T_BILL_UNIT,
            WasteConstants.F_BILL_UNIT_ID, destUnit));
        final DataRecord destBillUnit = billUnitDS.getRecord();
        // convert value by conversion factor
        final double sourceConversionFactor =
                sourceBillUnit.getDouble(WasteConstants.F_BILL_UNIT_DOT_CONVERSION_FACTOR);
        final double destConversionFactor =
                destBillUnit.getDouble(WasteConstants.F_BILL_UNIT_DOT_CONVERSION_FACTOR);
        return sourceValue * sourceConversionFactor / destConversionFactor;
    }
    
    /**
     * get Time From String.
     * 
     * @param time String
     * @return Time
     */
    public static Time getTimeFromString(final String time) {
        Time formatTime = null;
        final Calendar calendar = Calendar.getInstance();
        if (!"".equals(time)) {
            final String[] times = time.split(":");
            final int hour = Integer.valueOf(times[0]);
            final int minute = Integer.valueOf(times[1].substring(0, 2));
            calendar.set(Calendar.HOUR, hour);
            calendar.set(Calendar.MINUTE, minute);
            
            formatTime = new Time(calendar.getTimeInMillis());
        }
        return formatTime;
    }
    
    /**
     * Wrap original exception and Throw new friendly exception.
     * 
     * @param originalException Exception original unfriendly exception
     */
    public static void wrapAndThrowException(final Exception originalException) {
        final ExceptionBase exception =
                ExceptionBaseFactory.newNonTranslatableException(ERROR_MESSAGE, null);
        exception.setNested(originalException);
        
        throw exception;
    }
    
    /**
     * check have ? "" : *
     * 
     * @param record DataRecord
     * @param fieldNames String[]
     * @param blank boolean indicate if record contains empty field value
     * 
     * @return boolean sign if record contains empty value
     */
    public static boolean checkBlank(final DataRecord record, final String[] fieldNames,
            final boolean blank) {
        boolean result = blank;
        if (!result) {
            for (final String fieldName : fieldNames) {
                if (null == record.getValue(fieldName) || "".equals(record.getValue(fieldName))) {
                    result = true;
                    break;
                }
            }
        }
        
        return result;
    }
    
    /**
     * Validate string values ,replace null with space.
     * 
     * @param checkField table hold fields of address information
     * @return resultString if stringValue is null them return nothing,else return stringValue
     */
    public static String replaceNullWithSpace(final String checkField) {
        
        return checkField == null ? " " : checkField;
    }
    
    /**
     * Get template file path.
     * 
     * 
     * @param tempFileName String template file name
     * @return String template file path
     */
    public static String getTemplateFilePath(final String tempFileName) {
        return ContextStore.get().getWebAppPath()
                + "/schema/ab-products/common/resources/pdf-forms/" + tempFileName;
    }
    
    /**
     * Get out file path.
     * 
     * 
     * @param pdfFile String out file name
     * @return String out file path
     */
    public static String gePdfFilePath(final String pdfFile) {
        return ContextStore.get().getWebAppPath() + "/schema/per-site/pdf-forms/"
                + ContextStore.get().getUser().getName().toLowerCase() + "/" + pdfFile;
    }
    
}
