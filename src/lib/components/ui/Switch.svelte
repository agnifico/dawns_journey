<script lang="ts">
	export let text1: String = 'One';
	export let text2: String = 'Two';
	export let fn: () => void;
</script>

<input
	type="checkbox"
	checked="checked"
	id="favorite"
	name="favorite-checkbox"
	value="favorite-button"
/>
<label for="favorite" class="container" on:click={fn}>
	<div class="action">
		<span class="option-1">View: {text2}</span>
		<span class="option-2">View: {text1}</span>
	</div>
</label>

<style>
	label {
		background-color: var(--surface-1);
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 0.5rem;
		cursor: pointer;
		user-select: none;
		border-radius: 10px;
		font-family: 'DePixel';
		font-size: 1rem;
		box-sizing: border-box;
		color: var(--orange);
		text-align: center;
		background: rgb(63, 46, 13);
		/* border: 1px solid rgba(200, 169, 110, 0.28); */
		box-shadow: #00000056 0 4px 0 2px;
		margin-bottom: 0.25rem;
		border: 3px solid rgba(209, 155, 62, 0.4);
		transition: 0.25s all ease;
		&:active {
      transform: translateY(2px);
      box-shadow: #00000056 0 2px 0 2px;
		}
	}

	input {
		display: none;
	}

	input + label .action {
		position: relative;
		overflow: hidden;
		display: grid;
	}

	input + label .action span {
		grid-column-start: 1;
		grid-column-end: 1;
		grid-row-start: 1;
		grid-row-end: 1;
		transition: all 0.25s;
	}

	input + label .action span.option-1 {
		transform: translate(0px, 0%);
		opacity: 1;
	}

	input:checked + label .action span.option-1 {
		transform: translate(0px, -100%);
		opacity: 0;
	}

	input + label .action span.option-2 {
		transform: translate(0px, 100%);
		opacity: 0;
	}

	input:checked + label .action span.option-2 {
		transform: translate(0px, 0%);
		opacity: 1;
	}
</style>
