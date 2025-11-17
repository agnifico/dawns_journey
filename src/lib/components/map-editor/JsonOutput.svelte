<script lang="ts">
    export let data: object;
    let jsonString: string;

    $: jsonString = JSON.stringify(data, undefined, 2);

    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^\"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(jsonString);
        alert('JSON copied to clipboard!');
    }
</script>

<div class="json-output-container">
    <button on:click={copyToClipboard}>Copy to Clipboard</button>
    <pre class="json-output" contenteditable="true" on:focus={(e) => (e.target as HTMLElement).select()}>
        {@html syntaxHighlight(jsonString)}
    </pre>
</div>

<style>
    .json-output-container {
        margin-bottom: 1em;
    }

    .json-output {
        background: #282c34;
        color: #abb2bf;
        padding: 1em;
        border-radius: 4px;
        overflow: auto;
        font-family: 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
        font-size: 0.9em;
        height: 200px; /* Fixed height */
        white-space: pre-wrap; /* Allow text to wrap */
        word-wrap: break-word; /* Break long words */
        -webkit-user-select: all; /* Allow selection on webkit browsers */
        -moz-user-select: all; /* Allow selection on firefox */
        -ms-user-select: all; /* Allow selection on IE/Edge */
        user-select: all; /* Standard syntax */
    }

    .json-output .string {
        color: #98c379;
    }

    .json-output .number {
        color: #d19a66;
    }

    .json-output .boolean {
        color: #56b6c2;
    }

    .json-output .null {
        color: #e06c75;
    }

    .json-output .key {
        color: #e5c07b;
    }

    button {
        margin-bottom: 0.5em;
        padding: 0.5em 1em;
        background-color: #61afef;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #528fcc;
    }
</style>