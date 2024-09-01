/**
 * <p>A vanilla JavaScript library that publishes custom <code>swipe</code> events with telemetry from screen touch movement.</p>
 * <ul>
 *     <li>Swipe events are fired for every <code>touchmove</code>, <code>touchend</code>, and <code>touchcancel</code> event.</li>
 *     <li>No swipe event is fired on <code>touchstart</code>, which does not have a direction and so is not a swipe.</li>
 *     <li>Event publish rate is <code>touchmove</code> publish rate, which is up to as fast as screen refresh rate.</li>
 *     <li>All values are positive; use the cardinal directions to determine direction.</li>
 * </ul>
 * @namespace
 * @type      {!Object}
 * @version   1.0
 * @author    Eric Eldard
 * @license   {@link https://github.com/eric-eldard/swipe-events.js/blob/main/LICENSE|MIT}
 * @see       {@link https://github.com/eric-eldard/swipe-events.js|swipe-events.js @ GitHub}
 * @example
 * document.addEventListener("swipe", e => {
 *     console.debug(`
 *         event time: ${e.detail.eventTime}
 *         ongoing:    ${e.detail.ongoing}
 *         direction:  ${e.detail.cardinal4dir}
 *     `}
 * }
 */
var SwipeEvents = SwipeEvents || (() => {

    let logEvents = false;
    let touchStartX;
    let touchStartY;
    let lastTouchX;
    let lastTouchY;
    let firstEventTime;
    let lastEventTime;

    document.addEventListener("touchstart", e => {
        touchStartX    = e.changedTouches[0].screenX;
        touchStartY    = e.changedTouches[0].screenY;
        lastTouchX     = touchStartX;
        lastTouchY     = touchStartY;
        firstEventTime = Date.now();
        lastEventTime  = firstEventTime;
    });

    document.addEventListener("touchmove", e => {
        const touchCurrentX = e.changedTouches[0].screenX;
        const touchCurrentY = e.changedTouches[0].screenY;
        const eventTime     = Date.now();

        fireSwipeEvent(touchStartX, touchStartY, touchCurrentX, touchCurrentY, eventTime, true);

        lastTouchX    = touchCurrentX;
        lastTouchY    = touchCurrentY;
        lastEventTime = eventTime;
    });

    document.addEventListener("touchend", e => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        fireSwipeEvent(touchStartX, touchStartY, touchEndX, touchEndY, Date.now(), false);
    });

    document.addEventListener("touchcancel", e => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        fireSwipeEvent(touchStartX, touchStartY, touchEndX, touchEndY, Date.now(), false);
    });

    function fireSwipeEvent(startX, startY, endX, endY, eventTime, ongoing) {
        const totalDistanceX = Math.abs(endX - startX);
        const totalDistanceY = Math.abs(endY - startY);
        const totalDistance  =  Math.hypot(totalDistanceX, totalDistanceY);

        const latestDistanceX = Math.abs(endX - lastTouchX);
        const latestDistanceY = Math.abs(endY - lastTouchY);
        const latestDistance  = Math.hypot(latestDistanceX, latestDistanceY);

        const duration = eventTime - firstEventTime;

        const totalSpeedX = totalDistanceX / duration;
        const totalSpeedY = totalDistanceY / duration;
        const totalSpeed  = totalDistance  / duration;

        const millisSinceLastEvent = eventTime - lastEventTime;

        const latestSpeedX = latestDistanceX / millisSinceLastEvent;
        const latestSpeedY = latestDistanceY / millisSinceLastEvent;
        const latestSpeed  = latestDistance  / millisSinceLastEvent;

        const horizontalDir = startX > endX ? "W" : "E";
        const verticalDir   = startY > endY ? "N" : "S";
        const theta         = Math.atan2(totalDistanceY, totalDistanceX) * (180 / Math.PI);

        const cardinal4dir = (totalDistanceX > totalDistanceY) ? horizontalDir : verticalDir;
        const cardinal8dir = (theta > 22.5 && theta < 67.5) ? verticalDir + horizontalDir : cardinal4dir;

        document.dispatchEvent(
            new CustomEvent("swipe", {
                    /**
                     * @name Event detail structure
                     * @property {number}  eventTime       timestamp for the creation of this event, as milliseconds since Unix epoch
                     * @property {number}  duration        total time since <code>touchstart</code> event in milliseconds
                     * @property {boolean} ongoing         false if the triggering touch event is terminal (<code>touchend</code>, <code>touchcancel</code>)
                     * @property {string}  cardinal4dir    current direction from the origin: N &vert; S &vert; E &vert; W
                     * @property {string}  cardinal8dir    current direction from the origin: N &vert; S &vert; E &vert; W &vert; NE &vert; NW &vert; SE &vert; SW
                     * @property {number}  touchStartX     X coordinate of the initial touch (from <code>touchstart</code>)
                     * @property {number}  touchStartY     Y coordinate of the initial touch (from <code>touchstart</code>)
                     * @property {number}  touchEndX       X coordinate of the latest touch event (from <code>touchmove</code> or <code>touchend</code>)
                     * @property {number}  touchEndY       Y coordinate of the latest touch event (from <code>touchmove</code> or <code>touchend</code>)
                     * @property {number}  totalDistanceX  total horizontal distance travelled in pixels from <code>touchStartX</code>
                     * @property {number}  totalDistanceY  total vertical distance travelled in pixels from <code>TouchStartY</code>
                     * @property {number}  totalDistance   total real distance travelled in pixels from <code>touchstart</code> origin
                     * @property {number}  latestDistanceX total horizontal linear distance travelled in pixels since last <code>swipe</code> event
                     * @property {number}  latestDistanceY total vertical linear distance travelled in pixels since last <code>swipe</code> event
                     * @property {number}  latestDistance  total linear distance travelled in pixels since last <code>swipe</code> event
                     * @property {number}  totalSpeedX     <code>totalDistanceX</code> / <code>duration</code>
                     * @property {number}  totalSpeedY     <code>totalDistanceY</code> / <code>duration</code>
                     * @property {number}  totalSpeed      <code>totalDistance</code> / <code>duration</code>
                     * @property {number}  latestSpeedX    <code>latestDistanceX</code> / milliseconds since last <code>swipe</code> event
                     * @property {number}  latestSpeedY    <code>latestDistanceY</code> / milliseconds since last <code>swipe</code> event
                     * @property {number}  latestSpeed     <code>latestDistance</code> / milliseconds since last <code>swipe</code> event
                     */
                detail: {
                    "eventTime":       eventTime,
                    "duration":        duration,
                    "ongoing":         ongoing,
                    "cardinal4dir":    cardinal4dir,
                    "cardinal8dir":    cardinal8dir,
                    "touchStartX":     startX,
                    "touchStartY":     startY,
                    "touchEndX":       endX,
                    "touchEndY":       endY,
                    "totalDistanceX":  totalDistanceX,
                    "totalDistanceY":  totalDistanceY,
                    "totalDistance":   totalDistance,
                    "latestDistanceX": latestDistanceX,
                    "latestDistanceY": latestDistanceY,
                    "latestDistance":  latestDistance,
                    "totalSpeedX":     totalSpeedX,
                    "totalSpeedY":     totalSpeedY,
                    "totalSpeed":      totalSpeed,
                    "latestSpeedX":    latestSpeedX,
                    "latestSpeedY":    latestSpeedY,
                    "latestSpeed":     latestSpeed
                }
            })
        );
    }

    document.addEventListener("swipe", e => {
        if (logEvents) {
            console.debug(`
                -- swipe event --

              %cevent time:         ${e.detail.eventTime}
                duration:           ${e.detail.duration}
                ongoing:            ${e.detail.ongoing}
              %ccardinal 4 dir:     ${e.detail.cardinal4dir}
                cardinal 8 dir:     ${e.detail.cardinal8dir}
              %ctouch start X:      ${e.detail.touchStartX}
                touch start Y:      ${e.detail.touchStartY}
              %ctouch end X:        ${e.detail.touchEndX}
                touch end Y:        ${e.detail.touchEndY}
              %ctotal distance X:   ${e.detail.totalDistanceX}
                total distance Y:   ${e.detail.totalDistanceY}
                total distance:     ${e.detail.totalDistance}
              %clatest distance X:  ${e.detail.latestDistanceX}
                latest distance Y:  ${e.detail.latestDistanceY}
                latest distance:    ${e.detail.latestDistance}
              %ctotal speed X:      ${e.detail.totalSpeedX}
                total speed Y:      ${e.detail.totalSpeedY}
                total speed:        ${e.detail.totalSpeed}
              %clatest speed X:     ${e.detail.latestSpeedX}
                latest speed Y:     ${e.detail.latestSpeedY}
                latest speed:       ${e.detail.latestSpeed}

            `.replace(/\n[ ]+/g, "\n"),
                "color: dimgray",
                "color: brown",
                "color: green",
                "color: red",
                "color: blue",
                "color: orange",
                "color: purple",
                "color: darkcyan"
            )
        }
    });

    return {
        /**
         * Determine whether event logging is currently enabled. Useful for chaining your own logging to this value.
         * @since 1.0
         * @memberof SwipeEvents
         * @returns {boolean} <code>true</code> if logging is enabled, <code>false</code> if it's disabled
         * @example
         * document.addEventListener("swipe", e => {
         *     if (SwipeEvents.telemetryLoggingEnabled()) {
         *         console.log("I will log also");
         *     }
         * }
         */
        telemetryLoggingEnabled: function() {
            return logEvents;
        },

        /**
         * Turn on/off console event logging (debug level). This is generally intended to be run from the console, while debugging.
         * @since 1.0
         * @memberof SwipeEvents
         * @returns {boolean} <code>true</code> if logging is enabled as a result of this operation, <code>false</code> if it's disabled
         * @example
         * SwipeEvents.toggleTelemetryLogging();
         */
        toggleTelemetryLogging: function() {
            logEvents = !logEvents;
            return logEvents;
        }
    }
})();