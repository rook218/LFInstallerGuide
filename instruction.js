// defines servers and serverlist classes
class Server {
    constructor(name, forms, webAccess, webLink, workflow, lfs, lfds, sql, isPublic, domainJoined, primaryForms, sts) {
        this.portsToLFDS = [];
        this.portsToLFS = [];

        this.name = name;
        this.webAccess = webAccess;
        this.webLink = webLink;
        this.workflow = workflow;
        this.lfs = lfs;
        this.lfds = lfds;
        this.sql = sql;

        this.isPublic = isPublic;
        this.domainJoined = domainJoined;

        this.forms = forms;
        this.primaryForms = primaryForms;

        this.sts = sts;

        if (!this.lfds) {
            this.portsToLFDS.push(443, 5048, 5049);

            if (this.forms) {
                this.portsToLFDS.push(80, 443, 8738);
            }
            if (this.webAccess) {
                this.portsToLFDS.push(80, 443, 8081);
            }
            if (this.webLink) {
                this.portsToLFDS.push(80, 443)
            }
            // if (this.workflow) {
            //     nothing to do for workflow, leaving this in for consistency/ notation
            // }
            if (this.lfs) {
                this.portsToLFDS.push(80, 5051);
            }
            if (this.sql) {
                this.portsToLFDS.push(1433);
            }
        }

        if (!this.lfs) {
            this.portsToLFS.push(80, 5051)
            if (this.forms) {
                // TODO: verify that the routing services push to LFS, not Forms primary
                this.portsToLFS.push(80, 443, 8168, 8268, 8732, 8736, 8181);
            }
            if (this.webAccess) {
                this.portsToLFDS.push(80, 443);
            }
            if (this.webLink) {
                this.portsToLFDS.push(80, 443);
            }
            if (this.workflow) {
                this.portsToLFS.push(80, 8085);
            }
            // if (this.lfds) {
            //     // already handled in LFDS portion of constructor
            // }
            if (this.sql) {
                this.portsToLFS.push(1433);
            }
        }
        // deletes the duplicats out of the arrays and sorts by port number
        this.portsToLFDS = [...new Set(this.portsToLFDS)];
        this.portsToLFDS.sort(function(first, second) {
            return first > second;
        });
        this.portsToLFS = [...new Set(this.portsToLFS)];
        this.portsToLFS.sort(function(first, second) {
            return first > second;
        });
    }
}

class ServerList {
    servers = [];
    constructor() {
        this.servers = [];
    }
}

class Instruction {
    constructor(step, responsibility, required, header, substeps) {
        this.step = step;
        this.responsibility = responsibility;
        this.required = required;
        this.header = header;
        this.substeps = substeps;
    }
}

// on clicking the return button, returns a ServerList object
// which contains a list of all servers as configured and their properties
const returnResultsButton = document.querySelector('.generate-instructions');
returnResultsButton.addEventListener('click', createPopup);

function createServerList() {
    let serverList = new ServerList();
    document.querySelectorAll('.server').forEach(function(thisServer) {
        const name = thisServer.querySelector('input[name=server-name]').value;
        const forms = thisServer.querySelector('input[name=forms]').checked;
        const webAccess = thisServer.querySelector('input[name=webaccess]').checked;
        const webLink = thisServer.querySelector('input[name=weblink]').checked;
        const workflow = thisServer.querySelector('input[name=workflow]').checked;
        const lfs = thisServer.querySelector('input[name=server]').checked;
        const lfds = thisServer.querySelector('input[name=lfds]').checked;
        const sts = thisServer.querySelector('input[name=sts]').checked;
        const sql = thisServer.querySelector('input[name=sql]').checked;

        const domainJoined = thisServer.querySelector('input[name=domain]').checked;
        const isPublic = thisServer.querySelector('input[name=public]').checked;
        const primaryFormsOption = thisServer.querySelector('input[name=primaryForms]');
        const primaryForms = primaryFormsOption ? primaryFormsOption.checked : false;

        let server = new Server(name, forms, webAccess, webLink, workflow,
            lfs, lfds, sql, isPublic, domainJoined, primaryForms, sts);
        serverList.servers.push(server);
    });
    console.log(serverList.servers);
    return serverList;
}

