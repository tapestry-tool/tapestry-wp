export default {
  methods: {
    fitMediaInContainer(media, container) {
      // First, we scale the media based on height
      let scaleFactor = container.height / media.height
      const updatedDimensions = {
        width: media.width * scaleFactor,
        height: media.height * scaleFactor, // equals == container.height
      }

      // if the width is bigger than the available space, we need to scale based on the width
      if (updatedDimensions.width > container.width) {
        scaleFactor = container.width / media.width
        updatedDimensions.width = media.width * scaleFactor
        updatedDimensions.height = media.height * scaleFactor
      }
      return updatedDimensions
    },
  },
}
