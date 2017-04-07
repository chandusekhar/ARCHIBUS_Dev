package com.archibus.service.common;

import java.awt.Color;
import java.text.ParseException;
import java.util.*;

import org.json.*;

import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.drawing.highlight.HighLightUtilities;
import com.archibus.ext.drawing.highlight.drawing.*;
import com.archibus.ext.drawing.highlight.legend.LegendGenerator;
import com.archibus.ext.drawing.highlight.patterns.*;
import com.archibus.ext.report.ReportUtility;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.schema.*;
import com.archibus.utility.*;

public class HighlightPatternService extends EventHandlerBase {
    /**
     * FIXEDCOLORS.
     */
    private final static String[] FIXEDCOLORS = { "0x66CCFF", "0xCC66FF", "0x66FFCC", "0xCC66CC",
            "0xCCFF99", "0x339999", "0xB9DAFF", "0xFF6600", "0xFFFF00", "0xCC6633", "0x99CC00",
            "0x00FFCC", "0x993300", "0xCC3366", "0xFF3366", "0xCCCCFF", "0xCCCC00", "0xCC3399",
            "0x99CC66", "0x66FF99" };

    /**
     * encode highlight pattern according user input
     */
    public void encodePattern(final EventHandlerContext context) {
        JSONObject jsonPattern = null;
        if (context.parameterExists("pattern")) {
            jsonPattern = context.getJSONObject("pattern");
        }
        
        final HighlightPattern pattern = fromJson(jsonPattern);
        
        context.addResponseParameter("jsonExpression",
            HighlightPatternUtilities.encodePattern(pattern));
    }
    
    public HighlightPattern fromJson(final JSONObject jsonPattern) {
        final int style = jsonPattern.getInt("style");
        
        int colorIndex = -1;
        if (jsonPattern.has("colorIndex") && !"".equals(jsonPattern.getString("colorIndex"))) {
            colorIndex = jsonPattern.getInt("colorIndex");
        }
        
        String rgbColor = "";
        if (jsonPattern.has("rgbColor")) {
            rgbColor = jsonPattern.getString("rgbColor");
        }
        
        String patternName = "";
        if (jsonPattern.has("patternName")) {
            patternName = jsonPattern.getString("patternName");
        }
        
        float scale = 120.000f;
        if (jsonPattern.has("scale")) {
            scale = (float) jsonPattern.getDouble("scale");
        }
        
        float angle = 0.000f;
        if (jsonPattern.has("angle")) {
            angle = (float) jsonPattern.getDouble("angle");
        }
        
        String gradientName = "";
        if (jsonPattern.has("gradientName")) {
            gradientName = jsonPattern.getString("gradientName");
        }
        
        String centerOffset = "";
        if (jsonPattern.has("centerOffset")) {
            centerOffset = jsonPattern.getString("centerOffset");
        }
        
        String gradientColor0 = "";
        if (jsonPattern.has("gradientColor0")) {
            gradientColor0 = jsonPattern.getString("gradientColor0");
        }
        
        String gradientValue0 = "";
        if (jsonPattern.has("gradientValue0")) {
            gradientValue0 = jsonPattern.getString("gradientValue0");
        }
        
        String gradientColor1 = "";
        if (jsonPattern.has("gradientColor1")) {
            gradientColor1 = jsonPattern.getString("gradientColor1");
        }
        
        String gradientValue1 = "";
        if (jsonPattern.has("gradientValue1")) {
            gradientValue1 = jsonPattern.getString("gradientValue1");
        }
        
        final HighlightPattern pattern = new HighlightPattern();
        pattern.setStyle(style);
        
        switch (style) {
            case 0:// SOLID
                int rgbColorValue = 0;
                if (!"".equals(rgbColor)) {
                    rgbColorValue = Integer.parseInt(rgbColor.substring(1), 16);
                    pattern.setRgbColor(new Color(rgbColorValue));
                    if (colorIndex == -1) {
                        colorIndex = rgbColorValue;
                    }
                } else if (colorIndex != -1) {
                    rgbColorValue =
                            (int) HighlightPatternUtilities.getColorValueFromColorIndex(colorIndex);
                    pattern.setRgbColor(new Color(rgbColorValue));
                }
                
                pattern.setColorIndex(colorIndex);
                break;

            case 1:// HATCHED
                rgbColorValue = 0;
                if (!"".equals(rgbColor)) {
                    rgbColorValue = Integer.parseInt(rgbColor.substring(1), 16);
                    pattern.setRgbColor(new Color(rgbColorValue));
                    if (colorIndex == -1) {
                        colorIndex = rgbColorValue;
                    }
                } else if (colorIndex != -1) {
                    rgbColorValue =
                            (int) HighlightPatternUtilities.getColorValueFromColorIndex(colorIndex);
                    pattern.setRgbColor(new Color(rgbColorValue));
                }
                
                pattern.setColorIndex(colorIndex);
                pattern.setPatternName(patternName);
                pattern.setScale(scale);
                pattern.setAngle(angle);
                break;

            case 3:// GRADIENT
                pattern.setGradientType(gradientName);
                pattern.setAngle(angle);
                pattern.setCenterOffset((float) Double.parseDouble(centerOffset));
                pattern.setGradientColors(
                    new Color(Integer.parseInt(gradientColor0.substring(1), 16)),
                    new Color(Integer.parseInt(gradientColor1.substring(1), 16)));
                pattern.setGradientValues(Float.parseFloat(gradientValue0),
                    Float.parseFloat(gradientValue1));
                break;
        }
        
        return pattern;
    }
    
