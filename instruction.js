// defines servers and serverlist classes
class Server {
    constructor(name, forms, webAccess, webLink, workflow, lfs, lfds, sql, primaryForms) {
        this.portsToLFDS = [];
        this.portsToLFS = [];

        this.name = name;
        this.forms = forms;
        this.webAccess = webAccess;
        this.webLink = webLink;
        this.workflow = workflow;
        this.lfs = lfs;
        this.lfds = lfds;
        this.sql = sql;
        this.primaryForms = primaryForms;

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
        })
    }
}

class ServerList {
    servers = [];
    constructor() {
        this.servers = [];
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
        const public = thisServer.querySelector('input[name=public]').value === 'Yes';

        const primaryFormsOption = thisServer.querySelector('input[name=formsPrimary]');
        const primaryForms = primaryFormsOption == null ? false : primaryFormsOption.value === 'Yes';

        let server = new Server(name, forms, webAccess, webLink, workflow,
            lfs, lfds, sql, domainJoined, public, primaryForms);
        serverList.servers.push(server);
    });
    console.log(serverList.servers);
    return serverList;
}