// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const homedir = require('os').homedir();
const axios = require('axios');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const TOKEN_PATH = homedir + "/.bitfuel/key.txt";
const TOKEN_FULL_PATH = homedir + "/.bitfuel/key.txt";

var cachedToken;
var getToken = () => {
	if (cachedToken) return cachedToken;
	var token;
	try {
		token = fs.readFileSync(TOKEN_PATH, 'utf8');
	} catch (err) {
		console.log(err);
	}

	if (!token || !token.length) {
		vscode.window.showInformationMessage("We couldn't find your token\n\nIf you have one run BitFuel login\n\nIf you don't please get one at www.bitfuel.dev", {modal: true });
		return false;
	}
	cachedToken = token;
	return token;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let loginCommand = vscode.commands.registerCommand('bitfuel.login', function () {
		vscode.window.showInputBox({
			placeHolder: "<your token>",
			prompt: "Put your token here",
			value: ""
		}).then((token)=> {
			if (!token || !token.length) {
				vscode.window.showErrorMessage('No Token Provided');
				return;
			}

			try {
				fs.writeFileSync(TOKEN_PATH, token);
				cachedToken = token;
				vscode.window.showInformationMessage("BitFuel token saved");
			} catch (err) {
				vscode.window.showErrorMessage("Couldn't write token to file", err);
			}
		})
	});
	context.subscriptions.push(loginCommand);

	let saveCommand = vscode.commands.registerCommand('bitfuel.save', function () {
		var token = getToken();
		if (!token) return;

		const editor = vscode.window.activeTextEditor;
		const selectedText = editor?.document.getText(editor.selection);

		vscode.window.showInputBox({
			placeHolder: "description",
			prompt: "Describe your code",
			value: ""
		}).then((description)=> {
			if (!description || !description.length || !selectedText || !selectedText.length) {
				vscode.window.showErrorMessage('Nothing to save');
				return;
			}

			axios.get(
				"https://bitfuel.dev/api/describe" + "?token=" + token + "&descript=" + description + "&command=" + selectedText
			).then(() => {
				vscode.window.showInformationMessage("BitFuel saved " + description);
			}).catch((err)=> {
				vscode.window.showErrorMessage("Couldn't save " + description + " " + err);
			})
		});
	});
	context.subscriptions.push(saveCommand);

	var command;
	let getCommand = vscode.commands.registerCommand('bitfuel.get', function () {
		var token = getToken();
		if (!token) return;

		vscode.window.showInputBox({
			placeHolder: "description",
			prompt: "Describe your code to fetch",
			value: ""
		}).then((description)=> {
			if (!description || !description.length) {
				vscode.window.showErrorMessage('Nothing to save');
				return;
			}

			description = description.trim();

			var endpoint = "https://bitfuel.dev/api/recall" + "?token=" + token + "&prompt=" + description;

			axios.get(
				endpoint
			).then((res) => {
				command = res.data.command;
				vscode.commands.executeCommand("bitfuel.write");
				vscode.window.showInformationMessage("BitFuel got " + command);
			}).catch((err)=> {
				if (err == "400") {
					vscode.window.showErrorMessage("Please double check your token, unauthorized");	
				}
				vscode.window.showErrorMessage("Couldn't get " + description + " " + err);
			});

		})
	});
	context.subscriptions.push(getCommand);

	vscode.commands.registerTextEditorCommand('bitfuel.write', (editor, edit) => {
		editor.selections.forEach((selection, i) => {
			edit.insert(selection.active, command);  // insert at current cursor
		})
	});

	let runCommand = vscode.commands.registerCommand('bitfuel.run', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		var key = fs.readFileSync(homedir + "/.bitfuel/key.txt", 'utf8')
		console.log("got key successfully", key);
		vscode.window.showInformationMessage('Hello World from BitFuel! ' + key);
	});
	context.subscriptions.push(runCommand);

	let helpCommand = vscode.commands.registerCommand('bitfuel.help', function () {
		const url = `https://bitfuel.dev`;
		vscode.env.openExternal(url);
	});
	context.subscriptions.push(helpCommand);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