    /**
     * decode highlight pattern according patternString
     */
    public void decodePattern(final EventHandlerContext context) {
        String patternString = "";
        if (context.parameterExists("patternString")) {
            patternString = context.getString("patternString");
        }
        
        final HighlightPattern pattern = HighlightPatternUtilities.decodePattern(patternString);
        
        context.addResponseParameter("jsonExpression", toJson(pattern));
    }
    
    /**
     * get the "Use Web Central-style RGB Encoding?" value from afm_acitivity_param table. the
     * default is 1 (Use WebC Encoding).
     *
     */
    public static void getHighlightRGBColorEncoding(final EventHandlerContext context) {
        // retrieve the value from afm_acitivity_param table
        final int highlightRGBEncoding = HighlightPatternUtilities.getHighlightRGBColorEncoding();
        
        // return the value to the client
        context.addResponseParameter("message", Integer.toString(highlightRGBEncoding));
        
    }
    
    private String toJson(final HighlightPattern pattern) {
        if (pattern == null) {
            return "(null)";
        }
        
        final JSONObject jsonPattern = new JSONObject();
        jsonPattern.put("style", pattern.getStyle().name());
        if ("SOLID".equals(pattern.getStyle().name())) {
            jsonPattern.put("colorIndex", pattern.getColorIndex());
            jsonPattern.put("rgbColor",
                getColorHexString(HighlightPatternUtilities.getRgbColor(pattern)));
        }
        if ("HATCHED".equals(pattern.getStyle().name())) {
            jsonPattern.put("colorIndex", pattern.getColorIndex());
            jsonPattern.put("rgbColor",
                getColorHexString(HighlightPatternUtilities.getRgbColor(pattern)));
            jsonPattern.put("patternName", pattern.getPatternName());
            jsonPattern.put("scale", pattern.getScale());
            jsonPattern.put("angle", pattern.getAngle());
        }
        
        if ("GRADIENT".equals(pattern.getStyle().name())) {
            jsonPattern.put("gradientName", pattern.getGradientType().toString());
            jsonPattern.put("angle", pattern.getAngle());
            jsonPattern.put("centerOffset", pattern.getCenterOffset());
            final Color gradientColor0 = pattern.getGradientColors()[0];
            final Color gradientColor1 = pattern.getGradientColors()[1];
            
            jsonPattern.put("gradientColor0", getColorHexString(gradientColor0));
            jsonPattern.put("gradientValue0", pattern.getGradientValues()[0]);
            jsonPattern.put("gradientColor1", getColorHexString(gradientColor1));
            jsonPattern.put("gradientValue1", pattern.getGradientValues()[1]);
        }
        
        return jsonPattern.toString();
    }
    
    /**
     * get hex string of the Color
     */
    private String getColorHexString(final Color color) {
        String hexBlue = Integer.toHexString(color.getBlue());
        String hexGreen = Integer.toHexString(color.getGreen());
        String hexRed = Integer.toHexString(color.getRed());
        
        if (hexBlue.length() == 1) {
            hexBlue += "0";
        }
        if (hexGreen.length() == 1) {
            hexGreen += "0";
        }
        if (hexRed.length() == 1) {
            hexRed += "0";
        }
        
        return hexRed + hexGreen + hexBlue;
    }
    
