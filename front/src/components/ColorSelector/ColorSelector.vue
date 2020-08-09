<template>
  <div>
    <dropdown
      :options="options"
      trackBy="name"
      label="name"
      description="Color"
      :multiple="false"
      :arrayOfStrings="false"
      @value="setValue"
    />
  </div>
</template>

<script>

  import Dropdown from '../Dropdown/Dropdown.vue';

  export default {
		name: "ColorSelector",
    components: { Dropdown },
    props: ["value"],
    data() {
      return {
        options: [
          {
            name: "red",
            hex: "ff2828"
          }, 
          {
            name: "blue",
            hex: "2841ff"
          },
          {
            name: "green",
            hex: "00cc33"
          },
          {
            name: "purple",
            hex: "c000cc"
          },
          {
            name: "yellow",
            hex: "e7d62b"
          },
          {
            name: "brown",
            hex: "90681d"
          },
        ],
      }
    },
    methods: {
      setValue(v) {
        this.$emit("value", v)
      }
    }
	}
</script>

<style>

</style>