// Constants
const MAX_WIDTH = 56;
const MAX_HEIGHT = 20;

const LOGO = [
    "▄▄▄  ▄▄▄ ▄    ▄▄▄  ▄▄▄  ▄▄▄ ▄▄▄",
    "█  █ █▄  █▄▛ █ ♥ █ █  █ █▄   █ ",
    "█  █ █▄▄ █ ▙  ▀▀▀  █  █ █▄▄  █ ",
]

const SOFIA_1 = [
    '   /\\▄▄/\\',
    '   )    (',
    '  ═\\    /═',
    '    )  (',
    '   /    \\',
    '  /      \\',
    '  \\      /',
    '   \\▄  ▄/',
    '     ))',
    '     //',
    '    ((',
    '     \\\)'
]

const SOFIA_2 = [
    '   /\\▄▄/\\',
    '   )    (',
    '  ═\\    /═',
    '    )  (',
    '   /    \\',
    '  /      \\',
    '  \\      /',
    '   \\▄  ▄/',
    '     ((',
    '      \\\\',
    '      ))',
    '     (/'
    ]

const littleCat = [
    "/\\ /\\",
    "(o.o)", 
    " ═^═ "
]

const CHONKERS_1 = [
    '',
    "   /\\▄▄▄/\\",
    "  / O   o \\",
    "  (══ ^ ══)",
    " /        \\",
    "!     ♥    !",
    "!          !",
    "! ! !  ! ! !",
    "(▄(▄)▄▄(▄)▄)"
]

const CHONKERS_2 = [
    '',
    "   /\\▄▄▄/\\",
    "  / -   - \\",
    "  (══ ^ ══)",
    " /        \\",
    "!     ♥    !",
    "!          !",
    "! ! !  ! ! !",
    "(▄(▄)▄▄(▄)▄)"
]

const SPECIAL_1 = [
    "  /\\   /\\",
    " /  ▘▘▘▘ \\",
    " ( o W o )",
    "   ══^══",
    "   / ▲ \\",
    "  /     \\",
    "  !      !",
    "  !  \\/  !",
    "  \\! !! !\/▗▖▖▖",
    "   (▄/\\▄)    ▘"
]

const SPECIAL_2 = [
    "  /\\   /\\",
    " /  ▘▘▘▘ \\",
    " ( ═ W ═ )",
    "   ══^══",
    "   / ▲ \\",
    "  /     \\",
    "  !      !",
    "  !  \\/  !",
    "  \\! !! !\/▗▖▖▖",
    "   (▄/\\▄)    ▘"
]

// Supposed to be a moon in empty sky
const EMPTY = [
    "*",
    "       *",
    "    *",
    "            ",
    "    ▲   ▲  *",
    "   ▟▀▀▀▀▀▙",
    "  █       █",
    "  █ *   * █",
    "  █   ^   █",
    "   ▜▄▄▄▄▄▛",
    " *",
    "       *",
    "",
    "     *",
    "* ",
    "        * ",
]

const CATS = {
   'Sofia': {
        art: [SOFIA_1, SOFIA_2],
        traits: ['aloof', 'relaxed'],
    },
    'Chonkers': {
        art: [CHONKERS_1, CHONKERS_2],
        traits: ['ravenous', 'goofy']
    },
    'Special': {
        art: [SPECIAL_1, SPECIAL_2],
        traits: ['friendly', 'playful'],
    }
}

const NAME = 'nekonet';

// Globals
let state; 
let fact;
let joke;

let timer = 0;
let swap = false;

let played = false;
let fed = false;
let groomed = false;

let lastCat;
let noCat = false;
let currentCat = null;

// Server functions

function getName() {
    return NAME;
}

function onConnect()
{
    // Load previous data and store in state
    data = loadData();
    state = data.length > 0 ? JSON.parse(data) : {};

     // Pick a cat fact
    fact = getCatFact();
    joke = getCatJoke();

    const n = Date.now();
    const d =  1000; // 1 min in ms
    noCat = (n - state.date) < d;

    lastCat = state.last;

    if (!noCat) {
        //  Pick a random cat
        const catNames = Object.keys(CATS);
        const i = random(0, catNames.length);
        currentCat = catNames[i];
        
        // Init new cat state if cat has not been seen before
        if (state[currentCat] === undefined) {
            state[currentCat] = {
                seen: 0,
                hearts: 0,
                // track date of last interaction
                groomed: 0,
                played: 0,
                fed: 0
            };
        }

        state[currentCat].seen += 1;

        // Should the cat be played with, groomed, or fed?
        // const p = 24 * 60 * 60 * 1000; // 1 day in ms
        const p = 1000 * 10; // 10 sec in ms
        groomed = n - state[currentCat].groomed < p;
        fed = n - state[currentCat].fed < p;
        played = n - state[currentCat].played < p;

        // Set up last seen cat
        state.last = currentCat;
    }
}