    public void createHatchPattern(final EventHandlerContext context) {
        String tableName = null;
        if (context.parameterExists("tableName")) {
            tableName = context.getString("tableName");
        }
        
        String highlightPatternField = null;
        if (context.parameterExists("highlightPatternField")) {
            highlightPatternField = context.getString("highlightPatternField");
        }
        
        Boolean useOnlyColors = true;
        if (context.parameterExists("useOnlyColors")) {
            useOnlyColors = context.getBoolean("useOnlyColors");
        }
        
        String sortField = null;
        if (context.parameterExists("sortField")) {
            sortField = context.getString("sortField");
        }
        
        String clientRestrictions = null;
        if (context.parameterExists("clientRestrictions")) {
            clientRestrictions = context.getString("clientRestrictions");
        }
        
        Boolean onlyUpdateIfNull = true;
        if (context.parameterExists("onlyUpdateIfNull")) {
            onlyUpdateIfNull = context.getBoolean("onlyUpdateIfNull");
        }
        
        createHatchPatterns(tableName, highlightPatternField, useOnlyColors, sortField,
            clientRestrictions, onlyUpdateIfNull);
    }
    
    // WFR to generate hatchpatterns
    public void createHatchPatterns(final String tableName, final String highlightPatternField,
            final boolean useOnlyColors, final String sortField, final String clientRestrictions,
            final boolean onlyUpdateIfNull) {

        // create the datasource
        final DataSource dataSource = DataSourceFactory.createDataSource();
        
        dataSource.addTable(tableName);
        dataSource.addField(highlightPatternField);
        // add all pkeyfields of the given table to the datasource
        
        final Project.Immutable project = ContextStore.get().getProject();
        final List<String> pkeyFields =
                DataSourceImpl.getPKeyFieldNamesForTable(tableName, project);
        for (final String field : pkeyFields) {
            // remove tablename. prefix from the field name
            dataSource.addField(field.substring(field.indexOf(".") + 1));
        }
        // add sortfield to the datasource (if given)
        if (StringUtil.notNullOrEmpty(sortField)) {
            dataSource.addField(sortField);
            dataSource.addSort(sortField);
        }
        
        // get all datarecords
        final List<DataRecord> records = dataSource.getRecords(clientRestrictions);
        
        final Map<String, HatchPattern> hatchPatterns = HighlightImageUtilities.getHatchPatterns();
        
        int i = 0;
        final List<Integer> usedColors = new ArrayList<Integer>();
        
        // sortField given
        if (StringUtil.notNullOrEmpty(sortField)) {
            Object sortValue = null;
            int j = 0;
            int k = 0;
            Integer baseColor = null;
            
            for (final DataRecord record : records) {
                final HighlightPattern hlPat = new HighlightPattern();
                
                if (sortValue == null
                        || !sortValue.equals(record.getValue(tableName + "." + sortField))) {
                    if (sortValue != null) {
                        i++;
                        
                        j = 0;
                        k = 0;
                    }
                    sortValue = record.getValue(tableName + "." + sortField);
                    
                    // for each sortValue generate a new 'base color'
                    if (i < FIXEDCOLORS.length) {
                        baseColor = Integer.parseInt(FIXEDCOLORS[i].substring(2), 16);
                    } else {
                        baseColor = Integer
                            .parseInt(FIXEDCOLORS[i % FIXEDCOLORS.length].substring(2), 16) + 32;
                    }
                    while (usedColors.contains(baseColor)) {
                        baseColor += 16;
                    }
                }
                
                if (useOnlyColors) {// only colors => related colors are used per sortField value
                    hlPat.setStyle(HighlightPatternUtilities.FillStyle.SOLID.toString());
                    Integer color = 0;
                    if (i < FIXEDCOLORS.length) {
                        color = baseColor + (j * 32);
                    } else {
                        color = baseColor + (j * 64);
                    }
                    // make sure all colors used are different
                    while (usedColors.contains(color)) {
                        color += 16;
                    }
                    hlPat.setRgbColor(new Color(color));
                    usedColors.add(color);
                } else {// colors and hatchpatterns
                    // => same color + different pattern per sortField value
                    final String[] hPatternNames = hatchPatterns.keySet().toArray(new String[] {});
                    hlPat.setRgbColor(new Color(baseColor));
                    usedColors.add(baseColor);
                    
                    if (j < hatchPatterns.size()) {
                        final String patternName = hPatternNames[j];
                        hlPat.setPatternName(patternName);
                        hlPat.setScale(hatchPatterns.get(patternName).getScale());
                        hlPat.setStyle("HATCHED");
                        hlPat.setAngle(0);
                    } else { // if all patterns are used once, change scale and/or angle
                        if (k < hatchPatterns.size()) {
                            final String patternName = hPatternNames[j % hatchPatterns.size()];
                            hlPat.setPatternName(patternName);
                            hlPat.setScale(hatchPatterns.get(patternName).getScale());
                            hlPat.setStyle("HATCHED");
                            hlPat.setAngle(45);
                        } else if (k + 1 < hatchPatterns.size() * 2) {
                            final String patternName = hPatternNames[j % hatchPatterns.size()];
                            hlPat.setPatternName(patternName);
                            hlPat.setScale(hatchPatterns.get(patternName).getScale() * 2);
                            hlPat.setStyle("HATCHED");
                            hlPat.setAngle(0);
                        } else {
                            final String patternName = hPatternNames[j % hatchPatterns.size()];
                            hlPat.setPatternName(patternName);
                            hlPat.setScale(hatchPatterns.get(patternName).getScale() * 2);
                            hlPat.setStyle("HATCHED");
                            hlPat.setAngle(45);
                        }
                        k++;
                    }
                }
                
                if (!(onlyUpdateIfNull
                        && record.getValue(tableName + "." + highlightPatternField) != null)) {
                    record.setValue(tableName + "." + highlightPatternField,
                        HighlightPatternUtilities.encodePattern(hlPat));
                    dataSource.saveRecord(record);
                }
                
                j++;
            } // end for
        } else { // no sortField given
            for (final DataRecord record : records) {
                final HighlightPattern hlPat = new HighlightPattern();
                hlPat.setStyle(HighlightPatternUtilities.FillStyle.SOLID.toString());
                
                if (useOnlyColors) {
                    Integer color = 0;
                    if (i < FIXEDCOLORS.length) {
                        color = Integer.parseInt(FIXEDCOLORS[i].substring(2), 16);
                        
                    } else {
                        color = Integer.parseInt(FIXEDCOLORS[i % FIXEDCOLORS.length].substring(2),
                            16) + 32;

                    }
                    while (usedColors.contains(color)) {
                        color += 16;
                    }
                    hlPat.setRgbColor(new Color(color));
                    usedColors.add(color);
                    
                } else { // use patterns
                    final String[] hPatternNames = hatchPatterns.keySet().toArray(new String[] {});
                    if (i < hatchPatterns.size()) {
                        hlPat.setRgbColor(new Color(Integer
                            .parseInt(FIXEDCOLORS[i % FIXEDCOLORS.length].substring(2), 16)));

                        final String patternName = hPatternNames[i];
                        hlPat.setPatternName(patternName);
                        hlPat.setScale(hatchPatterns.get(patternName).getScale());
                        hlPat.setStyle("HATCHED");
                        hlPat.setAngle(0);
                    } else { // choose pattern with other color
                        final int tmp = hatchPatterns.size() / i;
                        // if all patterns are used once, change scale and/or angle
                        if (i < hatchPatterns.size() * 2) {
                            final String patternName = hPatternNames[i % hatchPatterns.size()];
                            hlPat.setPatternName(patternName);
                            hlPat.setScale(hatchPatterns.get(patternName).getScale());
                            hlPat.setStyle("HATCHED");
                            hlPat.setAngle(45);
                        } else if (i < hatchPatterns.size() * 3) {
                            final String patternName = hPatternNames[i % hatchPatterns.size()];
                            hlPat.setPatternName(patternName);
                            hlPat.setScale(hatchPatterns.get(patternName).getScale() * 2);
                            hlPat.setStyle("HATCHED");
                            hlPat.setAngle(0);
                        } else {
                            final String patternName = hPatternNames[i % hatchPatterns.size()];
                            hlPat.setPatternName(patternName);
                            hlPat.setScale(hatchPatterns.get(patternName).getScale() * 2);
                            hlPat.setStyle("HATCHED");
                            hlPat.setAngle(45);
                        }
                        hlPat.setRgbColor(new Color(Integer.parseInt(
                            FIXEDCOLORS[(i + tmp) % FIXEDCOLORS.length].substring(2), 16)));

                    }
                }
                i++;
                if (!(onlyUpdateIfNull
                        && record.getValue(tableName + "." + highlightPatternField) != null)) {
                    record.setValue(tableName + "." + highlightPatternField,
                        HighlightPatternUtilities.encodePattern(hlPat));
                    dataSource.saveRecord(record);
                }
            }
        }
    }
    
