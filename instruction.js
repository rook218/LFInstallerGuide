// defines servers and serverlist classes
class Server {
    constructor(name, forms, webAccess, webLink, workflow, lfs, lfds, sql) {
        this.name = name;
        this.forms = forms;
        this.webAccess = webAccess;
        this.webLink = webLink;
        this.workflow = workflow;
        this.lfs = lfs;
        this.lfds = lfds;
        this.sql = sql;
    }
}

class ServerList {
    servers = [];
    constructor() {
        this.servers = [];
    }
}

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
        const primaryForms = thisServer.querySelector('input[name=formsPrimary]').value === 'Yes';
        let server = new Server(name, forms, webAccess, webLink, workflow,
            lfs, lfds, sql, domainJoined, public, primaryForms);
        serverList.servers.push(server);
    });
    console.log(serverList.servers);
    return serverList;
}

function generatePortListings(serverList) {
    const licenseServer = serverList.filter(function(server) {
        return server.lfds;
    });
    const repoServer = serverList.filter(server => {
        return server.lfs;
    });

    serverList.forEach(server => {
            let requiredPorts = [];
            if (server != licenseServer) {
                requiredPorts.push(80, 443, 5048, 5049);
            }
            if (server != repoServer) {
                requiredPorts.push(80, 5051);
            })
    })
}