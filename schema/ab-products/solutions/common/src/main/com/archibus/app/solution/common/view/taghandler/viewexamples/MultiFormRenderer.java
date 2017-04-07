package com.archibus.app.solution.common.view.taghandler.viewexamples;

import com.archibus.view.taghandler.render.panel.PanelRendererForm;

/**
 * Example of custom form panel that display multiple rows with fields.
 * 
 * @author Sergey Kuramshin
 */
public class MultiFormRenderer extends PanelRendererForm {
    
    /**
     * Counts label rows when generateLabelRowHtml() method is called.
     */
    private int labelRowCounter;
    
    /**
     * Generates HTML for label rows. Hides all label rows except for the first one.
     * 
     * @return The HTML.
     */
    @Override
    protected String getLabelRowHtml() {
        String html = super.getLabelRowHtml();
        
        if (this.labelRowCounter > 0) {
            html = "<tr class='labelRow' style='display:none'>";
        }
        
        this.labelRowCounter++;
        
        return html;
    }
}