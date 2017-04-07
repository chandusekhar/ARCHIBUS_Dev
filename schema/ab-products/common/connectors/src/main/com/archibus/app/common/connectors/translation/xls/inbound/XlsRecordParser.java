package com.archibus.app.common.connectors.translation.xls.inbound;

import java.io.*;
import java.util.*;

import com.archibus.app.common.connectors.exception.*;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.*;
import com.archibus.ext.report.xls.XlsBuilder.FileFormatType;
import com.aspose.cells.*;

/**
 * A parser for an input stream that is expected to produce an Excel file.
 *
 * @author Catalin Purice
 *
 */
public class XlsRecordParser implements IRecordParser<InputStream, List<Object>> {

    /**
     * Sheets to be read in.
     */
    private final List<XlsSheetRequest> sheetsToReadIn;

    /**
     * The type of file (XLS vs XLSX).
     */
    private final FileFormatType fileType;

    /**
     * Whether to prepend the sheet name.
     */
    private final boolean prependSheetName;

    /**
     * Constructor.
     *
     * @param sheets Sheets to be read in.
     * @param fileType the type of file (XLS vs XLSX).
     * @param prependSheetName whether to prepend the sheet name.
     */
    public XlsRecordParser(final List<XlsSheetRequest> sheets,
            final XlsBuilder.FileFormatType fileType, final boolean prependSheetName) {
        super();
        this.sheetsToReadIn = sheets;
        this.fileType = fileType;
        this.prependSheetName = prependSheetName;
    }

    /**
     * Constructor.
     *
     * @param sheets Sheets to be read in.
     * @param fileType the type of file (XLS vs XLSX).
     */
    public XlsRecordParser(final List<XlsSheetRequest> sheets,
            final XlsBuilder.FileFormatType fileType) {
        super();
        this.sheetsToReadIn = sheets;
        this.fileType = fileType;
        this.prependSheetName = false;
    }

    /**
     * Essentially this is parseRecords, except it doesn't close the stream. parseRecords is
     * primarily responsible for managing the exceptions and closing the stream.
     *
     * @param stream the character stream to be parsed.
     * @param handler the operation to be performed on records after they are parsed.
     * @throws StepException if an error occurs in the handler.
     */
    @Override
    public void parse(final InputStream stream, final IRecordHandler<List<Object>, ?> handler)
            throws StepException {
        AdaptorException closeXlsStreamException = null;
        try {
            final ImportExportFileBase localXlsBuilder = new ImportExportFileBase(this.fileType);
            localXlsBuilder.open(stream, this.fileType);
            loadWorkbook(localXlsBuilder, handler);
        } finally {
            try {
                stream.close();
            } catch (final IOException e) {
                if (closeXlsStreamException == null) {
                    closeXlsStreamException =
                            new AdaptorException("Unable to close excel stream.", e);
                }
            }
        }
        if (closeXlsStreamException != null) {
            throw closeXlsStreamException;
        }
    }

    /**
     * load all records from Excel file as a map.
     *
     * @param xlsBuilder the XLS builder object
     * @param sheets
     * @param handler the operation to be performed on records after they are parsed
     * @throws StepException if an error occurs in the handler.
     */
    private void loadWorkbook(final ImportExportFileBase xlsBuilder,
            final IRecordHandler<List<Object>, ?> handler) throws StepException {

        for (final XlsSheetRequest xlsSheet : this.sheetsToReadIn) {

            Worksheet sheet;
            if (xlsSheet.getName() == null) {
                sheet = xlsBuilder.getWorkBook().getWorksheets().get(0);
                if (sheet == null) {
                    throw new ConfigurationException("First XLS sheet not found.", null);
                }
            } else {
                sheet = xlsBuilder.getWorkBook().getWorksheets().get(xlsSheet.getName());
                if (sheet == null) {
                    throw new ConfigurationException("XLS sheet not found: " + xlsSheet.getName(),
                        null);
                }
            }

            loadSheet(handler, xlsSheet, sheet);
        }
    }

    /**
     * Load elements from Excel sheet.
     *
     * @param handler output records
     * @param xlsSheet XLS Sheet request
     * @param sheet Excel sheet from file
     * @throws StepException if an error occurs in the handler.
     */
    private void loadSheet(final IRecordHandler<List<Object>, ?> handler,
            final XlsSheetRequest xlsSheet, final Worksheet sheet) throws StepException {

        final Cells cells = sheet.getCells();

        for (int rowIdx = xlsSheet.getStartRow(); rowIdx <= cells.getMaxDataRow(); rowIdx++) {
            final List<Object> fieldValues = new ArrayList<Object>();
            if (this.prependSheetName) {
                fieldValues.add(sheet.getName());
            }
            for (int colIdx = xlsSheet.getStartColumn(); colIdx <= cells.getMaxColumn(); colIdx++) {
                fieldValues.add(cells.get(rowIdx, colIdx).getValue());
            }

            handler.handleRecord(fieldValues);

        }
    }

}
