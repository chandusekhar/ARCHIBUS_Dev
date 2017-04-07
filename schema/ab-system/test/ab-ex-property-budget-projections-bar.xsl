<?xml version="1.0"?>
<!-- ab-ex-property-holdings-by-status-chart.xsl for ab-ex-property-holdings-by-status-chart.axvw-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="../xsl/constants.xsl" />
  <xsl:template match="/">
	<xsl:variable name="currencySymbol" select="//preferences/locale/@currencySymbol"/>
	<svg width="90%" height="90%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" onload='OnLoadEvent(evt, "{$currencySymbol}")'>
		<script language="javascript">
			<xsl:for-each select="/*/afmTableGroup/dataSource/statistics/statistic">
				arrValues['<xsl:value-of select="@name"/>']='<xsl:value-of select="@value"/>';
			</xsl:for-each>
		</script>
		<desc>
			Property Budget Projections (Bar Chart)
		</desc>
		<!--rect x="0" y="0" width="100%" height="100%" style="fill:#FAF0E6;" /-->

		<!-- Drawing the x-axis, y-axis, and grid lines -->
		<g style="stroke-width:2; stroke:black">
			<path d="M 50 200 L  50  20 L 50 200  L 320 200 Z"/>
			<path d="M 50 200 L  50  380  Z"/>
		</g>
		<!-- center -->
		<text x="20" y="204" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">0.00</text>
		<!-- positive max -->
		<text id="pMax" x="0" y="20" style="fill:blue;opacity:10;font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">100.00(<xsl:value-of select="$currencySymbol"/>)</text>
		<!-- negative max -->
		<text id="nMax" x="0" y="380" style="fill:red;opacity:10;font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">-100.00(<xsl:value-of select="$currencySymbol"/>)</text>
		
		<g style="fill:none; stroke:#B0B0B0; stroke-width:1; stroke-dasharray:2 4">
			<path d="M 52 180 L 280 180 Z"/>
			<path d="M 52 160 L 280 160 Z"/>
			<path d="M 52 140 L 280 140 Z"/>
			<path d="M 52 120 L 280 120 Z"/>
			<path d="M 52 100 L 280 100 Z"/>
			<path d="M 52  80 L 280  80 Z"/>
			<path d="M 52  60 L 280  60 Z"/>
			<path d="M 52  40 L 280  40 Z"/>
			<path d="M 52  20 L 280  20 Z"/>
			<!--path d="M 52  0 L 280  0 Z"/-->

			<path d="M 52 220 L 280 220 Z"/>
			<path d="M 52 240 L 280 240 Z"/>
			<path d="M 52 260 L 280 260 Z"/>
			<path d="M 52 280 L 280 280 Z"/>
			<path d="M 52 300 L 280 300 Z"/>
			<path d="M 52  320 L 280  320 Z"/>
			<path d="M 52  340 L 280  340 Z"/>
			<path d="M 52  360 L 280  360 Z"/>
			<path d="M 52  380 L 280  380 Z"/>
			<!--path d="M 52  400 L 280  400 Z"/-->
		</g>
		
		<!-- legends -->
		<rect x="300" y="45" width="12" height="12" style="fill:blue" />
		<text id="year_01_costs_text" x="320" y="55" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
			<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[position()=1]/title"/>
		</text>
		
		<rect x="300" y="65" width="12" height="12" style="fill:green" />
		<text id="year_02_costs_text" x="320" y="75" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
			<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[position()=1]/title"/>
		</text>
		
		<rect x="300" y="85" width="12" height="12" style="fill:fuchsia" />
		<text id="year_03_costs_text" x="320" y="95" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
			<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[position()=1]/title"/>
		</text>
		<rect x="300" y="105" width="12" height="12" style="fill:red" />
		<text id="year_04_costs_text" x="320" y="115" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
			<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[position()=1]/title"/>
		</text>
		<rect x="300" y="125" width="12" height="12" style="fill:black" />
		<text id="year_05_costs_text" x="320" y="135" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
			<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[position()=1]/title"/>
		</text>
		<!-- columns -->
		<g style="fill:blue">
			<rect  id="year_01_costs_column" x="60" y="200" width="30" height="0" style="stroke:black; stroke-width:1;"/>
		</g>
		<g style="fill:green">
			<rect  id="year_02_costs_column" x="110" y="200" width="30" height="0" style="stroke:black; stroke-width:1;"/>
		</g>
		<g style="fill:fuchsia">
			<rect  id="year_03_costs_column" x="160" y="200" width="30" height="0" style="stroke:black; stroke-width:1;"/>
		</g>
		<g style="fill:red">
			<rect  id="year_04_costs_column" x="210" y="200" width="30" height="0" style="stroke:black; stroke-width:1;"/>
		</g>
		<g style="fill:black">
			<rect  id="year_05_costs_column" x="260" y="200" width="30" height="0" style="stroke:black; stroke-width:1;"/>
		</g>
	</svg>
  </xsl:template>
  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>
