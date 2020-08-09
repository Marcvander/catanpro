<template>
  <div class="inline">
    <multiselect
      v-model="value"
      :label="arrayOfStrings ? null : (label ? label : 'name')"
      :track-by="arrayOfStrings ? null : (trackBy ? trackBy : '_id')"
      :placeholder="description"
      open-direction="bottom"
      :options="options"
      :multiple="multiple"
      :searchable="true"
      :loading="false"
      :internal-search="true"
      :clear-on-select="false"
      :close-on-select="true"
      :options-limit="300"
      :max-height="600"
      :show-no-results="false"
      :hide-selected="true"

      tag-placeholder="Add this as entry"
      select-label=""
    >
      <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
      <template
        v-if="!arrayOfStrings"
        v-for="(_, name) in $scopedSlots"
        :slot="label ? label : name"
        slot-scope="slotData"
      >
        <slot
          :name="label ? label : name"
          v-bind="slotData"
        />
      </template>
    </multiselect>
  </div>
</template>

<script>
	import Multiselect from '../Multiselect/Multiselect';
  import _ from 'lodash';

	export default {
		name: "DropdownGeneric",
    components: { Multiselect },
		props: {
      options: Array,
      multiple: {
        type: Boolean,
        default: false
      },
      arrayOfStrings: {
        type: Boolean,
        default: false
      },
      label: String,
      trackBy: String,
      description: String
    },
		data () {
			return {
        value: null
			}
    },
    computed: {

    },
		async created() {

    },
    watch: {
      value: {
        handler(v) {
          this.$emit("value", v);
        },
        deep: true
      }
    },
		methods: {

		}
	}
</script>

<style src="./Dropdown.scss" lang="scss" />
