/**
 * <p>A vanilla JavaScript library that publishes custom <code>swipe</code> events with telemetry from screen touch movement.</p>
 * <ul>
 *     <li>Swipe events are fired for every <code>touchstart</code>, <code>touchmove</code>, <code>touchend</code>, and <code>touchcancel</code> event.</li>
 *     <li>A single tap will fire at least two events (for <code>touchstart</code> and <code>touchend</code>).</li>
 *     <li>All distances and speeds report 0 on <code>touchstart</code>.</li>
 *     <li>Latest distances and speeds report 0 on <code>touchend</code> because it has the same coordinates as the prior event.</li>
 *     <li>Event publish rate is <code>touchmove</code> publish rate, which is up to as fast as screen refresh rate.</li>
 *     <li>All values are positive; use the cardinal directions to determine direction.</li>
 * </ul>
 * @namespace
 * @type      {!Object}
 * @version   1.1
 * @author    Eric Eldard
 * @license   {@link https://github.com/eric-eldard/swipe-events.js/blob/main/LICENSE|MIT}
 * @see       {@link https://github.com/eric-eldard/swipe-events.js|swipe-events.js @ GitHub}
 * @see       {@link https://eric-eldard.github.io/swipe-events.js|Demo}
 * @example
 * document.addEventListener("swipe", e => {
 *     console.debug(`
 *         event time: ${e.detail.eventTime}
 *         ongoing:    ${e.detail.ongoing}
 *         direction:  ${e.detail.cardinal4}
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
        firstEvent = Date.now();

        lastX      = originX;
        lastY      = originY;
        lastEvent  = firstEvent;

        fireSwipeEvent(originX, originY, firstEvent, e);
    });

    document.addEventListener("touchmove", e => {
        const touchX    = e.changedTouches[0].clientX;
        const touchY    = e.changedTouches[0].clientY;
        const eventTime = Date.now();

        fireSwipeEvent(touchX, touchY, eventTime, e);

        lastX     = touchX;
        lastY     = touchY;
        lastEvent = eventTime;
    });

    document.addEventListener("touchend", e => {
        // Using lastX and lastY instead of changedTouches from this event because these are ALMOST always the same.
        // However, what might be a browser rounding error sometimes causes an infinitesimally small change in X or Y
        // on a single tap, resulting in a one-tap swipe event registering a distance and a speed.
        fireSwipeEvent(lastX, lastY, Date.now(), e);
    });

    document.addEventListener("touchcancel", e => {
        fireSwipeEvent(lastX, lastY, Date.now(), e);
    });

    function fireSwipeEvent(currentX, currentY, eventTime, e) {
        const initial = e.type === "touchstart";
        const ongoing = initial || e.type === "touchmove";

        const totalChangeInX = currentX - originX;
        const totalChangeInY = currentY - originY;

        const totalDistanceX = Math.abs(totalChangeInX);
        const totalDistanceY = Math.abs(totalChangeInY);
        const totalDistance  =  Math.hypot(totalDistanceX, totalDistanceY);

        const latestDistanceX = Math.abs(currentX - lastX);
        const latestDistanceY = Math.abs(currentY - lastY);
        const latestDistance  = Math.hypot(latestDistanceX, latestDistanceY);

        const duration = eventTime - firstEvent;

        const overallSpeedX = (totalDistanceX / duration) || 0;
        const overallSpeedY = (totalDistanceY / duration) || 0;
        const overallSpeed  = (totalDistance  / duration) || 0;

        const millisSinceLastEvent = eventTime - lastEvent;

        const latestSpeedX = (latestDistanceX / millisSinceLastEvent) || 0;
        const latestSpeedY = (latestDistanceY / millisSinceLastEvent) || 0;
        const latestSpeed  = (latestDistance  / millisSinceLastEvent) || 0;

        const horizontalDir = originX > currentX ? "W" : "E";
        const verticalDir   = originY > currentY ? "N" : "S";
        const tangent       = Math.atan2(totalDistanceY, totalDistanceX) * (180 / Math.PI);

        const cardinal4 = (totalDistanceX > totalDistanceY) ? horizontalDir : verticalDir;
        const cardinal8 = (tangent > 22.5 && tangent < 67.5) ? verticalDir + horizontalDir : cardinal4;

        const radians = Math.atan2(totalChangeInY, totalChangeInX);
        const theta   = (radians < 0 ? (radians + 2 * Math.PI) : radians) * (180 / Math.PI);

        document.dispatchEvent(
            new CustomEvent("swipe", {
                    /**
                     * @name Event detail structure
                     * @property {TouchEvent}  event           the <code>TouchEvent</code> that triggered this <code>swipe</code> event (only its type is logged to console)
                     * @property {number}      eventTime       timestamp for the creation of this event, as milliseconds since Unix epoch
                     * @property {number}      duration        total time since <code>touchstart</code> event in milliseconds
                     * @property {boolean}     initial         true if the triggering touch event is <code>touchstart</code>
                     * @property {boolean}     ongoing         false if the triggering touch event is terminal (<code>touchend</code>, <code>touchcancel</code>)
                     * @property {string}      cardinal4       current direction from the origin: N &vert; S &vert; E &vert; W
                     * @property {string}      cardinal8       current direction from the origin: N &vert; S &vert; E &vert; W &vert; NE &vert; NW &vert; SE &vert; SW
                     * @property {number}      theta           the number of degrees from East, going clockwise (0=E, 90=S, 180=W, 270=N)
                     * @property {number}      originX         X coordinate of the initial touch (from <code>touchstart</code>)
                     * @property {number}      originY         Y coordinate of the initial touch (from <code>touchstart</code>)
                     * @property {number}      currentX        X coordinate of the latest touch event
                     * @property {number}      currentY        Y coordinate of the latest touch event
                     * @property {number}      totalDistanceX  total horizontal distance travelled in pixels from <code>originX</code>
                     * @property {number}      totalDistanceY  total vertical distance travelled in pixels from <code>originY</code>
                     * @property {number}      totalDistance   total real distance travelled in pixels from <code>touchstart</code> origin
                     * @property {number}      latestDistanceX total horizontal linear distance travelled in pixels since last <code>swipe</code> event
                     * @property {number}      latestDistanceY total vertical linear distance travelled in pixels since last <code>swipe</code> event
                     * @property {number}      latestDistance  total linear distance travelled in pixels since last <code>swipe</code> event
                     * @property {number}      overallSpeedX   <code>totalDistanceX</code> / <code>duration</code>
                     * @property {number}      overallSpeedY   <code>totalDistanceY</code> / <code>duration</code>
                     * @property {number}      overallSpeed    <code>totalDistance</code> / <code>duration</code>
                     * @property {number}      latestSpeedX    <code>latestDistanceX</code> / milliseconds since last <code>swipe</code> event
                     * @property {number}      latestSpeedY    <code>latestDistanceY</code> / milliseconds since last <code>swipe</code> event
                     * @property {number}      latestSpeed     <code>latestDistance</code> / milliseconds since last <code>swipe</code> event
                     */
                detail: {
                    "event":           e,
                    "eventTime":       eventTime,
                    "duration":        duration,
                    "initial":         initial,
                    "ongoing":         ongoing,
                    "cardinal4":       cardinal4,
                    "cardinal8":       cardinal8,
                    "theta":           theta,
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

              %cevent:              ${e.detail.event.type}
                event time:         ${e.detail.eventTime}
                duration:           ${e.detail.duration}
                initial:            ${e.detail.initial}
                ongoing:            ${e.detail.ongoing}
              %ccardinal 4:         ${e.detail.cardinal4}
                cardinal 8:         ${e.detail.cardinal8}
                theta:              ${e.detail.theta}
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