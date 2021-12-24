<template>
  <div class="app-home">
    <div class="sample-items">
      <div class="items" id="sample-items">
        <Item
          v-for="item  in examples"
          :key="item.path"
          :sampleItem="item"
          :activePath="activePath"
          @itemClick="itemClick"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Item from "./ExampleItemCard"; 
import examples from "@/router/routers";

export default {
  name: "OrderList",
  components: { 
    Item, 
  },

  data() {
    return {
      examples,
      activePath: ""
    };
  },

  methods: {
    itemClick(item) {
      // this.$router.push(item.path);
      window.open(item.path);
      this.activePath = item.path;
    }, 
    
  }
};
</script>

<style   scoped>
.app-home {
  width: 100%;
  height: 100%;
}

.sample-items { 
  height: 100%;
  background: black;
}

.items {
  height: 100%;
  overflow: auto;
  text-align: center;
}
</style>