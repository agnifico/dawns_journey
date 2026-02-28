<script lang="ts">
    export let text1: String = "One";
    export let text2: String = "Two";
    export let fn: () => void;
</script>

<input type="checkbox" checked="checked" id="favorite" name="favorite-checkbox" value="favorite-button">
<label for="favorite" class="container" on:click={fn}>
  <div class="action">
    <span class="option-1">{text1}</span>
    <span class="option-2">{text2}</span>
  </div>
</label>

<style>
  label {
   background-color: var(--surface-1);
   display: flex;
   align-items: center;
   gap: 14px;
   padding: .5rem;
   cursor: pointer;
   user-select: none;
   border-radius: 10px;
   box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
   color: black;
   font-family: "DePixel";
        font-size: 1rem;
        color: var(--text-header);


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
   transition: all .25s;
  }

  input + label .action span.option-1 {
   transform: translate(0px,0%);
   opacity: 1;
  }

  input:checked + label .action span.option-1 {
   transform: translate(0px,-100%);
   opacity: 0;
  }

  input + label .action span.option-2 {
   transform: translate(0px,100%);
   opacity: 0;
  }

  input:checked + label .action span.option-2 {
   transform: translate(0px,0%);
   opacity: 1;
  }
</style>
