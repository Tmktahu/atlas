<script>
export default {
  metaInfo: {
    title: 'Loading page...',
    meta: [{ name: 'description', content: 'Loading page...' }],
  },
  components: {},
};
</script>

<template>
  <v-container>
    <span appear>
      <!-- <BaseIcon :class="$style.loadingIcon" name="sync" spin /> -->
    </span>
  </v-container>
</template>

<style lang="scss" module>
.loadingIcon {
  // @extend %typography-xxlarge;

  // display: block;
  // margin: 0 auto;

  // // stylelint-disable-next-line selector-class-pattern
  // &:global(.v-enter-active) {
  //   transition: opacity 1s;
  // }
  // // stylelint-disable-next-line selector-class-pattern
  // &:global(.v-enter) {
  //   opacity: 0;
  // }
}
</style>
