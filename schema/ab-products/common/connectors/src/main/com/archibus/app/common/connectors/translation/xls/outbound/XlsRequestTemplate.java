package com.archibus.app.common.connectors.translation.xls.outbound;

import java.io.*;
import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.connectors.translation.common.outbound.IWrappedRequestTemplate;
import com.archibus.app.common.connectors.translation.common.outbound.impl.*;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.ext.report.xls.XlsBuilder.FileFormatType;

/**
 * A template for generating an Excel file.
 *
 * @author Catalin Purice
 *
 */
public class XlsRequestTemplate extends AbstractDataSourceRequestTemplate<InputStream>
        implements IWrappedRequestTemplate<InputStream> {

    /**
     * The order in which fields should appear in the record, by name.
     */
    private final List<XlsField> fieldDefOrder;

    /**
     * XLS builder.
     */
    private final XlsGenerator xlsGenerator;

    /**
     * Text qualifier.
     */
    private final String textQualifier;

    /**
     * The type of XLS file to export.
     */
    private final FileFormatType fileFormatType;

    /**
     *
     * Constructor.
     *
     * @param dataSourceParam data source
     * @param fieldDefOrder field names to export
     * @param sheetName source table
     * @param connParams connector parameters
     * @param textQualifier text qualifier
     * @param fileFormatType the type of file to be output.
     */
    public XlsRequestTemplate(final String dataSourceParam, final List<XlsField> fieldDefOrder,
            final String sheetName, final JSONObject connParams, final String textQualifier,
            final FileFormatType fileFormatType) {
        super(dataSourceParam);
        this.fieldDefOrder = fieldDefOrder;
        this.textQualifier = textQualifier;
        this.xlsGenerator = new XlsGenerator(sheetName, connParams);
        this.fileFormatType = fileFormatType;
    }

    /**
     * {@inheritDoc}
     * <p>
     * Generate header of XLS for wrapping a series of records.
     *
     * @param templateParameters presently ignored.
     * @return InputStream with XML element for beginning of records wrapper.
     * @throws TranslationException if an error occurs writing the XLS content to a stream.
     */
    @Override
    public InputStream generateStart(final Map<String, Object> templateParameters)
            throws TranslationException {

        this.xlsGenerator.createWorksheet();

        for (final ListField fieldDef : this.fieldDefOrder) {
            final String titleHeader =
                    this.textQualifier + fieldDef.getFieldName() + this.textQualifier;
            this.xlsGenerator.writeCellTitle(0, this.fieldDefOrder.indexOf(fieldDef), titleHeader);
        }

        return new ByteArrayInputStream(new byte[0]);
    }

    /**
     * {@inheritDoc}
     *
     * @throws IOException
     */
    @Override
    public InputStream generateRequest(final Map<String, Object> requestParameters)
            throws TranslationException {
        final int rowIndex = this.xlsGenerator.getWorksheet().getCells().getMaxDataRow() + 1;
        for (final XlsField fieldDef : this.fieldDefOrder) {

            final Object fieldValue = requestParameters.get(fieldDef.getFieldName());
            this.xlsGenerator.writeCellData(rowIndex, this.fieldDefOrder.indexOf(fieldDef),
                fieldValue, fieldDef.getDataType());
        }
        return new ByteArrayInputStream(new byte[0]);
    }

    /**
     * Saves a generated XLS file to an input stream.
     *
     * @param xlsGenerator a generator for XLS data.
     * @param fileFormatType the format of the data to be generated.
     * @return an InputStream containing the XLS data.
     * @throws TranslationException if an error occurs writing the XLS content to a stream.
     */
    private static InputStream saveToStream(final XlsGenerator xlsGenerator,
            final FileFormatType fileFormatType) throws TranslationException {

        final ByteArrayOutputStream xlsOutput = new ByteArrayOutputStream();
        /*
         * TODO threading?
         */
        xlsGenerator.save(xlsOutput, fileFormatType);
        return new ByteArrayInputStream(xlsOutput.toByteArray());
    }

    /**
     * {@inheritDoc}
     *
     * @throws TranslationException if an error occurs writing the XLS content to a stream.
     */
    @Override
    public InputStream generateEnd(final Map<String, Object> templateParameters)
            throws TranslationException {
        this.xlsGenerator.autoFitColumn(0, 0);

        return saveToStream(this.xlsGenerator, this.fileFormatType);
    }

}
