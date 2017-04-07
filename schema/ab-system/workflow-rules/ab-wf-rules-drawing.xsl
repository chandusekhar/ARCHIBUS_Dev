<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- importing xsl files -->
  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../xsl/constants.xsl" />
  <xsl:template match="/">
    <xsl:variable name="selected_activity_id" select="//afmTableGroup/dataSource/data/records/record/@afm_wf_rules.activity_id"/>
    <xsl:variable name="selected_rule_id" select="//afmTableGroup/dataSource/data/records/record/@afm_wf_rules.rule_id"/>
    <xsl:variable name="drawing_name" select="//afmTableGroup/dataSource/data/records/record/@afm_wf_rules.dwgname"/>
    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="drawingSuffix">
         <xsl:if test="$isDynamicHighlights='true'">-absystemworkflow.dwf</xsl:if>
         <xsl:if test="$isDynamicHighlights!='true'">.dwf</xsl:if>
    </xsl:variable>
    <xsl:variable name="absoluteAppPath_expressViewer5" select="//preferences/@absoluteAppPath"/>
    <xsl:variable name="isDwfViewer7" select="//preferences/@dwfViewer7"/>
    <html>
      <head>
        <title>
          <xsl:value-of select="/*/title" />
          <xsl:value-of select="$whiteSpace" />
        </title>
	<STYLE>
	  .visShow { visibility:visible }
	  .visHide { visibility:hidden }
	</STYLE>

        <xsl:call-template name="LinkingCSS" />

        <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace" /></script>

       <xsl:call-template name="HighlightEvents"/>

        <script language="JScript" type="text/jscript" src="{$abSchemaSystemJavascriptFolder}/dwf-highlight/activateActiveX_onload.js"><xsl:value-of select="$whiteSpace" /></script>
        <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wf-rules-drawing.js"><xsl:value-of select="$whiteSpace"/></script>

        <script language="javascript">
          var strTargetView = 'ab-wf-rules-edit.axvw';
          var strTargetFrame = '';
          var strTargetTable = 'afm_wf_rules';
          var strLayersOn = 'WF;WF$;WF$TXT;WF-FLOW;Z-WF-DHL';
          var strLayersOff = '';
          var strBaseDrawingName = '<xsl:value-of select="$drawing_name"/>';
          var strDrawingName = '<xsl:value-of select="$projectDrawingsFolder"/>'+'/'+'<xsl:value-of select="$drawing_name"/>'+'<xsl:value-of select="$drawingSuffix"/>';

          strDynamicHighlight = '<xsl:value-of select="//preferences/@dynamicDrawingHighlights"/>';
          var strMainTable = '<xsl:value-of select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>';
            <xsl:call-template name="HighlightHandler">
                  <xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
            </xsl:call-template>
        </script>
     </head>

      <body onload="loadDwfViewer('640', '480', '{$absoluteAppPath_expressViewer5}', '{$isDwfViewer7}');loadDrawing();" class="body" leftmargin="0" rightmargin="0" topmargin="0">
        <xsl:call-template name="table-group-title">
          <xsl:with-param name="title" select="/*/afmTableGroup/title" />
        </xsl:call-template>

        <table align="center" width="100%" valign="top" cellpadding="0">
          <tr>
            <td align="center">
              <div id="highlightMessage" class="visHide">
              <span class="instructionText">
                Record Highlighted: <xsl:value-of select="$selected_activity_id"/>-<xsl:value-of select="$selected_rule_id"/>
              </span>
              </div>
              <!-- This loading text gives user feedback while the DWF loads
                   Its visibility is controled by the javascript. -->
              <div id="loadingMessage" class="visHide"><span translatable="true">Loading...</span></div>
              <!-- The Express Viewer ActiveX object is here -->
              <div id="dwfViewerControl"></div>
            </td>
          </tr>
          <tr>
            <!-- Help text -->
            <td id="instructionText" class="instruction" align="center">
		<!--  A message element with the name 'instructionText' should be present in the AXVW file.  -->
		<xsl:value-of select="//message[@name='instructionText']" />
                <!-- localized strings used by javascript: ab-express-viewer-drawing.js -->
                <span translatable="true" id="ab_express_viewer_drawing_strLoadError1" name="ab_express_viewer_drawing_strLoadError1" style="display:none">Express Viewer is unable to load the file: </span>
                <span translatable="true" id="ab_express_viewer_drawing_strLoadError2" name="ab_express_viewer_drawing_strLoadError2" style="display:none">Please contact your system administrator.</span>
                <span translatable="true" id="ab_express_viewer_drawing_strLoadError3" name="ab_express_viewer_drawing_strLoadError3" style="display:none">The selected drawing file does not exist: </span>
                <span translatable="true" id="ab_express_viewer_drawing_strLoadError4" name="ab_express_viewer_drawing_strLoadError4" style="display:none">There is no drawing file associated with the selected item.</span>
		<span translatable="true" id="ab_express_viewer_drawing_strWarningMessage" name="ab_express_viewer_drawing_strWarningMessage" style="display:none">DWF Viewer failed to load. ARCHIBUS Web Central supports DWF drawings on Internet Explorer 6 or later.  If you are using a supported browser, contact your system administrator to install the Autodesk DWF Viewer.</span>
            </td>
          </tr>
        </table>
      </body>
    </html>
  </xsl:template>

  <xsl:include href="../xsl/common.xsl" />
  <xsl:include href="../xsl/dwf-highlight/ab-dwf-highlight-common.xsl" />
</xsl:stylesheet>
