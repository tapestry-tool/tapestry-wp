<template>
  <div class="modal-container">
    <div v-if="allowClose" class="overlay" @click="$emit('close')"></div>
    <transition name="modal">
      <div v-if="load" class="content" :style="contentContainerStyle">
        <button
          v-if="allowClose"
          class="close-btn"
          :style="closeButtonStyle"
          @click="$emit('close')"
        >
          <div>
            <i class="fa fa-times"></i>
          </div>
        </button>
        <slot></slot>
        <button
          v-if="isFavourite"
          class="button-favourite"
          @click="removeFromFavourites"
        >
          <i class="fas fa-heart fa-sm"></i>
          <p>Remove node from favourites</p>
        </button>
        <button v-else class="button-favourite" @click="addToFavourites">
          <i class="fas fa-heart fa-sm"></i>
          <p>Add node to favourites</p>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"

const defaultStyles = {
  top: "150px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "600px",
  height: "400px",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}

export default {
  name: "tapestry-modal",
  props: {
    nodeId: {
      type: [String, Number],
      required: false,
      default: 0,
    },
    contentContainerStyle: {
      type: Object,
      required: false,
      default: () => defaultStyles,
    },
    closeButtonStyle: {
      type: Object,
      reuired: false,
      default: () => {},
    },
    allowClose: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      load: false,
    }
  },
  computed: {
    ...mapGetters(["getFavourites"]),
    favourites() {
      return this.getFavourites ? this.getFavourites : []
    },
    isFavourite() {
      return this.favourites.find(id => id == this.nodeId)
    },
  },
  mounted() {
    this.load = true
  },
  methods: {
    ...mapActions(["updateUserFavourites"]),
    addToFavourites() {
      let updatedFavouritesList = [...this.favourites]
      updatedFavouritesList.push(this.nodeId)
      this.updateUserFavourites(updatedFavouritesList)
    },
    removeFromFavourites() {
      let updatedFavouritesList = [...this.favourites]
      updatedFavouritesList = updatedFavouritesList.filter(id => id != this.nodeId)
      this.updateUserFavourites(updatedFavouritesList)
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
}

.content {
  position: absolute;
  z-index: 100;
  background-position: 0 0;
  background-size: cover;
  background-color: black;
  box-shadow: 0 0 100px -40px #000;
  border-radius: 15px;
}

.close-btn {
  width: auto;
  display: flex;
  justify-content: flex-end;
  background: none;
  border: none;
  outline: none;
  position: absolute;
  top: -37px;
  right: -42px;
  z-index: 20;

  > div {
    background: #666;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2em;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.16);
    transition: all 0.25s ease;
    border: solid 2px #fff;

    &:hover {
      transform: scale(1.15);
      background: #11a6d8;
    }

    i {
      background: none;
    }
  }
}

.button-favourite {
  align-items: center;
  justify-content: center;
  margin: 0;
  margin-top: 20px;
  border-radius: 4px;
  text-align: left;
  padding: 0 10px;

  &:hover,
  &:focus {
    transform: scale(1.15);
    background: #11a6d8;
    outline: none;
  }

  i {
    margin-right: 8px;
  }

  p {
    margin-top: 10px;
  }
}
</style>

<style lang="scss">
.modal-enter-active,
.modal-leave-active {
  transition: all 1s;
}

.modal-enter,
.modal-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
</style>
