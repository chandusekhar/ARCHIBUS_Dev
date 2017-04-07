<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- importing xsl files -->
  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />
  <xsl:template match="/">
	<xsl:variable name="selected_room" select="//afmTableGroup/dataSource/data/records/record/@rm.rm_id"/>
	<xsl:variable name="selected_floor" select="//afmTableGroup/dataSource/data/records/record/@rm.fl_id"/>
	<xsl:variable name="selected_building" select="//afmTableGroup/dataSource/data/records/record/@rm.bl_id"/>
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
       <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace" /></script>
       <script language="JScript" type="text/jscript" src="{$abSchemaSystemJavascriptFolder}/dwf-highlight/activateActiveX_onload.js"><xsl:value-of select="$whiteSpace" /></script>

	<xsl:call-template name="HighlightEvents"/>
	 <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-eq-locate-highlt-drawing.js"><xsl:value-of select="$whiteSpace" /> </script>


	<script language="javascript">
		projectDrawingsFolder='<xsl:value-of select="$projectDrawingsFolder"/>';
		//drawing Name
		strDrawingName='<xsl:value-of select="//afmTableGroup/dataSource/data/records/record/@rm.dwgname"/>';
		//rm's pks
		arrURLPKs['bl_id']='<xsl:value-of select="$selected_building"/>';
		arrURLPKs['fl_id']='<xsl:value-of select="$selected_floor"/>';
		arrURLPKs['rm_id']='<xsl:value-of select="$selected_room"/>';
                var strDynamicHighlight = '<xsl:value-of select="//preferences/@dynamicDrawingHighlights"/>';
                var strMainTable = '<xsl:value-of select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>';
                var DWF_defaultHighlightColor='<xsl:value-of select="//preferences/@dwfDefaultHighlightColor"/>';
                <xsl:call-template name="HighlightHandler">
			<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
		</xsl:call-template>

	</script>
      </head>
      <xsl:variable name="executeTransaction" select="//afmAction[@type='executeTransaction']/@serialized"/>
      <body  onload='strTransactionserialized="{$executeTransaction}";setUpDWFFileLink();loadDwfViewer("400", "350", "{$absoluteAppPath_expressViewer5}", "{$isDwfViewer7}");loadDrawing();'  class="body" leftmargin="0" rightmargin="0" topmargin="0">

		<!-- Localization messages -->
		<span translatable="true" id="express_viewer" name="express_viewer" style="display:none">Express Viewer is unable to load the file:</span>
		<span translatable="true" id="contact_administrator" name="contact_administrator" style="display:none">Please contact your system administrator.</span>
		<span translatable="true" id="file_not_exist" name="file_not_exist" style="display:none">The selected drawing file does not exist:</span>

		<table align="center" width="100%" valign="top">
			<tr valign="top">
				<td id="instruction" class="instruction" align="center" valign="top">
					<span translatable="true">Highlighted Room: </span><xsl:value-of select="concat($selected_building,'-',$selected_floor,'-',$selected_room)"/>
					  <!-- localized strings used by javascript: ab-voloview-drawing.js -->
					<span translatable="true" id="ab_eq_locate_highlt_drawing_strLoadError1" name="ab_eq_locate_highlt_drawing_strLoadError1" style="display:none">Express Viewer is unable to load the file: </span>
					<span translatable="true" id="ab_eq_locate_highlt_drawing_strLoadError2" name="ab_eq_locate_highlt_drawing_strLoadError2" style="display:none">Please contact your system administrator.</span>
					<span translatable="true" id="ab_eq_locate_highlt_drawing_strLoadError3" name="ab_eq_locate_highlt_drawing_strLoadError3" style="display:none">The selected drawing file does not exist: </span>
					<span translatable="true" id="ab_eq_locate_highlt_drawing_strLoadError4" name="ab_eq_locate_highlt_drawing_strLoadError4" style="display:none">There is no drawing file associated with the selected item.</span>
                                </td>
			</tr>
			<tr valign="top">
				<td align="center" valign="top">
					<div id="loadingMessage" class="visHide"><span translatable="true">Loading...</span></div>
                                        <div id="dwfViewerControl"></div>
                                        <span translatable="true" id="ab_express_viewer_drawing_strWarningMessage" name="ab_express_viewer_drawing_strWarningMessage" style="display:none">DWF Viewer failed to load. ARCHIBUS Web Central supports DWF drawings on Internet Explorer 6 or later.  If you are using a supported browser, contact your system administrator to install the Autodesk DWF Viewer.</span>
				</td>
			</tr>

		</table>
		<!-- calling common.xsl -->
		<xsl:call-template name="common">
			<xsl:with-param name="title" select="/*/title"/>
			<xsl:with-param name="debug" select="//@debug"/>
			<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
			<xsl:with-param name="xml" select="$xml"/>
		</xsl:call-template>
      </body>
    </html>
  </xsl:template>
  <!-- including template model XSLT files called in XSLT -->
 <xsl:include href="../../../ab-system/xsl/dwf-highlight/ab-dwf-highlight-common.xsl" />
<xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
