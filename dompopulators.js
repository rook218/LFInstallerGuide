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

// function to add a new server object on clicking the button
const addServerButton = document.querySelector('button.add-server');
let formsOptions = document.querySelectorAll('input[name=forms]');
addServerButton.addEventListener('click', addNewServer);

function addNewServer() {
    // create a new server node
    let element = document.createElement('div');
    element.innerHTML = serverHTML;
    element.classList.add('server');

    // append the server node to the container
    const serverContainer = document.querySelector('div.server-container');
    serverContainer.appendChild(element);

    // add the event listener so it can delete itself
    element.querySelector('.delete-container').addEventListener('click', function() {
        this.closest('.server').remove();
    });

    // updates the forms options variable to include the new
    // server and adds an event listener
    formsOptions = document.querySelectorAll('input[name=forms]');
    formsOptions.forEach(formsOption => {
        formsOption.addEventListener('change', onFormsServerChange);
    });
}

// on selecting the form install button on anything, checks if
// there will be multiple forms servers. if yes, adds the primary
// forms option to all of them. If no, removes them
function onFormsServerChange() {
    // removes the option globally to start
    document.querySelectorAll('.primary-forms').forEach(primaryOption => {
            primaryOption.remove();
        })
        // creates the element that we'll append
    const formsPrimaryHTML =
        `<h5>Primary Forms Server?</h5>
	   <input type="radio" name="public" value="yes">
	   <label for="yes">Yes</label>
	   <input type="radio" name="public" value="no">
	   <label for="no">No</label>`;
    const formsOptionsElement = document.createElement('div');
    formsOptionsElement.classList.add('option')
    formsOptionsElement.classList.add('primary-forms');
    formsOptionsElement.innerHTML = formsPrimaryHTML;

    // if we have multiple forms servers, append the option to every one that's checked
    let checkedFormsOptions = document.querySelectorAll('input[name=forms]:checked');
    if (checkedFormsOptions.length > 1) {
        checkedFormsOptions.forEach(function(checkbox) {
            let localOption = formsOptionsElement.cloneNode();
            localOption.innerHTML = formsPrimaryHTML;
            checkbox.closest('.server').querySelector('.config-options')
                .appendChild(localOption)
        });
    }
}



// on clicking the return button, returns a ServerList object
// which contains a list of all servers as configured and their properties
const returnResultsButton = document.querySelector('.log-options');
returnResultsButton.addEventListener('click', createServerList);