function onUpdate() {
    // Set up date and time
    const date = new Date();
    const formattedDate = formatDate(date);
    const formattedTime = formatTime(date);

    timer++;
    if (timer > 40) {
        swap = !swap;
        timer = 0;
    }

    // redraw screen
    clearScreen()

    // draw logo
    drawBox(10, 15, 1, 40, 5);
    for (let i = 0; i < LOGO.length; i++) {
        drawText(LOGO[i], 15, 20,  i);
    }

    // Draw date and time
    const dt = formattedDate + ' ♦ ' + formattedTime;
    drawText(dt, 7, (15 +  (40 - dt.length) / 2), LOGO.length + 1);

    // Set up welcome message
    const welcome = 'Welcome to nekonet! Meow!';
    if (noCat) {
        welcome = 'There are no kitties around right now. Check back later!'
    } else if (lastCat != undefined) {
       welcome =  "Hi! You last saw " + lastCat + " on " + state.formattedDate + "!"
    }
    drawTextWrapped(welcome, 15, 16, LOGO.length + 3, 40);

    // CAT FACTS 
    drawCatFact(fact);

    if (!noCat) {
        // Draw the current cat
        const draw = swap ? CATS[currentCat]['art'][0] : CATS[currentCat]['art'][1];
        drawCat(draw);

        // Cat interactions
        const fedMessage = fed ? 'You gave ' + currentCat + ' a treat.' : '♦ [F] Give a treat';
        drawText(fedMessage, 14, 16, 8);

        const groomedMessage = groomed ? 'You groomed ' + currentCat : '♦ [G] Groom'
        drawText(groomedMessage, 14, 16, 9);

        const playMessage = played ? 'You played with ' + currentCat : '♦ [P] Play';
        drawText(playMessage, 14, 16, 10);
        
        // Cat relationship
        drawText(getStatus(), 14, 16, 12);

        // Update the last seen date and time
        state.date = date.getTime();
        state.formattedDate = formattedDate;
    } else {
        drawEmpty();
        drawText('Here is a cat joke in the meantime!', 15, 16, LOGO.length + 6)
        drawTextWrapped(joke, 15, 18,LOGO.length + 7, 35);
    }

    saveData(JSON.stringify(state));
}

function onInput(key) {
    if (currentCat == undefined || !currentCat) {
        return;
    }
    // Pressed 'F' - feed a treat
    if ((key === 70 || key === 102) && !fed) {
        fed = true;
        state[currentCat].fed = Date.now();
        state[currentCat].hearts +=1;

    }
    // Pressed 'G' - groom
    if ((key === 71 || key === 103) && !groomed)
    {
        groomed = true;
        state[currentCat].groomed = Date.now();
        state[currentCat].hearts +=1;
    }
    // Press 'P' - play
   if ((key === 80 || key === 112) && !played)
    {
        played = true;
        state[currentCat].played = Date.now();
        state[currentCat].hearts +=1;
    }
}

