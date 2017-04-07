<?xml version="1.0" encoding="UTF-8"?>
<!--  xsl called by Java to handle calendar -->
<!-- since calendar.xsl is included in another XSl which import constants.xsl -->
<!-- xsl variable schemaPath in constants.xsl can be used here -->
<!-- javascript variables and functions used here are in calendar.js -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="Calendar">
		<xsl:param name="MM"/>
		<xsl:param name="YYYY"/>
		<xsl:param name="But"/>
		<xsl:param name="Size"/>
		<!-- Size:  s=>small;n=>normal -->
		<!-- ccs bug? text-align in class is not working -->
		<table class="calendarContainerTable" align="center">
			<tr valign="top"><td valign="top">
				<!-- write out the top of calendar -->
				<xsl:call-template name="CalendarTop">
					<xsl:with-param name="MM" select="$MM"/>
					<xsl:with-param name="YYYY" select="$YYYY"/>
					<xsl:with-param name="Size" select="$Size"/>
				</xsl:call-template>
			</td></tr>
			<tr valign="top"><td valign="top">
				<!-- write out the content of calendar -->
				<xsl:call-template name="CalendarContent">
					<xsl:with-param name="But" select="$But"/>
					<xsl:with-param name="Size" select="$Size"/>
				</xsl:call-template>
			</td></tr>
		</table>
	</xsl:template>
	<xsl:template name="CalendarTop">
		<xsl:param name="MM"/>
		<xsl:param name="YYYY"/>
		<xsl:param name="Size"/>
		<xsl:variable name="calendarmmyyyyA">
			<xsl:choose>
				<xsl:when test="$Size='s'">calendarmmyyyyA_s</xsl:when>
				<xsl:otherwise>calendarmmyyyyA</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<table  class="calendarTop" valign="top">
			<tr><td onclick="getMM_YYYY(true)" class="calendarPN">
				<table align="center" valign="middle">
					<tr><td align="center">
                        <xsl:variable name="previous" translatable="true">Previous</xsl:variable>
						<img alt="{$previous}" src="{$abSchemaSystemGraphicsFolder}/prev.gif"/>
					</td></tr>
				</table>
			</td>
			<td class="calendarmmyyyyB">
				<table align="center">
					<tr>
						<td class="{$calendarmmyyyyA}">
							<!-- month name will be overwritten in javascript -->
							<span id="{$MM}">January</span>
						</td>
						<td>
							<xsl:value-of select="$whiteSpace"/>
						</td>
						<td class="{$calendarmmyyyyA}">
							<!-- year number will be overwritten in javascript -->
							<span id="{$YYYY}">2003</span>
						</td>
					</tr>
				</table>
			</td>
			<td  onclick="getMM_YYYY(false)"  class="calendarPN">
				<table align="center" valign="middle">
					<tr><td align="center">
					    <xsl:variable name="next" translatable="true">Next</xsl:variable>
						<img alt="{$next}" src="{$abSchemaSystemGraphicsFolder}/next.gif"/>
					</td></tr>
				</table>
			</td></tr>
		</table>
	</xsl:template>

	<xsl:template name="CalendarContent">
		<xsl:param name="But"/>
		<xsl:param name="Size"/>
		<xsl:variable name="calendarTableDays">
			<xsl:choose>
				<xsl:when test="$Size='s'">calendarTableDays_s</xsl:when>
				<xsl:otherwise>calendarTableDays</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="calendar">
			<xsl:choose>
				<xsl:when test="$Size='s'">calendar_s</xsl:when>
				<xsl:otherwise>calendar</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<table  class="calendarTable" valign="top">
			<tr class="{$calendarTableDays}">
				<td><span translatable="false">Sun</span></td>
				<td><span translatable="false">Mon</span></td>
				<td><span translatable="false">Tue</span></td>
				<td><span translatable="false">Wed</span></td>
				<td><span translatable="false">Thur</span></td>
				<td><span translatable="false">Fri</span></td>
				<td><span translatable="false">Sat</span></td>
			</tr>
			<tr>
				<td  class="{$calendar}" ><A id="{$But}1" href="#" onClick='SetDate("{$But}1"); return false;'>1</A></td>
				<td  class="{$calendar}" ><A id="{$But}2" href="#" onClick='SetDate("{$But}2"); return false;'>2</A></td>
				<td  class="{$calendar}" ><A id="{$But}3" href="#" onClick='SetDate("{$But}3"); return false;'>3</A></td>
				<td  class="{$calendar}" ><A id="{$But}4" href="#" onClick='SetDate("{$But}4"); return false;'>4</A></td>
				<td  class="{$calendar}" ><A id="{$But}5" href="#" onClick='SetDate("{$But}5"); return false;'>5</A></td>
				<td  class="{$calendar}" ><A id="{$But}6" href="#" onClick='SetDate("{$But}6"); return false;'>6</A></td>
				<td  class="{$calendar}" ><A id="{$But}7" href="#" onClick='SetDate("{$But}7"); return false;'>7</A></td>
			</tr>
			<tr>
				<td  class="{$calendar}" ><A id="{$But}8" href="#" onClick='SetDate("{$But}8"); return false;'>8</A></td>
				<td  class="{$calendar}" ><A id="{$But}9" href="#" onClick='SetDate("{$But}9"); return false;'>9</A></td>
				<td  class="{$calendar}" ><A id="{$But}10" href="#" onClick='SetDate("{$But}10"); return false;'>10</A></td>
				<td  class="{$calendar}" ><A id="{$But}11" href="#" onClick='SetDate("{$But}11"); return false;'>11</A></td>
				<td  class="{$calendar}" ><A id="{$But}12" href="#" onClick='SetDate("{$But}12"); return false;'>12</A></td>
				<td  class="{$calendar}" ><A id="{$But}13" href="#" onClick='SetDate("{$But}13"); return false;'>13</A></td>
				<td  class="{$calendar}" ><A id="{$But}14" href="#" onClick='SetDate("{$But}14"); return false;'>14</A></td>
			</tr>
			<tr>
				<td  class="{$calendar}" ><A id="{$But}15" href="#" onClick='SetDate("{$But}15"); return false;'>15</A></td>
				<td  class="{$calendar}" ><A id="{$But}16" href="#" onClick='SetDate("{$But}16"); return false;'>16</A></td>
				<td  class="{$calendar}" ><A id="{$But}17" href="#" onClick='SetDate("{$But}17"); return false;'>17</A></td>
				<td  class="{$calendar}" ><A id="{$But}18" href="#" onClick='SetDate("{$But}18"); return false;'>18</A></td>
				<td  class="{$calendar}" ><A id="{$But}19" href="#" onClick='SetDate("{$But}19"); return false;'>19</A></td>
				<td  class="{$calendar}" ><A id="{$But}20" href="#" onClick='SetDate("{$But}20"); return false;'>20</A></td>
				<td  class="{$calendar}" ><A id="{$But}21" href="#" onClick='SetDate("{$But}21"); return false;'>21</A></td>
			</tr>
			<tr>
				<td  class="{$calendar}" ><A id="{$But}22" href="#" onClick='SetDate("{$But}22"); return false;'>22</A></td>
				<td  class="{$calendar}" ><A id="{$But}23" href="#" onClick='SetDate("{$But}23"); return false;'>23</A></td>
				<td  class="{$calendar}" ><A id="{$But}24" href="#" onClick='SetDate("{$But}24"); return false;'>24</A></td>
				<td  class="{$calendar}" ><A id="{$But}25" href="#" onClick='SetDate("{$But}25"); return false;'>25</A></td>
				<td  class="{$calendar}" ><A id="{$But}26" href="#" onClick='SetDate("{$But}26"); return false;'>26</A></td>
				<td  class="{$calendar}" ><A id="{$But}27" href="#" onClick='SetDate("{$But}27"); return false;'>27</A></td>
				<td  class="{$calendar}" ><A id="{$But}28" href="#" onClick='SetDate("{$But}28"); return false;'>28</A></td>
			</tr>
			<tr>
				<td  class="{$calendar}" ><A id="{$But}29" href="#" onClick='SetDate("{$But}29"); return false;'>29</A></td>
				<td  class="{$calendar}" ><A id="{$But}30" href="#" onClick='SetDate("{$But}30"); return false;'>30</A></td>
				<td  class="{$calendar}" ><A id="{$But}31" href="#" onClick='SetDate("{$But}31"); return false;'>31</A></td>
				<td  class="{$calendar}" ><A id="{$But}32" href="#" onClick='SetDate("{$But}32"); return false;'>32</A></td>
				<td  class="{$calendar}" ><A id="{$But}33" href="#" onClick='SetDate("{$But}33"); return false;'>33</A></td>
				<td  class="{$calendar}" ><A id="{$But}34" href="#" onClick='SetDate("{$But}34"); return false;'>34</A></td>
				<td  class="{$calendar}" ><A id="{$But}35" href="#" onClick='SetDate("{$But}35"); return false;'>35</A></td>
			</tr>
			<tr>
				<td  class="{$calendar}" ><A id="{$But}36" href="#" onClick='SetDate("{$But}36"); return false;'>36</A></td>
				<td  class="{$calendar}" ><A id="{$But}37" href="#" onClick='SetDate("{$But}37"); return false;'>37</A></td>
				<td  class="{$calendar}" ><A id="{$But}38" href="#" onClick='SetDate("{$But}38"); return false;'>38</A></td>
				<td  class="{$calendar}" ><A id="{$But}39" href="#" onClick='SetDate("{$But}39"); return false;'>39</A></td>
				<td  class="{$calendar}" ><A id="{$But}40" href="#" onClick='SetDate("{$But}40"); return false;'>40</A></td>
				<td  class="{$calendar}" ><A id="{$But}41" href="#" onClick='SetDate("{$But}41"); return false;'>41</A></td>
				<td  class="{$calendar}" ><A id="{$But}42" href="#" onClick='SetDate("{$But}42"); return false;'>42</A></td>
			</tr>
		</table>
	</xsl:template>
</xsl:stylesheet>
