export default {
  models: 'hands',
  enabled: true,
  tags: ['core'],

  // Index of fingertips
  fingertipIndex: [8, 12, 16, 20],

  // Number of frames the current element is the same as the last
  // [left, right]
  // [index, middle, ring, pinky]
  numFramesFocused: [[0, 0, 0, 0,], [0, 0, 0, 0]],

  // Whether the fingers are touching
  thresholdMet: [[0, 0, 0, 0,], [0, 0, 0, 0]],
  framesSinceLastGrab: [[0, 0, 0, 0,], [0, 0, 0, 0]],

  // The original grab point for each finger
  origPinch: [
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}],
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}]
  ],
  curPinch: [
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}],
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}]
  ],

  // Just downel
  pinchDowned: [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  pinchDown: [
    [false, false, false, false],
    [false, false, false, false]
  ],
  pinchUp: [
    [false, false, false, false],
    [false, false, false, false]
  ],

  // The tweened scrollTop, used to smoothen out scroll
  // [[leftHand], [rightHand]]
  tween: [
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}],
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}]
  ],

  // Number of frames mouse has been downed
  mouseDowned: 0,
  // Is the mouse up?
  mouseUp: false,
  // Whether one of the morph confidences have been met
  mouseThresholdMet: false,

  config: {
    // Number of frames over the same element before activating that element
    framesToFocus: 10,

    // Number of pixels the middle and thumb tips must be near each other to drag
    threshold: 50,

    // Number of frames where a hold is not registered before releasing a drag
    numThresholdErrorFrames: 5,

    maxMouseDownedFrames: 1
  },

  onUse () {
    this.$target = window
  },

  /**
   * Scroll the page when the cursor goes above/below the threshold
   */
  onFrame ({hands}) {
    if (!hands.multiHandLandmarks) return

    const height = this.handsfree.debug.$canvas.hands.height
    const leftVisible = hands.multiHandedness.some(hand => hand.label === 'Right')
    const rightVisible = hands.multiHandedness.some(hand => hand.label === 'Left')
    
    // Detect if the threshold for clicking is met with specific morphs
    for (let n = 0; n < hands.multiHandLandmarks.length; n++) {
      // Set the hand index
      let hand = hands.multiHandedness[n].label === 'Right' ? 0 : 1
      
      for (let finger = 0; finger < 4; finger++) {
        // Check if fingers are touching
        const a = hands.multiHandLandmarks[n][4].x - hands.multiHandLandmarks[n][this.fingertipIndex[finger]].x
        const b = hands.multiHandLandmarks[n][4].y - hands.multiHandLandmarks[n][this.fingertipIndex[finger]].y
        const c = Math.sqrt(a*a + b*b) * height
        const thresholdMet = this.thresholdMet[hand][finger] = c < this.config.threshold

        if (thresholdMet) {
          // Set the current pinch
          this.curPinch[hand][finger] = hands.multiHandLandmarks[n][4]
          
          // Store the original pinch
          if (this.framesSinceLastGrab[hand][finger] > this.config.numThresholdErrorFrames) {
            this.origPinch[hand][finger] = hands.multiHandLandmarks[n][4]
            this.handsfree.TweenMax.killTweensOf(this.tween[hand][finger])
          }
          this.framesSinceLastGrab[hand][finger] = 0
        }
        ++this.framesSinceLastGrab[hand][finger]
      }
    }

    // Update the hands object
    hands.origPinch = this.origPinch
    hands.curPinch = this.curPinch
    this.handsfree.data.hands = this.getPinchStates(hands, leftVisible, rightVisible)
  },

  /**
   * Check if we are "mouse clicking"
   */
  getPinchStates (hands, leftVisible, rightVisible) {
    const visible = [leftVisible, rightVisible]

    // Make sure states are available
    hands.pinchState = [
      ['', '', '', ''],
      ['', '', '', '']
    ]
    
    // Loop through every hand and finger
    for (let hand = 0; hand < 2; hand++) {
      for (let finger = 0; finger < 4; finger++) {
        // Click
        if (visible[hand] && this.thresholdMet[hand][finger]) {
          this.pinchDowned[hand][finger]++
          document.body.classList.add(`handsfree-finger-pinched-${hand}-${finger}`, `handsfree-finger-pinched-${finger}`)
        } else {
          this.pinchUp[hand][finger] = this.pinchDowned[hand][finger]
          this.pinchDowned[hand][finger] = 0
          document.body.classList.remove(`handsfree-finger-pinched-${hand}-${finger}`, `handsfree-finger-pinched-${finger}`)
        }
        
        // Set the state
        if (this.pinchDowned[hand][finger] > 0 && this.pinchDowned[hand][finger] <= this.config.maxMouseDownedFrames) {
          hands.pinchState[hand][finger] = 'start'
        } else if (this.pinchDowned[hand][finger] > this.config.maxMouseDownedFrames) {
          hands.pinchState[hand][finger] = 'held'
        } else if (this.pinchUp[hand][finger]) {
          hands.pinchState[hand][finger] = 'released'
        } else {
          hands.pinchState[hand][finger] = ''
        }

        // Emit an event
        if (hands.pinchState[hand][finger]) {
          // Specific hand
          this.handsfree.emit(`finger-pinched-${hand}-${finger}`, {
            event: hands.pinchState[hand][finger],
            origPinch: hands.origPinch[hand][finger],
            curPinch: hands.curPinch[hand][finger]
          })
          this.handsfree.emit(`finger-pinched-${hands.pinchState[hand][finger]}-${hand}-${finger}`, {
            event: hands.pinchState[hand][finger],
            origPinch: hands.origPinch[hand][finger],
            curPinch: hands.curPinch[hand][finger]
          })
          // Any hand
          this.handsfree.emit(`finger-pinched-${finger}`, {
            event: hands.pinchState[hand][finger],
            origPinch: hands.origPinch[hand][finger],
            curPinch: hands.curPinch[hand][finger]
          })
          this.handsfree.emit(`finger-pinched-${hands.pinchState[hand][finger]}-${finger}`, {
            event: hands.pinchState[hand][finger],
            origPinch: hands.origPinch[hand][finger],
            curPinch: hands.curPinch[hand][finger]
          })
        }
      }
    }

    return hands
  }
}