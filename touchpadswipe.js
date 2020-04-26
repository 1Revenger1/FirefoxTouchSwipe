let rollingXAvg = [];
let rollingYAvg = [];
let totalX, avgX, distanceX;
let totalY, avgY, distanceY;
let lastTime = 0;
let doOnce = false;
let debounce = false;

function reset () {
    totalX = avgX = distanceX = 0;
    totalY = avgY = distanceY = 0;
    lastTime = 0;
    rollingXAvg = [];
    rollingYAvg = [];
    document.getElementById("leftSlider").style.left = `-20mm`;
    document.getElementById("leftSlider").classList.remove("anim");
    document.getElementById("rightSlider").style.right = `-20mm`;
    document.getElementById("rightSlider").classList.remove("anim");
    doOnce = false;
    debounce = true;
    setTimeout(() => debounce = false, 500);
}

const MILLISECOND = 1000;
const avgResetTime = 0.3 * MILLISECOND;
const MAX_AVG_SIZE = 2;

const arrow = "<svg id=\"touchpadSwipeIcon\" viewBox=\"0 0 100 100\" version=\"1.1\" width=\"20mm\" height=\"20mm\">\n"
+ "<filter id=\"dropshadow\" width=\"140%\" height=\"140%\">\n"
    + "<feGaussianBlur in=\"SoureceAlpha\" stdDeviation=\"2\"/>\n"
    + "<feComponentTransfer>\n"
        + "<feFuncA type=\"linear\" slope=\"0.8\"/>\n"
    + "</feComponentTransfer>\n"
+ "</filter>\n"
+ "<circle style=\"filter:url(#dropshadow)\" class=\"sliderStroke\" cx=\"50%\" cy=\"50%\" r=\"45%\" stroke-width=\"2\"/>\n"
+ "<circle cx=\"50%\" cy=\"50%\" r=\"43%\" class=\"sliderStroke\" stroke-width=\"3\" fill=\"rgb(41,44,41)\"/>\n"
+ "<rect width=\"50%\" class=\"arrowFill\" height=\"20%\" x=\"20%\" y=\"40%\" rx=\"2\" ry=\"2\"/>\n"
+ "<polygon points=\"60,75 60,25 80,50\" class=\"arrowFill\"/>\n"
+ "</svg>";


let dumb = document.createElement('div');
dumb.id = "leftSlider";
dumb.className = "sliderLeft";
dumb.setAttribute("width", "20mm");
dumb.innerHTML = arrow;

let dumb2 = document.createElement('div');
dumb2.id = "rightSlider";
dumb2.className = "sliderRight";
dumb2.setAttribute("width", "20mm");
dumb2.innerHTML = arrow;

document.body.append(dumb);
document.body.append(dumb2);

let timeout = null;
reset();

document.ontouchend = (event => {
    console.log("Touch released");
});

document.onwheel = (event => {
    // if (lastTime + avgResetTime < event.timeStamp ) reset();

    if (debounce) return;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => reset(), avgResetTime);

    event.deltaX = Math.max(Math.abs(event.deltaX), 25) * Math.sign(event.deltaX);

    // Average x/y over 2 or 3 packets as 
    // at least on my device, deltaX and deltaY
    // come in alternate packets (with the other value being 0)
    rollingXAvg.push(event.deltaX);
    rollingYAvg.push(event.deltaY);

    totalX += event.deltaX;
    totalY += event.deltaY;

    if (rollingXAvg.length > MAX_AVG_SIZE)
        totalX -= rollingXAvg.shift();
    if (rollingYAvg.length > MAX_AVG_SIZE)
        totalX -= rollingYAvg.shift();

    avgX = totalX / rollingXAvg.length;
    avgY = totalY / rollingYAvg.length;

    // add avg to distance travelled
    distanceX += avgX;
    distanceY += avgY;
    // distanceX += event.deltaX;
    // distanceY += event.deltaY;

    if (Math.abs(distanceY)) //Math.abs(distanceX))
        distanceX = avgX = 0;  

    let filteredLeftX, filteredRightX;

    if (Math.abs(distanceX) < 1.00) {
        filteredLeftX = filteredRightX = -20;
    } else {
        filteredLeftX = Math.max(Math.min((-distanceX - 1)*3, 35), 0) - 20;
        filteredRightX = Math.max(Math.min((distanceX - 1)*3 - 1, 35), 0) - 20;
    }

    console.log(`${filteredLeftX}, ${filteredRightX}`);

    let leftSlider = document.getElementById("leftSlider");
    leftSlider.style.left = `${filteredLeftX}mm`;
    let rightSlider = document.getElementById("rightSlider");
    rightSlider.style.right = `${filteredRightX}mm`

    if (filteredLeftX == 15 && !doOnce) {
        setTimeout(() => reset(), 1000);
        history.back();
        leftSlider.classList.add("anim");
        doOnce = true;
        debounce = true;
    }

    if (filteredRightX == 15 && !doOnce) {
        setTimeout(() => reset(), 1000);
        history.forward();
        rightSlider.classList.add("anim");
        doOnce = true;
        debounce = true;
    }
    // console.log(`${distanceX.toFixed(2)}, ${distanceY.toFixed(2)}`);

    // console.log(event);
    lastTime = event.timeStamp;
});