const serverHTML = `
   <div class="top-row">
      <div class="server-name">
         <label for="server-name">Server Name:</label>
         <input type="text" name="server-name">
      </div>
      <div class="delete-container">
         X
      </div>
   </div>
   <div class="software-options options-section">
      <h3>Software to install on this server:</h3>
      <div class="option">
         <input type="checkbox" name="forms">
         <label for="forms">Forms 10.4.4</label>
      </div>
      <div class="option">
         <input type="checkbox" name="webaccess">
         <label for="webaccess">Web Access 10.4.4</label>
      </div>
      <div class="option">
         <input type="checkbox" name="weblink">
         <label for="weblink">WebLink 10.2</label>
      </div>
      <div class="option">
         <input type="checkbox" name="workflow">
         <label for="workflow">Workflow 10.4</label>
      </div>
      <div class="option">
         <input type="checkbox" name="server">
         <label for="server">LF Server 10.4.2</label>
      </div>
      <div class="option">
         <input type="checkbox" name="lfds">
         <label for="lfds">LFDS 10.4.2</label>
      </div>
      <div class="option">
         <input type="checkbox" name="sql">
         <label for="sql">SQL Server instance</label>
      </div>
   </div>
   <div class="config-options options-section">
      <h3>Other server options:</h3>
      <div class="option">
         <h5>Domain Joined?</h5>
         <input type="radio" name="dmz" value="yes">
         <label for="yes">Yes</label>
         <input type="radio" name="dmz" value="no">
         <label for="no">No</label>
      </div>
      <div class="option">
         <h5>Publicly Accessible?</h5>
         <input type="radio" name="public" value="yes">
         <label for="yes">Yes</label>
         <input type="radio" name="public" value="no">
         <label for="no">No</label>
      </div>
   </div>`;

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
// function to add a new server object on clicking the button
const addServerButton = document.querySelector('button.add-server');
addServerButton.addEventListener('click', function() {
    // create a new server node
    let element = document.createElement('div');
    element.innerHTML = serverHTML;
    element.classList.add('server');

    // append the server node to the container
    const serverContainer = document.querySelector('div.server-container');
    serverContainer.appendChild(element);

    // add the event listener so it can delete itself
    element.querySelector('.delete-container').addEventListener('click', deleteSelf);
});

// function to delete 
function deleteSelf() {
    this.closest('.server').remove();
}

// on selecting the form install button on anything, checks if
// there will be multiple forms servers. if yes, adds the primary
// forms option to all of them. If no, removes them
const formsOptions = document.querySelectorAll('input[name=forms]');
formsOptions.addEventListener('change', function() {
    let numberFormsServers = 0;
    let checkedFormsOptions = document.querySelectorAll('input[name=forms]:checked');
    const formsPrimaryHTML =
        `<h5>Primary Forms Server?</h5>
			<input type="radio" name="public" value="yes">
			<label for="yes">Yes</label>
			<input type="radio" name="public" value="no">
			<label for="no">No</label>`;
    if (checkedFormsOptions.length > 1) {
        const formsOptionsElement = document.createElement('div');
        formsOptionsElement.classList.add('option');
        formsOptionsElement.innerHTML = formsPrimaryHTML;
        checkedFormsOptions.forEach(function(checkbox) {
            checkbox.closest('.server').find('.config-options')
                .appendChild(formsOptionsElement)
        });
    }
})


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
        const primaryForms = thisServer.querySelector('input[name=formsPrimary]').value === 'Yes';
        let server = new Server(name, forms, webAccess, webLink, workflow,
            lfs, lfds, sql, domainJoined, public, primaryForms);
        serverList.servers.push(server);
    });
    console.log(serverList.servers);
    return serverList;
}