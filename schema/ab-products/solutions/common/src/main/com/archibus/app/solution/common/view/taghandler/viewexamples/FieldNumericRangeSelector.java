package com.archibus.app.solution.common.view.taghandler.viewexamples;

import com.archibus.utility.ExceptionBase;
import com.archibus.view.taghandler.CustomFieldSimpleTag;

public class FieldNumericRangeSelector extends CustomFieldSimpleTag {
    
    /*
     * (non-Javadoc)
     * 
     * @see com.archibus.viewTagHandler.FieldSimpleTag#doTag()
     */
    @Override
    public void doTag() throws ExceptionBase {
        // always call superclass to engage default field behavior
        super.doTag();
        
        // do not write directly to the output
        // instead, evaluate the tag content into HTML buffer
        final StringBuffer html = new StringBuffer();
        generateRadioButton(html, "emergency", "Emergency");
        generateRadioButton(html, "oneDay", "One Day");
        generateRadioButton(html, "oneWeek", "One Week");
        generateRadioButton(html, "oneMonth", "One Month");
        generateRadioButton(html, "eventually", "Not Urgent");
        
        // save the HTML buffer into superclass
        this.setHtmlContent(html.toString());
    }
    
    /**
     * Helper function that generates HTML for a radio button.
     * 
     * @param html
     * @param optionValue
     * @param optionText
     */
    private void generateRadioButton(final StringBuffer html, final String optionValue,
            String optionText) {
        // use field alias (i.e. "urgency") as radio button name
        final String controlName = getId();
        final String optionName = getId() + "." + optionValue;
        
        // localize visible option title
        optionText = localizeString(optionText);
        html.append("<input type=\"radio\" name=\"" + controlName + "\" id=\"" + optionName
                + "\" value=\"" + optionValue + "\"/><span>" + optionText + "</span><br/>");
    }
}
