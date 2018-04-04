````javascript  
{
    "workbench.startupEditor": "newUntitledFile",
    "atomKeymap.promptV3Features": true,
    "editor.multiCursorModifier": "ctrlCmd",
    "editor.formatOnPaste": true,
    "editor.fontSize": 15,
    "window.zoomLevel": 0,
    "files.autoSave": "afterDelay",
    "window.menuBarVisibility": "default",
    "workbench.statusBar.visible": true,
    "workbench.activityBar.visible": true,
    "editor.minimap.enabled": true,
    "editor.detectIndentation": false,
    "eslint.autoFixOnSave": true,
    "prettier.tabWidth": 4,
    "prettier.eslintIntegration": true,
    "vetur.format.defaultFormatter.js": "prettier",
    "editor.formatOnSave": true, // 编辑器保存自动格式化
    "prettier.semi": false, // 语句结束不添加分号
    "prettier.singleQuote": true, // 字符串使用单引号,
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        {
            "language": "vue",
            "autoFix": true
        }
    ],
    // 使用 js-beautify-html 插件格式化 html
    "vetur.format.defaultFormatter.html": "js-beautify-html",
    // 格式化插件的配置
    "vetur.format.defaultFormatterOptions": {
        "js-beautify-html": 
        {
            "wrap_attributes": "force-aligned",
        }
    }
}
````