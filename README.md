# swipe-events.js

A vanilla JavaScript library that publishes custom <code>swipe</code> events with telemetry from screen touch movement.
- Swipe events are fired for every <code>touchstart</code>, <code>touchmove</code>, <code>touchend</code>, and <code>touchcancel</code> event.
- A single tap will fire at least two events (for <code>touchstart</code> and <code>touchend</code>).
- All distances and speeds report 0 on <code>touchstart</code>.
- Latest distances and speeds report 0 on <code>touchend</code> because it has the same coordinates as the prior event.
- Cardinal directions and theta report null on <code>touchstart</code>, and also on <code>touchend</code> if there was no <code>touchmove</code> event.
- Event publish rate is <code>touchmove</code> publish rate, which is up to as fast as screen refresh rate.
- All values are positive; use the cardinal directions to determine direction.

**Kind**: global namespace  
**Version**: 1.1.1  
**Author**: Eric Eldard  
**License**: [MIT](https://github.com/eric-eldard/swipe-events.js/blob/main/LICENSE)  
**See:** [Demo](https://eric-eldard.github.io/swipe-events.js)   
**Example**  
```js
document.addEventListener("swipe", e => {
    console.debug(`
        event time: ${e.detail.eventTime}
        ongoing:    ${e.detail.ongoing}
        direction:  ${e.detail.cardinal4}
    `)
})
```
**Documentation**: Markdown generated by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown)

<a name="SwipeEvents"></a>

## SwipeEvents : <code>object</code>

* [SwipeEvents](#SwipeEvents) : <code>object</code>
    * [.telemetryLoggingEnabled()](#SwipeEvents.telemetryLoggingEnabled) ⇒ <code>boolean</code>
    * [.toggleTelemetryLogging()](#SwipeEvents.toggleTelemetryLogging) ⇒ <code>boolean</code>

<a name="SwipeEvents.telemetryLoggingEnabled"></a>

### SwipeEvents.telemetryLoggingEnabled() ⇒ <code>boolean</code>
Determine whether event logging is currently enabled. Useful for chaining your own logging to this value.

**Kind**: static method of [<code>SwipeEvents</code>](#SwipeEvents)  
**Returns**: <code>boolean</code> - <code>true</code> if logging is enabled, <code>false</code> if it's disabled  
**Since**: 1.0  
**Example**  
```js
document.addEventListener("swipe", e => {
    if (SwipeEvents.telemetryLoggingEnabled()) {
        console.log("I will log also");
    }
})
```
<a name="SwipeEvents.toggleTelemetryLogging"></a>

### SwipeEvents.toggleTelemetryLogging() ⇒ <code>boolean</code>
Turn on/off console event logging (debug level). This is generally intended to be run from the console, while debugging.

**Kind**: static method of [<code>SwipeEvents</code>](#SwipeEvents)  
**Returns**: <code>boolean</code> - <code>true</code> if logging is enabled as a result of this operation, <code>false</code> if it's disabled  
**Since**: 1.0  
**Example**  
```js
SwipeEvents.toggleTelemetryLogging()
```


<a name="Event detail structure"></a>

## Event detail structure
**Kind**: global variable  
**Properties**

| Name            | Type                    | Description                                                                                                   |
|-----------------|-------------------------|---------------------------------------------------------------------------------------------------------------|
| event           | <code>TouchEvent</code> | the <code>TouchEvent</code> that triggered this <code>swipe</code> event (only its type is logged to console) |
| eventTime       | <code>number</code>     | timestamp for the creation of this event, as milliseconds since Unix epoch                                    |
| duration        | <code>number</code>     | total time since <code>touchstart</code> event in milliseconds                                                |
| initial         | <code>boolean</code>    | true if the triggering touch event is <code>touchstart</code>                                                 |
| ongoing         | <code>boolean</code>    | false if the triggering touch event is terminal (<code>touchend</code>, <code>touchcancel</code>)             |
| cardinal4       | <code>string</code>     | current direction from the origin: N &vert; S &vert; E &vert; W                                               |
| cardinal8       | <code>string</code>     | current direction from the origin: N &vert; S &vert; E &vert; W &vert; NE &vert; NW &vert; SE &vert; SW       |
| theta           | <code>number</code>     | the number of degrees from East, going clockwise (0=E, 90=S, 180=W, 270=N)                                    |
| originX         | <code>number</code>     | X coordinate of the initial touch (from <code>touchstart</code>)                                              |
| originY         | <code>number</code>     | Y coordinate of the initial touch (from <code>touchstart</code>)                                              |
| currentX        | <code>number</code>     | X coordinate of the latest touch event (from <code>touchmove</code> or <code>touchend</code>)                 |
| currentY        | <code>number</code>     | Y coordinate of the latest touch event (from <code>touchmove</code> or <code>touchend</code>)                 |
| totalDistanceX  | <code>number</code>     | total horizontal distance travelled in pixels from <code>originX</code>                                       |
| totalDistanceY  | <code>number</code>     | total vertical distance travelled in pixels from <code>originY</code>                                         |
| totalDistance   | <code>number</code>     | total real distance travelled in pixels from <code>touchstart</code> origin                                   |
| latestDistanceX | <code>number</code>     | total horizontal linear distance travelled in pixels since last <code>swipe</code> event                      |
| latestDistanceY | <code>number</code>     | total vertical linear distance travelled in pixels since last <code>swipe</code> event                        |
| latestDistance  | <code>number</code>     | total linear distance travelled in pixels since last <code>swipe</code> event                                 |
| overallSpeedX   | <code>number</code>     | <code>totalDistanceX</code> / <code>duration</code>                                                           |
| overallSpeedY   | <code>number</code>     | <code>totalDistanceY</code> / <code>duration</code>                                                           |
| overallSpeed    | <code>number</code>     | <code>totalDistance</code> / <code>duration</code>                                                            |
| latestSpeedX    | <code>number</code>     | <code>latestDistanceX</code> / milliseconds since last <code>swipe</code> event                               |
| latestSpeedY    | <code>number</code>     | <code>latestDistanceY</code> / milliseconds since last <code>swipe</code> event                               |
| latestSpeed     | <code>number</code>     | <code>latestDistance</code> / milliseconds since last <code>swipe</code> event                                |