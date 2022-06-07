use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
var keypress = require("keypress");

// Try it out in `playground.js`
function activate(context) {

    console.log(context)
    const disposable = vscode.commands.registerCommand('extension.inline-completion-settings', () => {
        vscode.window.showInformationMessage('Show settings');
    });
    context.subscriptions.push(disposable);
    let someTrackingIdCounter = 0;
    const provider = {
        provideInlineCompletionItems: async (document, position, context, token) => {
            console.log('provideInlineCompletionItems triggered!!');
            if (position.line <= 0) {
                return;
            }
            const start = 0;
            const startInt = parseInt(start, 10);
            const end = 10;
            const endInt = parseInt(end, 10);
            const insertText = "hello";
            console.log("insertText", insertText);
            return [
                {
                    insertText,
                    range: new vscode.Range(position.line, startInt, position.line, endInt),
                    someTrackingId: someTrackingIdCounter++,
                },
            ];
        },
    };
    vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map