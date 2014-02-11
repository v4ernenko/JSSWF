# JSSWF

Yet another tool for embedding Flash application.

## Usage

```js
if (JSSWF.version && JSSWF.version[0] >= 9) {
    var options = {
        vars: {
            someVar: 'someValue'
        },

        attrs: {
            width: 250,
            height: 100
        },

        params: {
            allowScriptAccess: 'always'
        }
    };

    var flashObject = JSSWF.embedFlash('containerId', '/example.swf', options);
}
```

## License

MIT
