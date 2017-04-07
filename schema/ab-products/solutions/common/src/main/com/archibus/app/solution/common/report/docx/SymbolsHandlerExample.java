package com.archibus.app.solution.common.report.docx;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;

import javax.imageio.ImageIO;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceFactory;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.drawing.highlight.asset.AssetUtilities;
import com.archibus.ext.drawing.highlight.drawing.SymbolsHandler;
import com.archibus.ext.report.ReportUtility;
import com.archibus.model.view.datasource.*;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.schema.TableDef;
import com.archibus.utility.*;

/**
 *
 * NYP Example symbol handler to draw symbol images into EMF for PDF report.
 *
 *
 * <p>
 *
 *
 * @author Yong Shao
 * @since 22.1
 *
 */
public class SymbolsHandlerExample implements SymbolsHandler {
    /**
     * ALPHA.
     */
    private static final int ALPHA = 255;

    /**
     * ACTIVITY_LOG.
     */
    private static final String ACTIVITY_LOG = "activity_log";
    
    /**
     * ACTIVITY_LOG_ID.
     */
    private static final String ACTIVITY_LOG_ID = "activity_log_id";
    
    /**
     * STATUS.
     */
    private static final String STATUS = "status";
    
    /**
     * PD_ID.
     */
    private static final String PD_ID = "pd_id";
    
    /**
     * LAT_FIELD.
     */
    private static final String LAT_FIELD = "lat";
    
    /**
     * LON_FIELD.
     */
    private static final String LON_FIELD = "lon";
    
    /**
     * AFM_REDLINES.
     */
    private static final String AFM_REDLINES = "afm_redlines";
    
    /**
     * DWG_NAME.
     */
    private static final String DWG_NAME = "dwg_name";

    /**
     * PD_TABLE.
     */
    private static final String PD_TABLE = "pd";

    /**
     * IMG_SYMBOL_DOC.
     */
    private static final String IMG_SYMBOL_DOC = "img_symbol_doc";
    
    /**
     * IMAGE_REDUCED. reduce the size of actual symbol png image by this number.
     */
    private static final int IMAGE_REDUCED = 10;

    /**
     * IMAGE_TITLE_OFFSET.
     */
    private static final int IMAGE_TITLE_OFFSET = 5;
    
    /**
     *
     * Draws symbols over Graphics object.
     *
     *
     * @param emfGraphics java.awt.Graphics.
     * @param reportPropertiesDef ReportPropertiesDef.
     * @param emfScale double.
     * @param publishedJSONHeader JSONObject.
     * @throws ExceptionBase if anything wrong.
     */
    @Override
    public void draw(final java.awt.Graphics emfGraphics,
            final ReportPropertiesDef reportPropertiesDef, final double emfScale,
            final JSONObject publishedJSONHeader) throws ExceptionBase {

        // XXX: if ACTIVITY_LOG table has no PD_ID field, return
        final TableDef.ThreadSafe activityLogTableDef =
                ContextStore.get().getProject().loadTableDef(ACTIVITY_LOG);
        if (activityLogTableDef.findFieldDef(PD_ID) == null) {
            return;
        }

        final com.archibus.datasource.DataSource afmRedlinesDS =
                DataSourceFactory.createDataSource();
        afmRedlinesDS.addTable(AFM_REDLINES);
        afmRedlinesDS.addField(ACTIVITY_LOG_ID);
        afmRedlinesDS.addField(DWG_NAME);
        
        final com.archibus.datasource.DataSource activityLogDS =
                DataSourceFactory.createDataSource();
        activityLogDS.addTable(ACTIVITY_LOG);
        activityLogDS.addField(ACTIVITY_LOG_ID);
        activityLogDS.addField(STATUS);
        activityLogDS.addField(PD_ID);
        activityLogDS.addField(LAT_FIELD);
        activityLogDS.addField(LON_FIELD);
        
        final com.archibus.datasource.DataSource pdDatasource =
                DataSourceFactory.createDataSource();
        pdDatasource.addTable(PD_TABLE);
        pdDatasource.addField(PD_ID);
        pdDatasource.addField(IMG_SYMBOL_DOC);

        final double publishedScale =
                publishedJSONHeader.optDouble(AssetUtilities.ASSET_HEADER_SCALE, 0.0);
        final double extentsMinX =
                publishedJSONHeader.optDouble(AssetUtilities.ASSET_HEADER_EXTENTSMINX, 0.0);
        final double extentsMaxY =
                publishedJSONHeader.optDouble(AssetUtilities.ASSET_HEADER_EXTENTSMAXY, 0.0);
        
        final java.awt.Font font = emfGraphics.getFont();
        emfGraphics.setFont(font.deriveFont(reportPropertiesDef.getLabelHeights().get(
            reportPropertiesDef.getLabelHeights().keySet().iterator().next())));

        final List<ClauseDef> clauses = new ArrayList<ClauseDef>();
        clauses.add(new ClauseDef(AFM_REDLINES, DWG_NAME, reportPropertiesDef.getDrawingName(),
            ClauseDef.Operation.EQUALS));
        final AbstractRestrictionDef restrictionDef = new ParsedRestrictionDef(clauses);
        final List<DataRecord> afmRedlinesRecords = afmRedlinesDS.getRecords(restrictionDef);
        for (final DataRecord afmRedlinesRecord : afmRedlinesRecords) {
            final int activityLogId =
                    afmRedlinesRecord.getInt(AFM_REDLINES + '.' + ACTIVITY_LOG_ID);

            final List<ClauseDef> activityLogClauses = new ArrayList<ClauseDef>();
            activityLogClauses.add(new ClauseDef(ACTIVITY_LOG, ACTIVITY_LOG_ID, activityLogId,
                ClauseDef.Operation.EQUALS));
            final AbstractRestrictionDef activityLogRestrictionDef =
                    new ParsedRestrictionDef(activityLogClauses);
            
            final List<DataRecord> activityLogRecords =
                    activityLogDS.getRecords(activityLogRestrictionDef);

            if (activityLogRecords.isEmpty()) {
                continue;
            }

            final String pdId = activityLogRecords.get(0).getString(ACTIVITY_LOG + '.' + PD_ID);

            final double xPosition =
                    (activityLogRecords.get(0).getDouble(ACTIVITY_LOG + '.' + LON_FIELD) - extentsMinX)
                            * publishedScale;
            final double yPoisition =
                    (extentsMaxY - activityLogRecords.get(0).getDouble(
                        ACTIVITY_LOG + '.' + LAT_FIELD))
                        * publishedScale;
            
            final List<ClauseDef> pdClauses = new ArrayList<ClauseDef>();
            pdClauses.add(new ClauseDef(PD_TABLE, PD_ID, pdId, ClauseDef.Operation.EQUALS));
            final AbstractRestrictionDef pdRestrictionDef = new ParsedRestrictionDef(pdClauses);
            final List<DataRecord> pdRecords = pdDatasource.getRecords(pdRestrictionDef);
            final String imgSymbolDoc = pdRecords.get(0).getString("pd.img_symbol_doc");
            if (StringUtil.notNullOrEmpty(imgSymbolDoc)) {
                draw(emfGraphics, emfScale, activityLogId, activityLogRecords, pdId, xPosition,
                    yPoisition);
            }
        }
        
    }
    