function generateInstructions(serverList) {
    let instructions = [];

    //#region establishes the overall configuration
    // TODO: create an EnvironmentConfiguration object if this gets unweildy 
    // or change the ServerList object to be the config object and run this in the constructor
    let lfdsServerName;
    let lfsServerName;
    let sqlServerName;

    let hasPublicWebLink = false;

    let secondaryFormsServerNames = [];
    let primaryFormsServerName;

    serverList.servers.forEach(server => {
        if (server.lfds) {
            lfdsServerName = server.name;
        }
        if (server.lfs) {
            lfsServerName = server.name;
        }
        if (server.sql) {
            sqlServerName = server.name;
        }
        if (server.primaryForms) {
            primaryFormsServerName = server.name;
        }
        if (server.forms) {
            secondaryFormsServerNames.push(server.name);
        }
        if (server.webLink && server.isPublic) {
            hasPublicWebLink = true;
        }
    });
    //#endregion

    // generates an array of instructions from new Instructions objects, which we can clean up later
    serverList.servers.forEach(server => {
        let stsServerName = server.sts ? server.name : lfdsServerName;

        instructions.push(new Instruction(0, "Customer", true, "Pre-install: Install SQL Server and SQL Server Management Studio on " + sqlServerName + ".", [
            "Set up an SA account to use for DB connections, and enable Mixed Mode Authentication on the server."
        ]));
        if (server.portsToLFDS.length > 0) {
            instructions.push(new Instruction(50, "Customer", true, "Ensure the following ports are open between " + server.name + " and LFDS server " + lfdsServerName + ".", server.portsToLFDS));
        }
        if (server.portsToLFS > 0) {
            instructions.push(new Instruction(65, "Customer", true, "Ensure the following ports are open between " + server.name + " and LFS server " + lfsServerName + ".", server.portsToLFS));
        }

        if (server.lfds) {
            instructions.push(new Instruction(110, "VAR", true, "Install LFDS on " + lfdsServerName + ".", null));
            instructions.push(new Instruction(120, "VAR", true, "Open LFDS and install master license on " + lfdsServerName + ".", null));
        }
        if (server.lfs) {
            instructions.push(new Instruction(200, "VAR", true, "Install LFS on " + lfsServerName + ".", [
                "Use the database SA account set up in the pre-config steps.",
                "If using LFDS, use " + lfdsServerName + " as the licensing server."
            ]));
            instructions.push(new Instruction(210, "VAR", true, "Install desktop client with admin console on " + server.name + " and connect to your new instance.", [
                "If this is a migration: back up the SQL DBs from the old SQL server to the new, copy over all volumes, and run the Register Repository task in the admin console",
                "If this is a new install: Create a new repository from the admin console."
            ]));
        }
        if (server.primaryForms) {
            instructions.push(new Instruction(300, "VAR", true, "Install Forms on " + primaryFormsServerName + ".", ));
            instructions.push(new Instruction(310, "VAR", true, "Navigate to localhost/FormsConfig on " + server.name + " and configure with the following options:", [
                "Database page: DB name should be " + sqlServerName + "\\SQLEXPRESS by default and the user account is the SA account established already.",
                "Server page: Server name should be " + primaryFormsServerName + "/Forms by default."
            ]));
            // if there are secondary forms servers, need to take this step as well
            if (secondaryFormsServerNames.length > 0) {
                instructions.push(new Instruction(380, "VAR", true, "Since you have secondary forms instance(s), configure primary forms server " + server.name + " with the following:", [
                    '1. Open C:\\Program Files\\Laserfiche\\Laserfiche Forms\\Forms\\Web.config',
                    '1a. Locate the netTcpBinding node and set security mode from Transport to None',
                    '2. Open C:\\Program Files\\Laserfiche\\Laserfiche Forms\\Forms\\bin\\RoutingEngineServiceHost.exe.config',
                    '2a. Locate the netTcpBinding node and set security mode from Transport to None',
                    '3. Open C:\\Program Files\\Laserfiche\\Laserfiche Forms\\Config\\Web.config',
                    '3a. Locate the netTcpBinding node and set security mode from Transport to None'
                ]));
            }
        }

        if (server.forms && !server.primaryForms) {
            instructions.push(new Instruction(300, "VAR", true, "Install Forms on " + server.name + "."))
            instructions.push(new Instruction(310, "VAR", true, "Navigate to localhost/FormsConfig on " + server.name + " and configure with the following options:", [
                "Database page: DB name should be " + sqlServerName + "\\\\SQLEXPRESS by default and the user account is the SA account established already.",
                "Server page: Server name should be " + primaryFormsServerName + "/Forms by default.",
                "User Authentication: Select the authentication type. This guide will only cover LFDS: Input " + stsServerName + "/LFDSSTS as the STS instance name, set the forms admin to an admin account in LFDS, and set up the LFDS groups that should authenticate here."
            ]));
            if (server.domainJoined) {
                instructions.push(new Instruction(370, "VAR", true, "Since " + server.name + " is domain joined, do not modify the Forms config files with new endpoints.", null));
            } else {
                instructions.push(new Instruction(370, "VAR", true, "(Note, this assumes the modern version of Forms, 10.4 or later) Modify the Forms configuration files as follows:", [
                    "1. Open C:\\Program Files\\Laserfiche\\Laserfiche Forms\\Config\\Web.config.",
                    '1a. Find the endpoint address for lfrouting, by default this should start with "<endpoint address="net.tcp://localhost:8168/lfrouting" binding...".',
                    '1b. Change the enpdoint address from localhost to your primary forms instance, "<endpoint address="net.tcp://' + primaryFormsServerName + ':8168/lfrouting" binding...".',
                    '1c. Change the lflicensing endpoint in the same way, from localhost to "<endpoint address="net.tcp://' + primaryFormsServerName + ':8738/lflicensing" binding...".',
                    '1d. Locate the netTcpBinding block and change security mode from transport to none.',
                    '2. Open C:\\Program Files\\Laserfiche\\Laserfiche Forms\\Forms\\Web.config',
                    '2a. Locate the CWF client configuration block. Change the localhost references for lfrouting, lfpushnotification, lfautotrigger, lflicensing, and lfformexport endpoints, to ' + primaryFormsServerName + '.',
                    '2b. (For LFDS STS authentication only) Locate the wsFederation node and change the realm and reply attributes to the address of the DMZ server (' + server.name + '), and the issuer variable to the internal LFDS STS Server (' + stsServerName + ').',
                    '2c. Locate the netTcpBinding block and change security mode from transport to none.',
                    '3. Stop and disable the Forms services: LF Forms Routing, LF Notification Hub, LF Notification Master.'
                ]));
            }
        }
    });
    instructions.sort(function(a, b) {
        if (parseInt(a.step) < parseInt(b.step)) {
            return -1;
        } else if (parseInt(a.step) > parseInt(b.step)) {
            return 1
        } else {
            return 0;
        }
    })
    return instructions;
}

function createHTML(instructions) {
    let html = '<div class="instructions-wrapper"><ol>'
    let counter = 0;
    instructions.forEach(instruction => {
        counter++;
        html += '<li><p>' + instruction.header + '</p>'
            // TODO: Fix this, it doesn't output the substeps
        if (instruction.substeps) {
            html += '<ol>';
            instruction.substeps.forEach(substep => {
                html += '<li>' + substep + '</li>';
            })
            html += '</ol>';
        }
        html += '</li>';
    });
    html += '</ol></div>'
    return html;
}

function createPopup() {
    let serverList = createServerList();
    let instructions = generateInstructions(serverList);
    let html = createHTML(instructions);
    let newWindow = window.open('');
    newWindow.document.write(html);
}