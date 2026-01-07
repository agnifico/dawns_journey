<script lang="ts">
    export let element: string;
</script>

<div class="element-tag" title={element}>
    <img src={`/images/${element.toLowerCase()}.png`} alt={element} class="element-icon" />
    <span class="element-name {element.toLowerCase()}">{element.toUpperCase() }</span>
</div>

<style>
    .element-tag {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        background-color: var(--black);      
        padding: 0.2rem 0.25em 0.2rem 0.25rem;
        border-radius: 6px;
        border: 1px solid var(--color-border);
        font-family: var(--font-family-pixel);
        font-size: .50rem;
        color: var(--color-text-muted);
        border: 2px solid rgba(0, 0, 0, 0.5);
    }
    .element-icon {
        width: 20px;
        height: 20px;
    }
    .element-name {
        /* font-weight: bold; */
        margin-bottom: 0;
        margin-top: auto;
    }


    .fire {
		color: #cc4113;
	}

	.water {
		color: #276b9f;
	}

	.earth {
		color: #2db55a;
	}

	.wind {
		color: #47ddff;
	}

	.light {
		color: #f0e68c;
	}

	.dark {
		color: #f8a6d4;
	}
</style>
