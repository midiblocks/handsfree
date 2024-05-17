// Maps handsfree pincher events to 
const eventMap = {
  start: 'mousedown',
  held: 'mousemove',
  released: 'mouseup'
}

// The last pointer positions for each hand, used to determine movement over time
let lastHeld = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}]

/**
 * Move a pointer with your palm
 */
export default {
  models: 'hands',
  tags: ['browser'],
  enabled: false,

  // The pointer element
  $pointer: [],
  arePointersVisible: true,

  // Pointers position
  pointer: [
    { x: -20, y: -20, isVisible: false },
    { x: -20, y: -20, isVisible: false },
    { x: -20, y: -20, isVisible: false },
    { x: -20, y: -20, isVisible: false }
  ],

  // Used to smoothen out the pointer
  tween: [
    {x: -20, y: -20},
    {x: -20, y: -20},
    {x: -20, y: -20},
    {x: -20, y: -20},
  ],

  config: {
    offset: {
      x: 0,
      y: 0
    },

    speed: {
      x: 1,
      y: 1
    }
  },

  /**
   * Create and toggle pointers
   */
  onUse () {
    for (let i = 0; i < 4; i++) {
      const $pointer = document.createElement('div')
      $pointer.classList.add('handsfree-pointer', 'handsfree-pointer-palm', 'handsfree-hide-when-started-without-hands')
      document.body.appendChild($pointer)
      this.$pointer[i] = $pointer
    }
    
    if (this.enabled && this.arePointersVisible) {
      this.showPointers()
    } else {
      this.hidePointers()
    }
  },

  /**
   * Show pointers on enable
   */
  onEnable () {
    const arePointersVisible = this.arePointersVisible
    this.showPointers()
    this.arePointersVisible = arePointersVisible
  },

  /**
   * Hide pointers on disable
   */
  onDisable () {
    const arePointersVisible = this.arePointersVisible
    this.hidePointers()
    this.arePointersVisible = arePointersVisible
  },

  /**
   * Positions the pointer and dispatches events
   */
  onFrame ({hands}) {
    // Hide pointers
    if (!hands?.multiHandLandmarks) {
      this.$pointer.forEach($pointer => $pointer.style.display = 'none')
      return
    }

    hands.pointer = [
      { isVisible: false },
      { isVisible: false },
      { isVisible: false },
      { isVisible: false }
    ]
    
    hands.multiHandLandmarks.forEach((landmarks, n) => {
      const pointer = hands.pointer[n]

      // Use the correct hand index
      let hand
      if (n < 2) {
        hand = hands.multiHandedness[n].label === 'Right' ? 0 : 1
      } else {
        hand = hands.multiHandedness[n].label === 'Right' ? 2 : 3
      }

      // Update pointer position
      this.handsfree.TweenMax.to(this.tween[hand], 1, {
        x: window.outerWidth * this.config.speed.x
          - window.outerWidth * this.config.speed.x / 2
          + window.outerWidth / 2
          - hands.multiHandLandmarks[n][21].x * this.config.speed.x * window.outerWidth
          + this.config.offset.x,
        y: hands.multiHandLandmarks[n][21].y * window.outerHeight * this.config.speed.y
          - window.outerHeight * this.config.speed.y / 2
          + window.outerHeight / 2
          + this.config.offset.y,
        overwrite: true,
        ease: 'linear.easeNone',
        immediate: true
      })

      hands.pointer[hand] = {
        x: this.tween[hand].x,
        y: this.tween[hand].y,
        isVisible: true
      }

      // Visually update pointer element
      this.$pointer[hand].style.left = `${this.tween[hand].x}px`
      this.$pointer[hand].style.top = `${this.tween[hand].y}px`

      // Dispatch events
      let event = pointer?.pinchState?.[n]?.[0]
      if (event && pointer.isVisible) {
        // Get the event and element to send events to
        event = eventMap[event]
        const $el = document.elementFromPoint(pointer.x, pointer.y)
        
        // Dispatch the event
        if ($el) {
          $el.dispatchEvent(
            new MouseEvent(event, {
              view: window,
              button: 0,
              bubbles: true,
              cancelable: true,
              clientX: pointer.x,
              clientY: pointer.y,
              // Only used when the mouse is captured in full screen mode
              movementX: pointer.x - lastHeld[hand].x,
              movementY: pointer.y - lastHeld[hand].y
            })
          )
        }

        lastHeld[hand] = pointer
      }
    })

    // Toggle pointers
    hands.pointer.forEach((pointer, hand) => {
      if (pointer.isVisible) {
        this.$pointer[hand].style.display = 'block'
      } else {
        this.$pointer[hand].style.display = 'none'
      }
    })
  },

  /**
   * Toggle pointers
   */
  showPointers () {
    this.arePointersVisible = true
    for (let i = 0; i < 4; i++) {
      this.$pointer[i].classList.remove('handsfree-hidden')
    }
  },
  hidePointers () {
    this.arePointersVisible = false
    for (let i = 0; i < 4; i++) {
      this.$pointer[i].classList.add('handsfree-hidden')
    }
  }
}
