/**
 * <p>A vanilla JavaScript library that publishes custom <code>swipe</code> events with telemetry from screen touch movement.</p>
 * <ul>
 *     <li>Swipe events are fired for every <code>touchmove</code>, <code>touchend</code>, and <code>touchcancel</code> event.</li>
 *     <li>A single tap will fire a swipe event. Though no swipe event is fired for <code>touchstart</code>, one will still be fired for <code>touchend</code>.</li>
 *     <li>Event publish rate is <code>touchmove</code> publish rate, which is up to as fast as screen refresh rate.</li>
 *     <li>All values are positive; use the cardinal directions to determine direction.</li>
 * </ul>
 * @namespace
 * @type      {!Object}
 * @version   1.0
 * @author    Eric Eldard
 * @license   {@link https://github.com/eric-eldard/swipe-events.js/blob/main/LICENSE|MIT}
 * @see       {@link https://github.com/eric-eldard/swipe-events.js|swipe-events.js @ GitHub}
 * @see       {@link https://eric-eldard.github.io/swipe-events.js|Demo}
 * @example
 * document.addEventListener("swipe", e => {
 *     console.debug(`
 *         event time: ${e.detail.eventTime}
 *         ongoing:    ${e.detail.ongoing}
 *         direction:  ${e.detail.cardinal4dir}
 *     `)
 * })
 */
var SwipeEvents = SwipeEvents || (() => {

    let logEvents = false;
    let originX;
    let originY;
    let lastX;
    let lastY;
    let firstEvent;
    let lastEvent;

    window.addEventListener("DOMContentLoaded", e => {
        console.log(`
            %cswipe-events.js%c v1.0 loaded
                toggle logging to debug: %cSwipeEvents.toggleTelemetryLogging()%c
                more info: https://github.com/eric-eldard/swipe-events.js
        `.replace(/\n[ ]{12}/g, "\n"),
            "color: green", "color: unset", "color: blue", "color: unset"
        );
    });

    document.addEventListener("touchstart", e => {
        originX    = e.changedTouches[0].clientX;
        originY    = e.changedTouches[0].clientY;
        lastX      = originX;
        lastY      = originY;
        firstEvent = Date.now();
        lastEvent  = firstEvent;
    });

    document.addEventListener("touchmove", e => {
        const touchX    = e.changedTouches[0].clientX;
        const touchY    = e.changedTouches[0].clientY;
        const eventTime = Date.now();

        fireSwipeEvent(touchX, touchY, eventTime, true);

        lastX     = touchX;
        lastY     = touchY;
        lastEvent = eventTime;
    });

    document.addEventListener("touchend", e => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        fireSwipeEvent(touchEndX, touchEndY, Date.now(), false);
    });

    document.addEventListener("touchcancel", e => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        fireSwipeEvent(touchEndX, touchEndY, Date.now(), false);
    });

    function fireSwipeEvent(currentX, currentY, eventTime, ongoing) {
        const totalDistanceX = Math.abs(currentX - originX);
        const totalDistanceY = Math.abs(currentY - originY);
        const totalDistance  =  Math.hypot(totalDistanceX, totalDistanceY);

        const latestDistanceX = Math.abs(currentX - lastX);
        const latestDistanceY = Math.abs(currentY - lastY);
        const latestDistance  = Math.hypot(latestDistanceX, latestDistanceY);

        const duration = eventTime - firstEvent;

        const overallSpeedX = totalDistanceX / duration;
        const overallSpeedY = totalDistanceY / duration;
        const overallSpeed  = totalDistance  / duration;

        const millisSinceLastEvent = eventTime - lastEvent;

        const latestSpeedX = latestDistanceX / millisSinceLastEvent;
        const latestSpeedY = latestDistanceY / millisSinceLastEvent;
        const latestSpeed  = latestDistance  / millisSinceLastEvent;

        const horizontalDir = originX > currentX ? "W" : "E";
        const verticalDir   = originY > currentY ? "N" : "S";
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
                     * @property {number}  originX         X coordinate of the initial touch (from <code>touchstart</code>)
                     * @property {number}  originY         Y coordinate of the initial touch (from <code>touchstart</code>)
                     * @property {number}  currentX        X coordinate of the latest touch event (from <code>touchmove</code> or <code>touchend</code>)
                     * @property {number}  currentY        Y coordinate of the latest touch event (from <code>touchmove</code> or <code>touchend</code>)
                     * @property {number}  totalDistanceX  total horizontal distance travelled in pixels from <code>originX</code>
                     * @property {number}  totalDistanceY  total vertical distance travelled in pixels from <code>originY</code>
                     * @property {number}  totalDistance   total real distance travelled in pixels from <code>touchstart</code> origin
                     * @property {number}  latestDistanceX total horizontal linear distance travelled in pixels since last <code>swipe</code> event
                     * @property {number}  latestDistanceY total vertical linear distance travelled in pixels since last <code>swipe</code> event
                     * @property {number}  latestDistance  total linear distance travelled in pixels since last <code>swipe</code> event
                     * @property {number}  overallSpeedX   <code>totalDistanceX</code> / <code>duration</code>
                     * @property {number}  overallSpeedY   <code>totalDistanceY</code> / <code>duration</code>
                     * @property {number}  overallSpeed    <code>totalDistance</code> / <code>duration</code>
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
                    "originX":         originX,
                    "originY":         originY,
                    "currentX":        currentX,
                    "currentY":        currentY,
                    "totalDistanceX":  totalDistanceX,
                    "totalDistanceY":  totalDistanceY,
                    "totalDistance":   totalDistance,
                    "latestDistanceX": latestDistanceX,
                    "latestDistanceY": latestDistanceY,
                    "latestDistance":  latestDistance,
                    "overallSpeedX":   overallSpeedX,
                    "overallSpeedY":   overallSpeedY,
                    "overallSpeed":    overallSpeed,
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
              %corigin X:           ${e.detail.originX}
                origin Y:           ${e.detail.originY}
              %ccurrent X:          ${e.detail.currentX}
                current Y:          ${e.detail.currentY}
              %ctotal distance X:   ${e.detail.totalDistanceX}
                total distance Y:   ${e.detail.totalDistanceY}
                total distance:     ${e.detail.totalDistance}
              %clatest distance X:  ${e.detail.latestDistanceX}
                latest distance Y:  ${e.detail.latestDistanceY}
                latest distance:    ${e.detail.latestDistance}
              %coverall speed X:    ${e.detail.overallSpeedX}
                overall speed Y:    ${e.detail.overallSpeedY}
                overall speed:      ${e.detail.overallSpeed}
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
         * })
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
         * SwipeEvents.toggleTelemetryLogging()
         */
        toggleTelemetryLogging: function() {
            logEvents = !logEvents;
            return logEvents;
        }
    }
})();