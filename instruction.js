// defines servers and serverlist classes
class Server {
    constructor(name, forms, webAccess, webLink, workflow, lfs, lfds, sql, isPublic, domainJoined, primaryForms) {
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
        this.changeFormsEndpoints = false;

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

        if (this.forms && !this.primaryForms) {
            this.changeFormsEndpoints = true;
        }
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
const returnResultsButton = document.querySelector('.log-options');
returnResultsButton.addEventListener('click', createServerList);

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
        const sql = thisServer.querySelector('input[name=sql]').checked;
        const domainJoined = thisServer.querySelector('input[name=dmz]').value === 'Yes';
        const isPublic = thisServer.querySelector('input[name=public]').value === 'Yes';

        const primaryFormsOption = thisServer.querySelector('input[name=formsPrimary]');
        const primaryForms = primaryFormsOption == null ? false : primaryFormsOption.value === 'Yes';

        let server = new Server(name, forms, webAccess, webLink, workflow,
            lfs, lfds, sql, isPublic, domainJoined, primaryForms);
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

    serverList.forEach(server => {
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
    serverList.forEach(server => {
        if (server.lfds) {
            instructions.push(new Instruction(110, "VAR", true, "Install LFDS on " + lfdsServerName + ".", null));
            instructions.push(new Instruction(120, "VAR", true, "Open LFDS and install master license on " + lfdsServerName + ".", null));
        }
        if (server.lfs) {
            instructions.push(new Instruction(200, "VAR", true, "Install LFS on " + lfsServerName + ".", [
                "Use the database SA account set up in the pre-config steps.",
                "If using LFDS, use " + lfdsServerName + " as the licensing server."
            ]));
            instructions.push(new Instruction(210, "VAR", true, "Install desktop client with admin console and connect to your new instance.", [
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
        }

        // TODO: add STS options and instructions
        if (server.forms && !server.primaryForms) {
            instructions.push(new Instruction(350, "VAR", true, "Install Forms on " + server.name + "."))
            instructions.push(new Instruction(310, "VAR", true, "Navigate to localhost/FormsConfig on " + server.name + " and configure with the following options:", [
                "Database page: DB name should be " + sqlServerName + "\\SQLEXPRESS by default and the user account is the SA account established already.",
                "Server page: Server name should be " + primaryFormsServerName + "/Forms by default."
            ]));
        }
    })
}