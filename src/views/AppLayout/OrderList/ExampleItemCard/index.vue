<template>
  <div
    class="item-card"
    @mouseenter="getFocus=true"
    @mouseleave="getFocus=false"
    @click="itemClick"
  >
    <div
      class="item-name"
      :class="{'item-name-highlight':getFocus,'is-active':sampleItem.path==activePath}"
    >{{sampleItem.meta.title}}</div> 
  </div>
</template>

<script>
export default {
  name: "ItemCard",
  data() {
    return {
      getFocus: false
    };
  },

  props: {
    sampleItem: {
      type: Object
    },
    activePath: ""
  },

  methods: {
    itemClick() {
      this.$emit("itemClick", this.sampleItem);
    }
  }
};
</script>

<style   scoped>
.item-card {
  position: relative;
  height: 45px;
  width: 352px;
  background: #256a82;
  margin: 10px 12px;
  display: inline-block;
  cursor: pointer;
  border: 1px solid rgba(0, 89, 255, 0);
}

.item-card:hover {
  border: 1px solid #095bf3;
}

.item-name {
  position: absolute;
  top: 0px;
  height: 30px;
  width: 100%;
  color: white;
  line-height: 30px;
  text-align: center;
  background: rgb(15 29 109 / 94%);
}

.item-name-highlight {
  color: yellow;
}

.item-img {
  height: 100%;
  width: 100%;
}

.is-active {
  background: rgb(20 55 154 / 97%);
  color: yellow;
  font-size: 20px;
}
</style>