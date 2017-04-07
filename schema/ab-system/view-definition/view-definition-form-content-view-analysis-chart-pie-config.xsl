<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao
     3-03-2005
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="//title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-trigger-close-dialog.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-view-analysis-chart-pie-config.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" onload="setChartProperties()" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<table align="center" valign="middle">
				<tr><td align="center" style="font-size:14;font-weight:bold;font-family:arial,geneva,helvetica,sans-serif">
					<p><xsl:value-of select="/*/title"/></p>
				</td></tr>
				<tr><td>
					<hr />
				</td></tr>
				<tr><td align="center">
					<table  align="center">
						<!--tr>
							<td class="legendTitle"><span translatable="true">Chart Type:</span></td><td style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" id="chart_type">Bar Chart</td>
						</tr-->
						<!--tr>
							<td class="legendTitle"><span translatable="true">Chart Title:</span></td><td><input id="chart_title" class="inputField" type="text" value=""/></td>
						</tr-->
						<!--tr>
							<td class="legendTitle"><span translatable="true">Category Axis Label:</span></td><td><input id="Cat_label" class="inputField" type="text"  value=""/></td>
						</tr>
						<tr>
							<td class="legendTitle"><span translatable="true">Value Axis Label:</span></td><td><input id="Val_label" class="inputField" type="text"  value=""/></td>
						</tr-->
						<!--tr>
							<td class="legendTitle"><span translatable="true">Plot Orientation:</span></td><td><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Vertical</span><input type="radio" id="VERT" name="Orientation" checked="1"/><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Horizontal</span><input type="radio" id="HERZ" name="Orientation"/></td>
						</tr-->
						<tr>
							<td class="legendTitle">
								<span translatable="true">Chart Size(Pixels):</span>
							</td>
							<td valign="top">
								<table valign="top"><tr valign="top">
									<td valign="top">
										<span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif;" translatable="true">Width:</span>
									</td>
									<td valign="top">
										<select style="background-color: #ffffff;font-size: 12; font-family:Verdana, Geneva, Arial, Helvetica, sans-serif;" name="Width" id="Width">
											<option value="800">800</option><option value="700">700</option><option value="600">600</option>
											<option value="550">550</option><option value="500">500</option><option value="450">450</option><option value="400">400</option><option value="350">350</option><option value="300">300</option>
											<option value="250">250</option><option value="200">200</option><option value="150">150</option><option value="100">100</option>
										</select>
									</td>
								</tr>
								<tr valign="top">
									<td valign="top">
										<span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif;" translatable="true">Height:</span>
									</td>
									<td valign="top">
										<select style="background-color: #ffffff;font-size: 12; font-family:Verdana, Geneva, Arial, Helvetica, sans-serif;" name="Height" id="Height">
											<option value="800">800</option><option value="700">700</option><option value="600">600</option>
											<option value="550">550</option><option value="500">500</option><option value="450">450</option><option value="400">400</option><option value="350">350</option><option value="300">300</option>
											<option value="250">250</option><option value="200">200</option><option value="150">150</option><option value="100">100</option>
										</select>
									</td>
								</tr></table>
							</td>
						</tr>
						<!--tr>
							<td class="legendTitle"><span translatable="true">Show Category Label by:</span></td>
							<td>
								<select style="background-color: #ffffff;font-size: 12; font-family:Verdana, Geneva, Arial, Helvetica, sans-serif;" name="C_Label_By_Way" id="C_Label_By_Way">
									<option value="0"><span translatable="true">Horizontal</span></option>
									<option value="90"><span translatable="true">Vertical</span></option>
									<option value="45"><span translatable="true">45 Degrees</span></option>									
								</select>
							</td>
						</tr>
						<tr>
							<td class="legendTitle"><span translatable="true">Show Category Gridline?</span></td><td><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Yes</span><input type="radio" id="YES_C_Gridline" name="C_Gridline" checked="1"/><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">No</span><input type="radio" id="NO_C_Gridline" name="C_Gridline"/></td>
						</tr>
						<tr>
							<td class="legendTitle"><span translatable="true">Show Value Gridline?</span></td><td><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Yes</span><input type="radio" id="YES_V_Gridline" name="V_Gridline" checked="1"/><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">No</span><input type="radio"  id="NO_V_Gridline" name="V_Gridline"/></td>
						</tr-->
						<tr>
							<td class="legendTitle"><span translatable="true">Show Title?</span></td><td><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Yes</span><input type="radio" id="YES_Title" name="Title" checked="1"/><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">No</span><input type="radio" id="NO_Title" name="Title"/></td>
						</tr>
						<tr>
							<td class="legendTitle"><span translatable="true">Show Legend?</span></td><td><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Yes</span><input type="radio" id="YES_Legend" name="Legend" checked="1"/><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">No</span><input type="radio" id="NO_Legend" name="Legend"/></td>
						</tr>
						<tr>
							<td class="legendTitle"><span translatable="true">Show Item Tooltip?</span></td><td><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Yes</span><input type="radio" id="YES_Tooltip" name="Tooltip"/><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">No</span><input type="radio" id="NO_Tooltip" name="Tooltip" checked="1"/></td>
						</tr>
						<tr>
							<td class="legendTitle"><span translatable="true">Show Item Label?</span></td><td><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">Yes</span><input type="radio" id="YES_ItemLabel" name="Label"/><span style="font-size:14;font-family:arial,geneva,helvetica,sans-serif" translatable="true">No</span><input type="radio" id="NO_ItemLabel"  name="Label" checked="1"/></td>
						</tr>
						
					</table>
				</td></tr>
				<tr><td align="center">
					<table align="center" class="bottomActionsTable">
						<tr align="center" >
							<xsl:variable name="applyButton" translatable="true">Apply</xsl:variable> 
							<xsl:variable name="cancelButton" translatable="true">Cancel</xsl:variable> 
							<td ><input class="AbActionButtonFormStdWidth" type="button" value="{$applyButton}" onclick="onOK(); window.top.close()"/><input class="AbActionButtonFormStdWidth" type="button" value="{$cancelButton}" onclick="window.top.close()"/></td>
						</tr>
					</table>
				</td></tr>
			</table>
		</body>
		</html>
	</xsl:template>
	<!-- including xsl which are called -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


