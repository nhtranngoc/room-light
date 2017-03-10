# __room-light__

### Home automation from scratch, with ReactJS.

Note: This project is still pretty much underway, so expect non-functional, not-even-fully-tested code.

Note 2: This feels like a blog post.

## Background
So, *room-light* used to be a real shitty web controller that uses Socket.io and Johnny Five to drive a WS2812 (aka NeoPixels) strip from an Arduino connected to a Raspberry Pi. This was honestly a quick hack put together by yours truly, since my room light went out and my landlord usually takes forever to come by and fix it. I also figured that wiring up something quick from available parts would be faster than borrowing a ladder and walking to Price Chopper to buy a new light bulb.

And thus, *room-light* <sup>TM</sup> was born. It was ugly. It was messy. But it works.

Over the course of my senior year, I realized a few things:
 1. My front end skills suck.
 2. The setup was too complicated and clunky.
 3. Johnny-five is not suitable for LED animation, at least on a Raspberry Pi (with a record top speed of 12fps on a 150 pixel strip).
 4. Girls don't like seeing a bunch of wires and exposed circuit boards taped up on a wall. 
 5. I could do more than just control my light strip.

So in order to address problem 1,2,3 and 5, I decided to refactor, rework, revamp and basically re-everything. 

## Hardware
Prior to this, I just got my hands on a couple of ESP8266 modules. These little guys come with a full TCP/IP stack, great documentation, and pack a punch, all for a low, low price of $2.40. 

I also discovered the existence of MQTT, a TCP/IP protocol that allows for fast, light weight packet delivery. Putting everything together, with FastLED for driving LEDs and Mosquitto running on Raspberry Pi, we have an MQTT-enabled LED strip that can handle 60fps animation. 

Check out the `/esp8266` folder for more details!

## Web App
Honestly, I was just looking for an excuse to learn ReactJS, and what's a better way to learn something than doing it yourself?

Everything is neatly stored in the `/app` folder

___to be continued...___

## Extensions
But why going all the way just to control some measly LEDs? Well, I'm setting out to build a sous vide cooker out of my roommate's broken rice cooker, so this is a perfect opportunity to integrate that into the web app. I also want to automate my window shades, so there's that too. Maybe a security system. 

All of this will be covered at a later, unknown date.

## Testimonials

> "Nam stop fooling around and do your work"
>
> *Ivan Melnikov*

> "Call me sometime, okay? Love you"
>
> *Mom*

> "Give me back my stuff"
> 
> *Ex-girlfriend*