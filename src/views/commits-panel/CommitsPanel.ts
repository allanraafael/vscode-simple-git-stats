import * as vscode from 'vscode';

export default class CommitsPanel {
  public static currentPanel: CommitsPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(comitsPerAuthor: any) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    if (CommitsPanel.currentPanel) {
      CommitsPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel("CommitsPanel", "CommitsPerAuthor", column || vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    CommitsPanel.currentPanel = new CommitsPanel(panel, comitsPerAuthor);
  }

  private constructor(panel: vscode.WebviewPanel, comitsPerAuthor:any) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel = panel;
    const webViewContent = this.getWebviewContent(comitsPerAuthor);
    this._panel.webview.html = webViewContent;
  }

  private getWebviewContent(comitsPerAuthor: any | []) {
    const labels = comitsPerAuthor.map((commit:any) => `'${commit.author} (${commit.totalCommits})'`).join(', ');
    const data = (comitsPerAuthor.map((commit:any) => commit.totalCommits)).toString();
    return `<!DOCTYPE html>
          <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Signin</title>
            </head>
            <body>
              <canvas id="myChart"></canvas>
              <script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
              <script>
                const vscode = acquireVsCodeApi();
                (function init() {
                  document.vscode = vscode;
                })();
              </script>
              <script>
                var ctx = document.getElementById('myChart');
                var chart = new Chart(ctx, {
                  type: 'pie',
                  data: {
                    labels: [${labels}],
                    datasets: [{
                        data: [${data}],
                        backgroundColor: ['#00bcd4', '#ffa0d2', '#ffa726', '#00bfa5', '#03a9f4', '#1976d2', '#c1c1c1', '#127ffc']
                    }]
                  },
                  options: {
                    maintainAspectRatio: true,
                    responsive: true,
                    legend: {
                      display: true,
                      position: 'right',
                    }
                  }
                });
              </script>
            </body>
            <style>
              body.vscode-light .username, body.vscode-light .password {
                color: #616466;
              }
              body.vscode-dark .username, body.vscode-dark .password {
                color: #C2C7CC;
              }
            </style>
          </html>`;
  }
  
    public dispose() {
      CommitsPanel.currentPanel = undefined;
      // Clean up our resources
      this._panel.dispose();
  
      while (this._disposables.length) {
        const panel = this._disposables.pop();
        if (panel) {
          panel.dispose();
        }
      }
    }
}