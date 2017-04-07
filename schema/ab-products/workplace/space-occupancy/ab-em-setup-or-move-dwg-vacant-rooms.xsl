<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- importing xsl files -->
  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />
  <xsl:template match="/">
    <xsl:variable name="absoluteAppPath_expressViewer5" select="//preferences/@absoluteAppPath"/>
    <xsl:variable name="isDwfViewer7" select="//preferences/@dwfViewer7"/>
    <html>
      <head>
        <title>
          <!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
          <!-- to generate <title /> if there is no title in source XML -->
          <xsl:value-of select="/*/title" />
          <xsl:value-of select="$whiteSpace" />
        </title>
	<STYLE>.visShow { visibility:visible } .visHide { visibility:hidden }</STYLE>

        <!-- css and javascript files  -->
        <!-- linking path must be related to the folder in which xml is being processed -->
        <!-- calling template LinkingCSS in common.xsl -->
        <xsl:call-template name="LinkingCSS" />
        <!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->
        <!-- <script .../> is not working in html -->
       <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace" /></script>
       <script language="JScript" type="text/jscript" src="{$abSchemaSystemJavascriptFolder}/dwf-highlight/activateActiveX_onload.js"><xsl:value-of select="$whiteSpace" /></script>

	<xsl:call-template name="HighlightEvents"/>
	 <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-em-setup-or-move-dwg-vacant-rooms.js"><xsl:value-of select="$whiteSpace" /></script>
        <script language="javascript">
		projectDrawingsFolder='<xsl:value-of select="$projectDrawingsFolder"/>';
		str_bl_id='<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.bl_id"/>';
		str_fl_id='<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.fl_id"/>';

                strDrawingName='<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record[@rm.dwgname!='']/@rm.dwgname"/>';
                var strDynamicHighlight = '<xsl:value-of select="//preferences/@dynamicDrawingHighlights"/>';
                var strMainTable = '<xsl:value-of select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>';
                var DWF_defaultHighlightColor='<xsl:value-of select="//preferences/@dwfDefaultHighlightColor"/>';
                <xsl:call-template name="HighlightHandler">
			<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
		</xsl:call-template>

      </script>

      </head>
      <body   class="body" onload="setUpDWFFileLink();loadDwfViewer('400', '350', '{$absoluteAppPath_expressViewer5}', '{$isDwfViewer7}');loadDrawing();" leftmargin="0" rightmargin="0" topmargin="0">

		<!-- Localization messages -->
		<span translatable="true" id="express_viewer" name="express_viewer" style="display:none">Express Viewer is unable to load the file:\n</span>
		<span translatable="true" id="contact_administrator" name="contact_administrator" style="display:none">\nPlease contact your system administrator.</span>
		<span translatable="true" id="file_not_exist" name="file_not_exist" style="display:none">The selected drawing file does not exist:</span>
		<span translatable="true" id="no_drawing" name="no_drawing" style="display:none">There is no drawing file associated with the selected item.</span>

		<table align="center" width="100%" valign="top">
			<tr valign="top">
				<td align="center" valign="top">
					<div id="loadingMessage" class="visHide"><span translatable="true">Loading...</span></div>
                                        <div id="dwfViewerControl"></div>
				</td>
			</tr>
			<tr valign="top">
				<td id="instructionText" class="instruction" align="center" valign="top">
					<xsl:value-of select="/*/message[@name='instructionText']" />
                                        <span translatable="true" id="ab_express_viewer_drawing_strWarningMessage" name="ab_express_viewer_drawing_strWarningMessage" style="display:none">DWF Viewer failed to load. ARCHIBUS Web Central supports DWF drawings on Internet Explorer 6 or later.  If you are using a supported browser, contact your system administrator to install the Autodesk DWF Viewer.</span>
				</td>
			</tr>
			<tr valign="top">
				<td class="instruction" align="center" valign="top">
					<form>
						<input class="AbActionButtonFormStdWidth"  type="button" value="{/*/message[@name='close']}" onclick="window.close()"/>
					</form>
				</td>
			</tr>
		</table>
      </body>
    </html>
  </xsl:template>
  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/dwf-highlight/ab-dwf-highlight-common.xsl" />
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
