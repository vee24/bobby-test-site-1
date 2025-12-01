function loadDiscoJS(isEngagementPage = false) {
    console.log("Load DiscoJS");

    window.vee24EngagementPage = isEngagementPage;
    window.vee24TagKey = '6e75e527-24df-46e8-914f-dc38a5eb1a60';
    const discoJS = document.createElement('script'); // Use document.createElement('script')
    discoJS.src = "https://cdn.vee24.com/disco.min.js";
    discoJS.defer = true;
    document.body.appendChild(discoJS);
}

function loadZendeskJS() {
    console.log("Load ZendeskJS");
    const zendeskJS = document.createElement('script'); // Use document.createElement('script')
    zendeskJS.id = "ze-snippet";
    zendeskJS.src = "https://static.zdassets.com/ekr/snippet.js?key=ef3aa260-4cfd-4718-89f0-ff49a643a81a";
    document.body.appendChild(zendeskJS);
}

loadDiscoJS();

document.addEventListener("DOMContentLoaded", function() {

    const debugModeButton = document.getElementById("debug-mode-btn");


    window.v24ClientInitialise = () => {
        vee24.traceEnabled = true;
        updateEmbeddedChatButton();
        
        if (debugModeButton) {
            debugModeButton.addEventListener("click", function () {
                debugModeButton.style.display = debugModeButton.style.display === "none" ? "block" : "none";
                displayObjectProperties("debug-container", vee24);
            });
        }

        const urlParams = new URLSearchParams(window.location.search);

        // Extract query parameters
        const site = urlParams.get("site");
        const culture = urlParams.get("culture");
        const siteSection = urlParams.get("siteSection");

        if (siteSection) {
            vee24.siteSection = siteSection;
        }

        if (culture) {
            vee24.culture = culture;
        }

        if (site) {
            vee24.site = site;
        }
    }

    fetch("./partials/menu.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("menu-container").innerHTML = data;

            const currentPage = window.location.pathname.split("/").pop() || "index.html";
            document.title = currentPage;
            document.getElementById("page-title").innerText = currentPage;
        })
        .catch(error => console.error("Error loading menu:", error));

    fetch("./partials/content.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("content-container").innerHTML = data;
        })
        .catch(error => console.error("Error loading menu:", error));

    // Auto-start periodic reload when ?reload=1 is present on any page
    const _urlParams = new URLSearchParams(window.location.search);
    const reloadRate = parseInt(_urlParams.get("reload") ?? 0);
    console.warn('reloadRate', reloadRate);
    if (reloadRate > 0) {
        startPeriodicPageRefresh(reloadRate);
    }
});

function displayObjectProperties(obj, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    function iterate(obj, indent = "") {
        let output = "";
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (typeof value === "object" && value !== null) {
                    output += `${indent}<strong>${key}:</strong><br>`;
                    if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            output += `${indent}&nbsp;&nbsp;[${index}] → ${JSON.stringify(item)}<br>`;
                        });
                    } else {
                        output += iterate(value, indent + "&nbsp;&nbsp;");
                    }
                } else {
                    output += `${indent}<strong>${key}:</strong> ${value}<br>`;
                }
            }
        }
        return output;
    }

    container.innerHTML = iterate(obj);
}

let windowReloadId = null;
function startPeriodicPageRefresh(reloadRateMS) {
    // Prevent multiple intervals
    if (windowReloadId) {
        console.warn('startPeriodicPageRefresh already running');
        return;
    }

    if (reloadRateMS < 1000) {
        reloadRateMS = 1000; // Minimum 1 second
    }

    console.warn('startPeriodicPageRefresh');
    windowReloadId = window.setInterval(() => window.location.reload(), reloadRateMS);
}

function toggleEmbeddedChat() {
    console.warn('toggleEmbeddedChat', vee24.embeddedChat);
    vee24.embeddedChat = !vee24.embeddedChat;
    updateEmbeddedChatButton();
}

function updateEmbeddedChatButton() {
    if (!vee24) return;
    console.warn('updateEmbeddedChatButton', vee24.embeddedChat);
    get('#toggle-embedded-chat-btn').innerHTML = 'Embedded Chat ' + ((vee24.embeddedChat) ? 'ON' : 'OFF');
}

function callHelpMeApi() {
    const pageToLog = get('#page-to-log-input').value;
    const sectionToLog = get('#section-to-log-input').value;
    const input = (pageToLog.length === 0 && sectionToLog.length === 0) ? '' : JSON.stringify({ pageToLog: pageToLog, sectionToLog: sectionToLog });
    console.warn('callHelpMeApi', input);
    vee24.api.helpMe(input);
}

function callRequestEngagement() {
    console.warn('callRequestEngagement');
    const params = {
        requestEngagement: {
            connectionMode: 114, //veechat
            engagementLaunchOrigin: 4 //button
        }
    };
    vee24.api.helpMe(JSON.stringify(params));
}

function get(selector) {
    return document.querySelector(selector);
}