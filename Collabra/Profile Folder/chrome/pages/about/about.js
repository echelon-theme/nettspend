var g_collabraAbout;

{
    var { PrefUtils, BrandUtils } = ChromeUtils.import("chrome://userscripts/content/collabra_utils.uc.js");

    class AboutColonPageManager {
        get releaseNotesURL() {
            return Services.urlFormatter.formatURLPref("app.releaseNotesURL");
        }

        get stylesheet() {
            return `
                html {
                    background-color: #c0c0c0;
                }
            `
        }

        get fragment() {
            return `
            <center>

                    <!-- {Netscape XX, Netscape XX Preview Release 3} -->
                    <!-- Current policy here is to leave the trunk build at b0 and      -->
                    <!-- only mark beta/rtm accordingly _on_the_branch_.  This lets     -->
                    <!-- QA and others distinguish builds right after a branch happens. -->
                    <b>
                        <font size="+2">Netscape 7.2</font>
                    </b>

                    <br />

                    <td id="nsver"></td>

                    <br /><br />

                    <table>
                        <tr>
                            <td width="220" align="center">
                                <a href="http://www.netscape.com/"><img src="about:logo" border="0"
                                        alt="Netscape" width="180" height="200" /></a>
                            </td>
                            <td valign="top">
                                Copyright © 2000-2004 Netscape Communications Corporation. Portions of
                                this code are copyrighted by

                                <a href="http://www.mozilla.org/credits/">Contributors</a> to the Mozilla
                                codebase under the <a href="http://www.mozilla.org/MPL/">Mozilla Public License
                                    and Netscape Public License</a>. All Rights Reserved.<br />
                                <br />
                                This software is subject to the terms and conditions set forth
                                in the <a href="./license.txt">license agreement</a>.<br />
                                You may use this software only if you accept all terms and conditions of the
                                license agreement.<br />
                                <br />
                                Netscape, Netscape Navigator, and the Netscape logo are registered trademarks of
                                Netscape Communications Corporation in the United States and other countries.
                                AIM, AOL, America Online, the triangle logo and the running man icon are
                                registered trademarks, and Instant Messenger is a trademark, of America Online,
                                Inc. ICQ and the flower logo are registered trademarks of ICQ, Inc.
                                <br />

                                <br />
                                Contains JavaScript software technology invented and implemented by Netscape
                                Communications Corporation. The JavaScript name is a trademark or registered
                                trademark of Sun Microsystems, Inc. in the United States and other countries
                                and is used under license. Other product and brand names are trademarks of
                                their respective owners.<br />
                                <br />
                                <b>This version supports high-grade (128-bit) security with RSA Public Key
                                    Cryptography, DSA, MD2, MD5, RC2-CBC, RC4, DES-CBC, DES-EDE3-CBC.</b><br />
                            </td>
                        </tr>
                    </table>
            </center>

            <p>
                The following third party software may be included depending on your
                component selection during installation:
            </p>

            <hr />

            <table width="100%" cellpadding="0">
                <tr>
                    <td width="50%" valign="top">
                        <table width="100%" cellpadding="8">
                            <tr>
                                <td>
                                    Macromedia<sup>®</sup> Flash<sup>™</sup>
                                    Player © 1995-2002 by

                                    <a href="http://www.macromedia.com/">Macromedia, Inc.</a>
                                </td>
                            </tr>
                        </table>
                    </td>

                    <td width="50%" valign="top">

                        <table width="100%" cellpadding="8">
                            <tr>

                                <td align="right"> </td>
                                <td>
                                    Contains International ProofReader<sup>™</sup>
                                    text proofing software, copyright © 1995-1998 Vantage Research.
                                    All Rights Reserved.
                                </td>
                            </tr>
                        </table>
                    </td>

                </tr>
            </table>

            <hr />
            `
        }

        get mozillaStylesheet() {
            return `
                table {
                    margin: auto;
                    text-align: center;
                }
                img {
                    border: 0;
                }
                p {
                    font-size: smaller;
                }
                h1 {
                    margin: 0;
                }
                :link {
                    color: #00e;
                }
                :visited {
                    color: #551a8b;
                }
                :link:active, :visited:active {
                    color: #f00;
                }
            `;
        }

        get mozillaFragment() {
            return `
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <img src="about:logo" alt="${BrandUtils.getBrandingKey("brandShortName")}" width="200" height="200" />
                            </td>
                            <td id="mozver">
                                <h1>
                                    <a id="mozlink" href="">${BrandUtils.getBrandingKey("brandShortName")} 1.7</a>
                                </h1>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <hr />

                <ul>
                    <li>Copyright © 1998-2005 by <a href="about:credits">Contributors</a> to
                        the Mozilla codebase under the <a href="chrome://global/content/MPL-1.1.html">
                        Mozilla Public License</a> and <a href="chrome://global/content/NPL-1.1.html">
                        Netscape Public License</a>. All Rights Reserved.</li>
                    <li>Portions of this software are copyright © 1994 The Regents of the
                        University of California. All Rights Reserved.</li>
                    <li>Portions of this software are copyright © 2000-2002 Japan Network Information
                        Center. All Rights Reserved.</li>
                    <li>This software may contain portions that are copyright © 1998-2002
                        <a href="http://www.supportsoft.com/">SupportSoft, Inc.</a> All Rights Reserved.
                    </li>
                </ul>

                <p>
                    U.S. GOVERNMENT END USERS. The Software is a "commercial
                    item," as that term is defined in 48 C.F.R. 2.101 (Oct. 1995), consisting
                    of "commercial computer software" and "commercial computer software
                    documentation," as such terms are used in 48 C.F.R. 12.212 (Sept. 1995).
                    Consistent with 48 C.F.R. 12.212 and 48 C.F.R. 227.7202-1 through 227.7202-4
                    (June 1995), all U.S. Government End Users acquire the Software with only
                    those rights set forth herein.
                </p>
            `;
        }

        init() {
            let branding = PrefUtils.tryGetBoolPref("collabra.appearance.mozilla");
            let innerHTML = branding ? this.mozillaFragment : this.fragment;
            let stylesheet = branding ? this.mozillaStylesheet : this.stylesheet;

            document.body.innerHTML = innerHTML;

            let stylesheetelem = document.createElement("style");
            stylesheetelem.innerHTML = stylesheet;

            document.head.appendChild(stylesheetelem);

            if (branding) {
                document.getElementById("mozver").appendChild(document.createTextNode(navigator.userAgent));
                document.getElementById("mozlink").setAttribute("href", this.releaseNotesURL);
            } else {
                document.getElementById("nsver").appendChild(document.createTextNode(navigator.userAgent));
            }
        }
    }

    g_collabraAbout = new AboutColonPageManager;
    g_collabraAbout.init();
}