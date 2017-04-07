package com.archibus.app.common.connectors.impl.file.inbound;

import java.util.Collections;

import com.archibus.app.common.connectors.translation.common.outbound.impl.RequestDef;

/**
 * A TextRequestRecordDef defines a method for translating a record containing a file's identifier
 * into a record containing a java.io.File that can be used by a FileSystemAdaptor.
 * 
 * @author cole
 */
public class FileRequestRecordDef extends RequestDef<FileRequestFieldDefinition> {
    
    /**
     * Create a method for translating a record containing a file's identifier into a record
     * containing a java.io.File that can be used by a FileSystemAdaptor.
     * 
     * @param fileNodeParameter the parameter/field name for the file's identifier.
     */
    public FileRequestRecordDef(final String fileNodeParameter) {
        super(Collections.singletonList(new FileRequestFieldDefinition(fileNodeParameter)));
    }
}
