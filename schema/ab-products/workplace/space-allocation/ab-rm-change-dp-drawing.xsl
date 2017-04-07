<?xml version="1.0"?>
<!-- ab-rm-change-dp-drawing.xsl -->
<!-- Example stylesheet for an Express Viewer drawing view with room highlighting -->
<!-- Root stylesheet element -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />

	<!-- Here we replace the root XML element with our drawing page content -->
	<xsl:template match="/">

		<!-- Height and width for the Express Viewer plugin -->
		<xsl:variable name="width">400</xsl:variable>
		<xsl:variable name="height">350</xsl:variable>
		<xsl:variable name="targetView">ab-rm-change-dp-edit.axvw</xsl:variable>
		<xsl:variable name="targetFrame" />
		<xsl:variable name="targetTable">rm</xsl:variable>

		<xsl:variable name="layersOn">
			<xsl:value-of select="$rmLayers"/>
			<xsl:value-of select="$wallLayers"/>
			<xsl:value-of select="$servLayers"/>
			<xsl:value-of select="$plLayers"/>
                        <xsl:value-of select="$dhlRmLayers"/>
		</xsl:variable>

                <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
                <xsl:variable name="drawingSuffix">-abspacerminventoryb.dwf</xsl:variable>

		<xsl:variable name="drawing_node" select="/*/afmTableGroup/afmTableGroup/dataSource/data/records/drawing[position()=1]" />
		<xsl:variable name="drawing_name" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.dwgname" />
                <xsl:variable name="absoluteAppPath_expressViewer5" select="//preferences/@absoluteAppPath"/>
                <xsl:variable name="isDwfViewer7" select="//preferences/@dwfViewer7"/>

		<html>
			<head>
				<STYLE>
                         	.visShow { visibility:visible }
                	  	.visHide { visibility:hidden }
			        </STYLE>

                                <!-- Generate header info and javascript handlers -->
				<xsl:call-template name="drawingPageHeader">
					<xsl:with-param name="drawing_name" select="$drawing_name"/>
					<xsl:with-param name="targetView" select="$targetView"/>
					<xsl:with-param name="targetFrame" select="$targetFrame"/>
					<xsl:with-param name="targetTable" select="$targetTable"/>
					<xsl:with-param name="layersOn" select="$layersOn"/>
					<xsl:with-param name="drawingSuffix" select="$drawingSuffix"/>
				</xsl:call-template>

			</head>

			<!-- Get the dv and dp in the current restriction -->
			<xsl:variable name="dwg_dv_id" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.dv_id" />
			<xsl:variable name="dwg_dp_id" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.dp_id" />

			<!-- Generate the plugin HTML -->
			<body onload="loadDwfViewer('{$width}', '{$height}', '{$absoluteAppPath_expressViewer5}', '{$isDwfViewer7}');loadDrawing()" class="body" leftmargin="0" rightmargin="0" topmargin="0">
				<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
				<xsl:call-template name="table-group-title">
					<xsl:with-param name="title" select="/*/afmTableGroup/title" />
				</xsl:call-template>

				<table align="center" width="100%" valign="top" cellpadding="0">
					<tr>
						<td align="center">
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
							<!--  A message element with the name 'instructionText' should
								be present in the AXVW file.  -->
							<xsl:value-of select="//message[@name='instructionText']" />
							<!-- Add current dv_id and dp_id info -->
							<xsl:if test="string-length($dwg_dp_id) &gt; 0">
								<br/>
								<span translatable="true">Highlighted rooms are charged to department</span>&#0160;<xsl:text>&#0160;</xsl:text>
								<xsl:value-of select="$dwg_dv_id" />-<xsl:value-of select="$dwg_dp_id" />
							</xsl:if>
						</td>
					</tr>
				</table>
			</body>

		</html>

	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/ab-express-viewer-drawing-common.xsl" />

</xsl:stylesheet>