    public void createHatchPatternLegend(final EventHandlerContext context) {
        String tableName = "";
        if (context.parameterExists("tableName")) {
            tableName = context.getString("tableName");
        }
        
        String hPatternField = "";
        if (context.parameterExists("highlightPatternField")) {
            hPatternField = context.getString("highlightPatternField");
        }
        
        String clientRestrictions = "";
        if (context.parameterExists("clientRestrictions")) {
            clientRestrictions = context.getString("clientRestrictions");
        }
        
        if (!StringUtil.notNullOrEmpty(tableName)) {
            // @non-translatable
            throw new ExceptionBase("Table name must be provided.");
        }
        
        if (!StringUtil.notNullOrEmpty(hPatternField)) {
            // @non-translatable
            throw new ExceptionBase("Hatch pattern field must be provided.");
        }
        
        createHatchPatternLegends(tableName, hPatternField, clientRestrictions);
    }
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN Clear HatchPattern WFR
    // ---------------------------------------------------------------------------------------------
    
    /**
     * This method serve as a WFR to clear specified hPattern field of restricted records in
     * specified table.
     *
     * @param tableName: table name.
     * @param hPatternField: hPattern field name.
     * @param clientRestrictions: restriction to records of table.
     * @throws ParseException
     * @throws NoSuchElementException
     *
     */
    public void clearHatchPatternLegends(final String tableName, final String hPatternField,
            final String clientRestrictions) {
        final TableDef.Immutable tableDef = ContextStore.get().getProject().loadTableDef(tableName);
        final ArchibusFieldDefBase.Immutable fieldDef = tableDef.findFieldDef(hPatternField);
        if (fieldDef == null) {
            // @non-translatable
            throw new ExceptionBase("Hatch pattern field does not exist.");
        }
        
        if (fieldDef.getArchibusFieldType() != ArchibusFieldType.HIGHLIGHT_PATTERN_ACAD && fieldDef
            .getArchibusFieldType() != ArchibusFieldType.HIGHLIGHT_PATTERN_ACAD_EXT) {
            // @non-translatable
            throw new ExceptionBase(
                "The field you provided is not defined as an ACAD highlight pattern field.");
        }
        
        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable(tableName);
        
        String clearSql = "Update " + tableName + " SET " + hPatternField + "=null ";
        if (StringUtil.notNullOrEmpty(clientRestrictions)
                && !"null".equalsIgnoreCase(clientRestrictions)) {
            clearSql += " WHERE " + clientRestrictions;
        }
        ds.addQuery(clearSql);
        ds.executeUpdate();
        ds.commit();
    }
    
