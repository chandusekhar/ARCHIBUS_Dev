package com.archibus.app.common.mobile.sync.dao;

import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.TableDef;

/**
 * DAO for operations on document fields.
 * <p>
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public interface IDocumentFieldsDao {
    /**
     * Represents business data record and corresponding DTO.
     */
    class RecordAndDto {
        /**
         * Property: record.
         */
        private DataRecord record;

        /**
         * Property: DTO for the record.
         */
        private Record recordDto;

        /**
         * Constructor specifying record, recordDto.
         *
         * @param record record.
         * @param recordDto DTO for the record.
         */
        public RecordAndDto(final DataRecord record, final Record recordDto) {
            this.record = record;
            this.recordDto = recordDto;
        }

        /**
         * Getter for the record property.
         *
         * @see record
         * @return the record property.
         */
        public DataRecord getRecord() {
            return this.record;
        }

        /**
         * Getter for the recordDto property.
         *
         * @see recordDto
         * @return the recordDto property.
         */
        public Record getRecordDto() {
            return this.recordDto;
        }

        /**
         * Setter for the record property.
         *
         * @see record
         * @param record the record to set
         */

        public void setRecord(final DataRecord record) {
            this.record = record;
        }

        /**
         * Setter for the recordDto property.
         *
         * @see recordDto
         * @param recordDto the recordDto to set
         */

        public void setRecordDto(final Record recordDto) {
            this.recordDto = recordDto;
        }
    }

    /**
     * Checks-in content of all document fields in DTO. If the content of a field is "MARK_DELETED",
     * marks document as deleted.
     *
     * @param tableDef of the sync table.
     * @param recordAndDto record to get the primary key values from; DTO with document field values
     *            to be checked-in. Expected to contain pairs of fields like "doc1",
     *            "doc1_contents". "doc1" should contain file name, "doc1_contents" should contain
     *            document content.
     */
    void checkInDocumentFields(final TableDef.ThreadSafe tableDef, RecordAndDto recordAndDto);

    /**
     * Checks-out content of all document fields in recordToSave.
     * <p>
     * Does not lock the document field. Checks-out the last version of the documents.
     *
     * @param tableDef of the sync table.
     * @param recordAndDto record to get the primary key values from, and to get fileName from field
     *            with name like "doc1"; DTO with checked-out document field values.
     * @param includeDocumentData when true, document data is populated in the doc_contents field.
     *            When false, the 'doc_contents' field contains null.
     */
    void checkOutDocumentFields(final TableDef.ThreadSafe tableDef, RecordAndDto recordAndDto,
            boolean includeDocumentData);
}
