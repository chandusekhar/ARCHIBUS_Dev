<?xml version="1.0"?>
<!-- ab-ex-cost-vs-budget-for-accounts-stacked-bar.xsl for ab-ex-cost-vs-budget-for-accounts-stacked-bar.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="../xsl/constants.xsl" />
  <xsl:template match="/">
	<xsl:variable name="currencySymbol" select="//preferences/locale/@currencySymbol"/>
	<xsl:variable name="cost_title" select="//message[@name='cost']"/>
	<xsl:variable name="budget_title" select="//message[@name='budget']"/>
	<xsl:variable name="account_title" select="//message[@name='account']"/>
	<svg width="90%" height="90%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" onload='OnLoadEvent(evt,"{$currencySymbol}")'>
		<script language="javascript">
			<xsl:for-each select="/*/afmTableGroup/dataSource/statistics/statistic">
				arrValues['<xsl:value-of select="@name"/>']='<xsl:value-of select="@value"/>';
			</xsl:for-each>
		</script>
		<desc>
			Cost vs. Budget for Accounts (Stacked Bar)
		</desc>
		<!--rect x="0" y="0" width="100%" height="100%" style="fill:#FAF0E6;" /-->

		<!-- Drawing the x-axis, y-axis, and grid lines -->
		<g style="stroke-width:2; stroke:black">
			<path d="M 40 300 L  40  20 L 40 300  L 320 300 Z"/>
		</g>
		<!-- center -->
		<text x="10" y="304" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">0.00</text>
		<!-- positive max -->
		<text id="pMax" x="0" y="20" style="opacity:1;font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">10000000.00</text>
		
		<g style="fill:none; stroke:#B0B0B0; stroke-width:1; stroke-dasharray:2 4">
			<path d="M 42 280 L 280 280 Z"/>
			<path d="M 42 260 L 280 260 Z"/>
			<path d="M 42 240 L 280 240 Z"/>
			<path d="M 42 220 L 280 220 Z"/>
			<path d="M 42 200 L 280 200 Z"/>
			<path d="M 42 180 L 280 180 Z"/>
			<path d="M 42 160 L 280 160 Z"/>
			<path d="M 42 140 L 280 140 Z"/>
			<path d="M 42 120 L 280 120 Z"/>
			<path d="M 42 100 L 280 100 Z"/>
			<path d="M 42  80 L 280  80 Z"/>
			<path d="M 42  60 L 280  60 Z"/>
			<path d="M 42  40 L 280  40 Z"/>
			<path d="M 42  20 L 280  20 Z"/>
			<!--path d="M 42  0 L 280  0 Z"/-->
		</g>
		
		<!-- legends -->
		<g>
			<rect x="300" y="65" width="12" height="12" style="fill:red" />
			<text x="320" y="75" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of select="$cost_title"/>
			</text>

			<rect x="300" y="85" width="12" height="12" style="fill:blue" />
			<text  x="320" y="95" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of select="$budget_title"/>
			</text>
			
		</g>
		<!-- detail report -->
		<g>
			<text  id="detail_title" x="300" y="120"  display="none" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				Account:
			</text>
			<text  id="detail_cost" x="300" y="130" display="none" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				Total Cost:
			</text>
			<text  id="detail_budget" x="300" y="140" display="none" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				Total Cost:
			</text>
		</g>
		<!-- columns -->
		<g >
			<rect  id="1993-GENL-MAINT-cost" x="60" y="300" width="40" height="0" style="fill:red;stroke:black; stroke-width:1;" onmouseover='showDetail("1993-GENL-MAINT", "{$account_title}", "{$cost_title}", "{$budget_title}")' onmouseout="hideDetail()"/>
			<rect  id="1993-GENL-MAINT-budget" x="60" y="300" width="40" height="0" style="fill:blue;stroke:black; stroke-width:1;" onmouseover='showDetail("1993-GENL-MAINT", "{$account_title}", "{$cost_title}", "{$budget_title}")' onmouseout="hideDetail()"/>
			
		</g>
		<g transform="rotate(30, 80, 308)">
			<text x="80" y="310"  style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[@name='1993-GENL-MAINT-cost']/title"/>
			</text>
		</g>
		<g >
			<rect  id="1993-OVERHEAD-cost" x="150" y="300" width="40" height="0" style="fill:red;stroke:black; stroke-width:1;" onmouseover='showDetail("1993-OVERHEAD", "{$account_title}", "{$cost_title}", "{$budget_title}")' onmouseout="hideDetail()"/>
			<rect  id="1993-OVERHEAD-budget" x="150" y="300" width="40" height="0" style="fill:blue;stroke:black; stroke-width:1;" onmouseover='showDetail("1993-OVERHEAD", "{$account_title}", "{$cost_title}", "{$budget_title}")' onmouseout="hideDetail()"/>
			
		</g>
		<g  transform="rotate(30, 170, 308)">
			<text x="170" y="310" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[@name='1993-OVERHEAD-cost']/title"/>
			</text>
		</g>
		<g >
			<rect  id="1993-RESEARCH-cost" x="240" y="300" width="40" height="0" style="fill:red;stroke:black; stroke-width:1;"  onmouseover='showDetail("1993-RESEARCH", "{$account_title}", "{$cost_title}", "{$budget_title}")' onmouseout="hideDetail()"/>
			<rect  id="1993-RESEARCH-budget" x="240" y="300" width="40" height="0" style="fill:blue;stroke:black; stroke-width:1;"  onmouseover='showDetail("1993-RESEARCH", "{$account_title}", "{$cost_title}", "{$budget_title}")' onmouseout="hideDetail()"/>
			
		</g>
		<g transform="rotate(30, 260, 308)">
			<text x="260" y="310" style="font-size:10px;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;">
				<xsl:value-of select="/*/afmTableGroup/dataSource/statistics/statistic[@name='1993-RESEARCH-cost']/title"/>
			</text>
		</g>
	</svg>
  </xsl:template>
  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>
