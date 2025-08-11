<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan It Poker - Magic Style</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <!-- Include Alpine.js from CDN with defer attribute -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/style.css">
    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body>
    <div id="game-container" class="game-container" x-data="gameData" x-init="loadCardsAndInit()" @keydown.left.window="handleKeyDown('ArrowLeft')" @keydown.right.window="handleKeyDown('ArrowRight')">
        <!-- Displays current round and card info -->
        <div x-cloak id="current-info" class="current-info" :class="{'hidden': showEndScreen}">
            <h3 class="text-lg" x-text="`Round ${roundNumber}`"></h3>
            <div x-text="`Cards Remaining: ${currentRoundCards.length - currentCardIndex}/${currentRoundCards.length}`"></div>
            <!-- <div x-text="`Current Rank Value: +${roundNumber}`"></div> -->
        </div>

        <!-- Area where cards are displayed and swiped -->
        <div x-cloak id="card-stack" class="card-stack" :class="{'hidden': showEndScreen}">
            <!-- Loop through cards to display a stack effect -->
            <template x-for="(card, index) in currentRoundCards.slice(currentCardIndex)" :key="card.id">
                <div class="magic-card"
                    :data-card-id="card.id"
                    :style="{ 'z-index': currentRoundCards.length - index, 'top': `${index * 5}px`, 'left': `${index * 5}px`, 'transform': card.transformStyle, 'opacity': index === 0 ? card.opacityStyle : 1 - index / 7 }"
                    @mousedown="startDrag($event, card.id)"
                    @touchstart="startDrag($event, card.id)"
                    @mousemove="drag($event, card.id)"
                    @touchmove="drag($event, card.id)"
                    @mouseup="endDrag(card.id)"
                    @touchend="endDrag(card.id)"
                    @mouseleave="isDragging && endDrag(card.id)"
                >
                    <div class="card-header">
                        <span class="card-name" x-text="card.name[0]"></span>
                        <div class="mana-cost" x-html="parseManaCost(card.mana_cost)"></div>
                    </div>
                    <div class="card-header mb-2 text-sm italic font-normal">
                        <span class="text-gray-200" x-text="card.name[1]"></span>
                    </div>
                    <div class="card-image-container">
                        <img :src="`images/${card.name[0]}.jpeg`" :alt="card.image_description" class="card-image" onerror="this.onerror=null; this.src='https://placehold.co/350x180/4a5568/e2e8f0?text=Image+Not+Found';" loading="lazy">
                    </div>
                    <div class="card-type-line" x-text="`${card.card_type} — ${card.card_subtypes.join(' ')}`"></div>
                    <div class="card-text-box">
                        <div><p class="mb-2" x-text="card.card_text"></p></div>
                        <div><p class="text-gray-400 font-bold">Impact: <span class="font-normal" x-text="card.estimated_impact_to_project"></span></p>
                                                <p class="text-gray-400 font-bold">Size: <span class="font-normal" x-text="card.estimated_t_shirt_size_to_build"></span></p></div>
                    </div>
                    <div class="flavor-text" x-text="card.flavor_text"></div>
                    <template x-if="card.power_defense && card.power_defense.length === 2">
                        <div class="power-defense" x-text="`${card.power_defense[0]}/${card.power_defense[1]}`"></div>
                    </template>

                    <!-- Overlay for swipe indicators -->
                    <div class="swipe-overlay" :style="{ 'opacity': card.overlayOpacity }">
                        <div class="swipe-indicator swipe-left-indicator -ml-8 rotate-45" :style="{ 'opacity': card.leftIndicatorOpacity }" style="transform-origin: left center;">Decrease Rank</div>
                        <div class="swipe-indicator swipe-right-indicator -mr-8 -rotate-45" :style="{ 'opacity': card.rightIndicatorOpacity }" style="transform-origin: right center;">Increase Rank</div>
                    </div>
                </div>
            </template>
        </div>

        <!-- End screen, hidden until the game finishes -->
        <div x-cloak id="end-screen" class="end-screen" :class="{'hidden': !showEndScreen}">
            <h2>Final Rankings</h2>
            <ul id="ranked-list" class="ranked-list">
                <template x-for="(card, index) in sortedCards" :key="card.id">
                    <li class="ranked-list-item">
                        <div class="flex flex-col items-start">
                            <span :class="{'font-bold': index === 0}" x-text="card.name[0]"></span>
                            <small>
                                <span x-text="card.name[1]"></span>
                            </small>
                            <small>
                                Impact: <span x-text="card.estimated_impact_to_project"></span>,
                                Size: <span x-text="card.estimated_t_shirt_size_to_build"></span>
                            </small>
                        </div>
                        <strong x-text="`Rank: ${card.finalRank}`"></strong>
                    </li>
                </template>
            </ul>
            <button id="restart-button" class="restart-button" @click="initGame()">Play Again</button>
        </div>

        <button id="reset-button" class="reset-button" :class="{'hidden': showEndScreen}" @click="resetGame()">Reset Game</button>
    </div>

    <script src="/app.js"></script>
</body>
</html>