    public void createHatchPatternLegends(final String tableName, final String hPatternField,
            final String clientRestrictions) {
        final TableDef.Immutable tableDef = ContextStore.get().getProject().loadTableDef(tableName);
        final ArchibusFieldDefBase.Immutable fieldDef = tableDef.findFieldDef(hPatternField);
        if (fieldDef == null) {
            // @non-translatable
            throw new ExceptionBase("Hatch pattern field does not exist.");
        }
        
        if (fieldDef.getArchibusFieldType() != ArchibusFieldType.HIGHLIGHT_PATTERN_ACAD && fieldDef
            .getArchibusFieldType() != ArchibusFieldType.HIGHLIGHT_PATTERN_ACAD_EXT) {
            // @non-translatable
            throw new ExceptionBase(
                "The field you provided is not defined as an ACAD highlight pattern field.");
        }
        
        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable(tableName);
        final PrimaryKey.Immutable primaryKey = tableDef.getPrimaryKey();
        for (final ArchibusFieldDefBase.Immutable pkFieldDef : primaryKey.getFields()) {
            ds.addField(pkFieldDef.getName());
        }
        ds.addField(hPatternField);
        
        // XXX: TODO: ceheck if graphicFolder could be URL????
        // legend should go into graphics folder
        final String legendPath =
                HighLightUtilities.getLocalPath(ContextStore.get().getProject().getGraphicsFolder())
                        + '/';

        // create folder if not
        FileUtil.createFoldersIfNot(legendPath);
        
        final ReportPropertiesDef reportPropertiesDef =
                ReportUtility.getReportPropertiesDef(ContextStore.get());

        final LegendGenerator legendGenerator =
                new LegendGenerator(HighlightImageFormat.PNG, reportPropertiesDef, null);
        legendGenerator.generateLegends(ds, clientRestrictions, legendPath);
    }
    
    public void getHatchPatterns(final EventHandlerContext context) {
        final JSONArray patterns = new JSONArray();
        
        for (final Map.Entry<String, HatchPattern> entry : HighlightImageUtilities
            .getHatchPatterns().entrySet()) {
            final HatchPattern pattern = entry.getValue();
            patterns.put(pattern.toJson());
        }
        
        context.addResponseParameter("jsonExpression", patterns.toString());
    }
    
}
