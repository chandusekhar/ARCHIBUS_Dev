package com.archibus.service.common;

import java.util.regex.*;

/**
 * FreeMakerTemplatePreProcessService: dynamically replace the variables in the template before
 * passing it to FreeMarker.
 * 
 * @author Zhang Yi
 * @since Bali1
 * 
 */
public final class FreeMakerTemplatePreProcessor {
    
    /**
     * regex pattern used to look for ${table.field}.
     */
    static final String EQUAL_TABLE_FIELD_PATTERN =
            "\\$[{][a-zA-Z][a-zA-Z_]*[\\.][a-zA-Z][a-zA-Z_]*[}]";
    
    /**
     * Constructor.
     * 
     */
    private FreeMakerTemplatePreProcessor() {
    }
    
    /**
     * Replace all ${table.field} references with ${table.field!""} in template text.
     * 
     * @param template String input template text for pre-processing.
     * 
     * @return pre-processed template text.
     */
    public static String preProcessTemplate(final String template) {
        
        final Pattern pattern = Pattern.compile(EQUAL_TABLE_FIELD_PATTERN);
        final Matcher matcher = pattern.matcher(template);
        
        final StringBuilder result = new StringBuilder();
        
        int beginIndex = 0;
        while (matcher.find()) {
            
            // extract string before marched and after previous matched
            final int endIndex = matcher.start();
            result.append(template.substring(beginIndex, endIndex));
            
            // extract and process matched string
            final String group = matcher.group();
            result.append(group.substring(0, group.length() - 1));
            result.append("!\"\"}");
            
            // adjust begin index for string between current and next matched one
            beginIndex = matcher.end();
        }
        result.append(template.substring(beginIndex));
        
        return result.toString();
        
    }
}