// Util functions
function random(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function formatDate(date) {
    return (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
}

function formatTime(date) {
   return date.getHours() + ':' + date.getMinutes();
}

// nekonet specific functions
function getStatus() {
    const s = state[currentCat].seen;
    const h = state[currentCat].hearts;
    if (h > 15) {
        return currentCat + ' is keen on you!';
    } else if (h > 5) {
        return currentCat + ' is warming up to you!';
    } else if (h > 1) {
        return currentCat + ' is curious about you.';
    }
    return currentCat + ' is indifferent.'
}


function drawEmpty() {
    for (let i = 0; i < EMPTY.length; i++) {
        drawText(EMPTY[i], 15, 1, i + 1);
    }
}

// Cat occupies: 0, 0, 15, MAX_HEIGHT
function drawCat(cat) {
    for (let i = 0; i < cat.length; i++) {
        drawText(cat[i], 15, 1, i + 1);
    }
    drawText(currentCat.toUpperCase(), 15, (15 - currentCat.length) / 2, cat.length + 2)
    drawText(CATS[currentCat].traits[0], 7, (15 - CATS[currentCat].traits[0].length) / 2, cat.length + 3)
    drawText(CATS[currentCat].traits[1], 7, (15 - CATS[currentCat].traits[1].length) / 2, cat.length + 4)

    if (state[currentCat].hearts > 5) {
        const h = Math.floor(state[currentCat].hearts / 5);
        for (let i = 0; i < h; i++) {
            drawText('♥', 10, 3 + i, cat.length + 6)
        }
    }
}

function drawCatFact(fact) {
    for (let i = 0; i < littleCat.length; i++) {
        drawText(littleCat[i], 10, 16, 16 + i)
    }
    drawBox(7, 15, 15, 40, 5)
    drawText('CAT FACT OF THE MOMENT', 10, 25, 15);
    drawTextWrapped(fact, 10, 23, 16, 30);
}

function getCatFact() {
    return CAT_FACTS[random(0, CAT_FACTS.length)];
}

function getCatJoke() {
    return CAT_JOKES[random(0, CAT_JOKES.length)];
}

const CAT_FACTS = [
    "Cats make about 100 different sounds. Dogs make only about 10.",
    "Domestic cats spend about 70% of the day sleeping and 15% of the day grooming.",
    "Cat's can't taste sweetness due to genetic mutation that affects key taste receptors.",
    "Europe introduced cats into the Americas as a form of pest control in the 1750.",
    "Cats only meow as a way to communicate with humans.",
    "There are 473 taste buds on a cat's tongue.",
    "Research suggests that a cat's purr has the power to self-heal",
    "While us humans have 206 bones, cats on average have 244.",
    "Each cat's nose is unique, much like a human's fingerprint.",
    "A cat's rear end in your face is a gesture of friendship.",
    "Cats are supposed to have 18 toes (5 toes on each front paw; 4 toes on each back paw).",
    "Cats can jump up to six times their length.",
    "Cats' claws all curve downward, so they can't climb down trees head-first.",
    "Cats have 230 bones, while humans only have 206.",
    "Cats have an extra organ that allows them to taste scents on the air.",
    "Cats have whiskers on the backs of their front legs, as well.",
    "Cats have the largest eyes relative to their head size of any mammal.",
    "Cats' rough tongues can lick a bone clean of any shred of meat.",
    "Cats use their long tails to balance themselves when they're jumping or walking along narrow ledges.",
    "A cat's whiskers are generally about the same width as its body.",
    "Male cats are more likely to be left-pawed. female cats are more likely to be right-pawed.",
    "Cats are crepuscular, which means that they're most active at dawn and dusk.",
    "Cats can spend up to a third of their waking hours grooming.",
    "Despite popular belief, many cats are actually lactose intolerant.",
    "Grapes, raisins, onions, garlic, and chives, are extremely harmful for cats.",
    "It's believed that catnip produces an effect similar to LSD or marijuana in cats. ",
    "The effects of nepetalactone in catnip wears off within 15 minutes.",
    "Spaying and neutering can extend a cat's life.",
    "A cat with a question-mark-shaped tail is asking, 'Want to play?'",
    "A slow blink is a 'kitty kiss.' This movement shows contentment and trust.",
    "If your cat approaches you with a straight tail, she is very happy to see you.",
    "Kneading is a sign of contentment and happiness.",
    "When a cat flops over and exposes his belly, he's relaxed and showing trust.",
    "When your cat wags her tail, it's her way of warning you that you are annoying her.",
    "When your cat sticks his butt in your face, it's a gesture of friendship.",
    "Your cat drapes its tail over another cat, your dog, or you as a symbol of friendship.",
    "Cats groom other cats — and sometimes people — in a ritual called allogrooming.",
    "Cats love to sleep in laundry baskets, because they're hiding places with peep holes.",
    "Many cats like to lick their owner's freshly washed hair.",
    "Abraham Lincoln had four cats that lived in the White House with him.",
    "President Bill Clinton's cat, Socks, received more letters than the President himself.",
    "A group of kittens is called a kindle.",
    "About half of the cats in the world respond to the scent of catnip.",
    "Cats can be toilet-trained.",
    "Cats were first brought to the Americas in colonial times to get rid of rodents.",
    "Collective nouns for adult cats include clowder, clutter, glaring, and pounce.",
    "Male cats are the most sensitive to catnip, young kittens the least.",
    "Most world languages have a similar word to describe the 'meow' sound.",
    "Studies suggest that domesticated cats first appeared around 3600 B.C.",
    "The first known cat video was recorded in 1894.",
    "White cats with blue eyes are prone to deafness.",
]

const CAT_JOKES = [
    "What's it called when all the treats are gone? A cat-astrophe.",
    "Why did the cats ask for a drum set? They wanted to make some mewsic!",
    "What's a cat's favorite TV show? Claw and Order.",
    "What normally happens when kitties go on a first date? They hiss.",
    "What's a cat's favorite cereal? Mice crispies.",
    "What color do kittens love the most? Purrple.",
    "What does the cat say after making a joke? 'Just kitten!'",
    "When cats need to go to the airport, who do they call? A tabby.",
    "Why did the cat have to go to an accountant? They got caught up in a purramid scheme.",
    "What made the cat upgrade his camera? He wanted to finally get pawtrait mode.",
    "What do cats look for in a significant other? A great purrsonality",
    "Which day of the week do cats love the most? Caturday",
]