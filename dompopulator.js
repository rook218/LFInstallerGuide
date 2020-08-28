const serverHTML = `
   <div class="top-row">
      <div class="server-name">
         <label for="server-name">Server FQDN:</label>
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
   <div class="option">
        <input type="checkbox" name="sts">
        <label for="sts">STS instance</label>
    </div>
    </div>
    <div class="config-options options-section">
        <h3>Other server options:</h3>
        <div class="option">
            <input type="checkbox" name="domain">
            <label for="domain">Domain Joined</label>
        </div>
        <div class="option">
            <input type="checkbox" name="public">
            <label for="public">Publicly Accessible</label>
        </div>
   </div>`;

// function to add a new server object on clicking the button
let formsOptions = document.querySelectorAll('input[name=forms]');
const addServerButton = document.querySelector('button.add-server');
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

    addEventListenersForServerNameFields();

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
        `<div class="option">
            <input type="checkbox" name="primaryForms">
            <label for="public">Primary Forms?</label>
        </div>`;
    const formsOptionsElement = document.createElement('div');
    formsOptionsElement.classList.add('option')
    formsOptionsElement.classList.add('primary-forms');
    formsOptionsElement.innerHTML = formsPrimaryHTML;

    // if we have multiple forms servers, append the option to every one that's checked
    let checkedFormsOptions = document.querySelectorAll('input[name=forms]:checked');
    if (checkedFormsOptions.length > 1) {
        checkedFormsOptions.forEach(function(checkbox) {
            let localOption = formsOptionsElement.cloneNode(true);
            checkbox.closest('.server').querySelector('.config-options')
                .appendChild(localOption)
        });
    }

    // checks to make sure that if there is an option for primary forms, that only one is selected

    // selects all the primaryOptions, since there may be new ones after changing the forms install options
    let primaryOption = document.querySelectorAll('input[name=primaryForms]');
    primaryOption.forEach(pOption => { // foreach primary forms option, adds an event listener
        pOption.addEventListener('change', function(event) {
            let checked = event.target.checked; // checks if the user checked (true) or unchecked (false) the box
            if (checked) { // if it was checked, then remove the checkbox from every primary forms option on the board (including the one we just set)
                primaryOption.forEach(option => {
                    option.checked = false;
                })
            }
            event.target.checked = checked; // sets the checked status of the element back to what the user action was
        })
    });
}

// Validation section

//#region Event Listeners for validating that each server has a name
function addEventListenersForServerNameFields() {
    // Validates that server names are all filled in
    let serverNameFields = document.querySelectorAll('.server-name input');
    serverNameFields.forEach(field => {
        field.addEventListener('change', validateServerNames);
    });
    validateServerNames();
}
addEventListenersForServerNameFields();

function validateServerNames() {
    let serverNamesValid = true;
    let serverNameFields = document.querySelectorAll('.server-name input');
    serverNameFields.forEach(field => {
        if (field.value.length === 0) {
            serverNamesValid = false;
        }
    });
    if (!serverNamesValid) {
        document.querySelector('.generate-instructions').disabled = true;
        document.querySelector('.generate-instructions').style.cursor = 'not-allowed';
    } else {
        document.querySelector('.generate-instructions').disabled = false;
        document.querySelector('.generate-instructions').style.cursor = 'pointer';
    }
}
validateServerNames();
//#endregion