<?xml version="1.0"?>
<!-- ab-express-viewer-drawing-common.xsl -->
<!-- Templates used by Express Viewer drawing XSLT -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- Lists of default layers -->
  <xsl:variable name="blLayers">BL$;BL$TXT;</xsl:variable>
  <xsl:variable name="flLayers">FL$;FL$TXT;</xsl:variable>
  <xsl:variable name="rmLayers">RM$;RM$TXT;</xsl:variable>
  <xsl:variable name="altRmLayers">RM$;HL-TMP;</xsl:variable><!-- If room txt is published via dwg pub -->
  <xsl:variable name="grosLayers">GROS$;GROS$TXT</xsl:variable>
  <xsl:variable name="wallLayers">WA-EXT;WA;DR;WN;</xsl:variable>
  <xsl:variable name="servLayers">SERV$;SERV$TXT;</xsl:variable>
  <xsl:variable name="plLayers">PL-ELVTR;PL-MISC;PL-STAIR;PL-TOIL;</xsl:variable>
  <xsl:variable name="siLayers">SI-MISC;SI-TREE;SI-WALK;</xsl:variable>
  <xsl:variable name="parkingLayers">PARKING;PARKING$;PARKING$TXT;</xsl:variable>
  <xsl:variable name="parcelLayers">PARCEL;PARCEL$;PARCEL$TXT;</xsl:variable>
  <xsl:variable name="emLayers">EM$;EM$TXT;</xsl:variable>
  <xsl:variable name="hlRmLayers">HL-TMP;</xsl:variable>
  <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
  <xsl:variable name="strMainTable" select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>
  <xsl:variable name="strStdTable" select="/*/afmTableGroup/dataSource/database/tables/table[@role='standard']/@name"/>
  <xsl:variable name="dhlLayer" select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>
  <xsl:variable name="dhlLayerUpper" select="translate($dhlLayer, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
  <xsl:variable name="mainTableUpper" select="translate($strMainTable, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
  <xsl:variable name="stdTableUpper" select="translate($strStdTable, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
  <xsl:variable name="layerName" select="concat('Z-', $mainTableUpper, 'X', $stdTableUpper, '-HL')" />
  <xsl:variable name="dhlRmLayers">
     <xsl:if test="$isDynamicHighlights!='true'">
       <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">Z-RM-HL-<xsl:value-of select="@rm.bl_id" />-<xsl:value-of select="@rm.fl_id" />-<xsl:value-of select="@rm.rm_id" />;Z-BL-HL-<xsl:value-of select="@bl.bl_id" />;</xsl:for-each><xsl:if test="$strStdTable!=''"><xsl:value-of select="$layerName"/>;</xsl:if></xsl:if>
       <xsl:if test="$isDynamicHighlights='true'"><xsl:if test="$dhlLayerUpper='EM'">Z-RM-DHL;</xsl:if><xsl:if test="$dhlLayerUpper!='EM'">Z-<xsl:value-of select="$dhlLayerUpper"/>-DHL;</xsl:if>
     </xsl:if>
  </xsl:variable>

  <xsl:variable name="absoluteAppPath_expressViewer5" select="//preferences/@absoluteAppPath"/>
  <xsl:variable name="isDwfViewer7" select="//preferences/@dwfViewer7"/>

  <!-- drawingPageHeader template
      Adds the page title, javascript events for Express Viewer, and javascript variables. -->
  <xsl:template name="drawingPageHeader">
	<xsl:param name="drawing_name" />
	<xsl:param name="targetView" />
	<xsl:param name="targetFrame" />
	<xsl:param name="targetTable" />
	<xsl:param name="layersOn" />
	<xsl:param name="layersOff" />
	<xsl:param name="drawingSuffix" />

	<!-- If drawing suffix wasn't supplied, assume '.dwf' -->
	<xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
	<xsl:variable name="varDrawingSuffix">
		<xsl:choose>
			<xsl:when test="string-length($drawingSuffix) &gt; 0">
				<xsl:value-of select="$drawingSuffix"/>
			</xsl:when>
			<xsl:otherwise>.dwf</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

	<xsl:call-template name="DWF_HTML_HEADER"/>

        <!-- Create variables that will be used in javascript  -->
        <script language="javascript">
          var strTargetView = '<xsl:value-of select="$targetView"/>';
          var strTargetFrame = '<xsl:value-of select="$targetFrame"/>';
          var strTargetTable = '<xsl:value-of select="$targetTable"/>';
          var strLayersOn = '<xsl:value-of select="$layersOn"/>';
          var strLayersOff = '<xsl:value-of select="$layersOff"/>';
          var strBaseDrawingName = '<xsl:value-of select="$drawing_name"/>';
          var strDrawingName = '<xsl:value-of select="concat($projectDrawingsFolder,'/',$drawing_name,$varDrawingSuffix)"/>';
          var strDynamicHighlight = '<xsl:value-of select="//preferences/@dynamicDrawingHighlights"/>';
          var strMainTable = '<xsl:value-of select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>';
          var DWF_defaultHighlightColor='<xsl:value-of select="//preferences/@dwfDefaultHighlightColor"/>';
        </script>
	<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-express-viewer-drawing.js"><xsl:value-of select="$whiteSpace" /></script>

  </xsl:template>

  <!-- drawingBody template
        This template produces the HTML for the Express Viewer object.  The parameters are
        plugin height and width, and the source drawing name. -->
  <xsl:template name="drawingBody">
	<xsl:param name="drawing_name" />
	<xsl:param name="width" />
	<xsl:param name="height" />
	<xsl:call-template name="DWF_HTML_BODY">
		<xsl:with-param name="width" select="$width"/>
		<xsl:with-param name="height" select="$height"/>
	</xsl:call-template>
  </xsl:template>
  <xsl:include href="dwf-highlight/ab-dwf-highlight-common.xsl" />
</xsl:stylesheet>