    /**
     *
     * Draws symbol images and their titles.
     *
     * @param emfGraphics Graphics.
     * @param emfScale double.
     * @param activityLogId activityLog_id.
     * @param activityLogRecords List<DataRecord> .
     * @param pdId pd_id.
     * @param xPosition x position.
     * @param yPoisition y position.
     */
    private void draw(final java.awt.Graphics emfGraphics, final double emfScale,
            final int activityLogId, final List<DataRecord> activityLogRecords, final String pdId,
            final double xPosition, final double yPoisition) {
        final Map<String, String> keys = new HashMap<String, String>();
        keys.put(PD_ID, pdId);
        try {
            final com.archibus.context.Context context = ContextStore.get();

            final InputStream symbolStream =
                    ReportUtility.getImage(PD_TABLE, IMG_SYMBOL_DOC, keys, context);
            
            final String status =
                    activityLogRecords.get(0).getNeutralValue(ACTIVITY_LOG + '.' + STATUS);
            final Integer symbolColor = getSymbolColor(status);
            final BufferedImage symbol = ImageIO.read(symbolStream);
            
            // TODO: image size should be proportional to target floor plan size???
            // one solution is to pass reduced number by JS since JS could hard-code it by
            // checking each floor plan.
            emfGraphics.drawImage(changeSymbolImageColor(symbol, symbolColor),
                (int) (xPosition * emfScale), (int) (yPoisition * emfScale), symbol.getWidth()
                        / IMAGE_REDUCED, symbol.getHeight() / IMAGE_REDUCED, null);
            
            // draw symbol title
            emfGraphics.drawString(StringUtil.notNull(activityLogId), (int) (xPosition * emfScale)
                    + symbol.getWidth() / IMAGE_REDUCED / 2 + IMAGE_TITLE_OFFSET,
                (int) (yPoisition * emfScale) + symbol.getHeight() / IMAGE_REDUCED / 2);
        } catch (final IOException e) {
            throw new ExceptionBase();
        }
    }
    
    /**
     *
     * Changes symbol image's color (black part to specified color).
     *
     * @param image BufferedImage.
     * @param colorCode color Code determined by activity_log.status value.
     * @return BufferedImage.
     */
    public BufferedImage changeSymbolImageColor(final BufferedImage image, final Integer colorCode) {
        if (colorCode != null) {
            final int width = image.getWidth();
            final int height = image.getHeight();

            for (int xx = 0; xx < width; xx++) {
                for (int yy = 0; yy < height; yy++) {
                    final Color originalColor = new Color(image.getRGB(xx, yy));
                    if (originalColor.equals(Color.BLACK) && originalColor.getAlpha() == ALPHA) {
                        image.setRGB(xx, yy, colorCode);
                    }
                }
            }
        }

        return image;

    }
    
    /**
     *
     * Gets SymbolColor based on specified status.
     *
     * @param status activity_log.status.
     * @return Integer.
     */
    private Integer getSymbolColor(final String status) {
        final Map<String, Integer> symbolColors = new HashMap<String, Integer>();
        symbolColors.put("CREATED", Integer.valueOf(Color.RED.getRGB()));
        symbolColors.put("APPROVED", Integer.valueOf(Color.RED.getRGB()));
        symbolColors.put("IN PROGRESS", Integer.valueOf(Color.RED.getRGB()));
        symbolColors.put("IN-PORGRESS-H", Integer.valueOf(Color.RED.getRGB()));

        symbolColors.put("COMPLETED", Integer.valueOf(Color.GREEN.getRGB()));
        symbolColors.put("COMPLETED-V", Integer.valueOf(Color.GREEN.getRGB()));
        symbolColors.put("CLOSED", Integer.valueOf(Color.GREEN.getRGB()));
        
        return symbolColors.get(status);
    }
}
