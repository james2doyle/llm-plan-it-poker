document.addEventListener("alpine:init", () => {
	window.Alpine.data("gameData", () => ({
		allCards: [], // All original cards with their evolving rank states
		currentRoundCards: [], // Cards currently active in the current ranking round
		currentCardIndex: 0, // Index of the card being displayed in the currentRoundCards
		roundNumber: 1, // Tracks the current round, used to increment rank for 'right' swipes
		showEndScreen: false, // Controls visibility of the end game screen
		sortedCards: [], // Array to hold cards sorted by final rank for the end screen

		// State for drag/swipe logic
		isDragging: false,
		startX: 0,
		currentX: 0,
		swipeThreshold: 80, // Minimum pixels to drag to register a swipe
		rotationFactor: 0.05, // Factor to apply rotation based on horizontal drag

		/**
		 * Loads card data from a JSON file and then initializes the game.
		 */
		async loadCardsAndInit() {
			try {
				// Assuming cards.json is in the same directory as index.html
				const response = await fetch("./cards.json");
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				this.allCards = data.map((card, index) => ({
					...card,
					id: `card-${index}`, // Assign a unique ID to each card
					currentRank: 0, // Rank accumulating within rounds
					finalRank: -1, // Final rank assigned when a card is 'swiped left' or at game end
					swipedRightInRound: false, // Flag to determine if card proceeds to next round
					transformStyle: "translateX(0) rotate(0deg)", // Initial transform for CSS
					opacityStyle: 1, // Initial opacity for CSS
					overlayOpacity: 0, // Initial opacity for swipe indicators
					leftIndicatorOpacity: 0,
					rightIndicatorOpacity: 0,
				}));
				this.initGame(); // Initialize the game once data is loaded
			} catch (error) {
				console.error("Failed to load card data:", error);
				// You might want to display a user-friendly error message here
			}
		},

		/**
		 * Initializes or restarts the game to its default state.
		 * Assumes this.allCards has already been populated from a fetch call.
		 */
		initGame() {
			// Reset all card states for a fresh game, using the already loaded allCards
			this.allCards = this.allCards.map((card) => ({
				...card,
				currentRank: 0,
				finalRank: -1,
				swipedRightInRound: false,
				transformStyle: "translateX(0) rotate(0deg)",
				opacityStyle: 1,
				overlayOpacity: 0,
				leftIndicatorOpacity: 0,
				rightIndicatorOpacity: 0,
			}));
			// All cards start in the first round
			this.currentRoundCards = [...this.allCards];
			this.currentCardIndex = 0;
			this.roundNumber = 1;
			this.showEndScreen = false;
			this.sortedCards = [];
		},

		/**
		 * Parses mana cost strings (e.g., "{2}{W}{U}") into HTML elements representing mana symbols.
		 * @param {string[]} manaCostArray - An array containing the mana cost string.
		 * @returns {string} HTML string for mana symbols.
		 */
		parseManaCost(manaCostArray) {
			console.log(manaCostArray);
			if (!manaCostArray || manaCostArray.length === 0) return "";
			return manaCostArray
				.map(
					(match) => `<span class="mana-symbol mana-${match}">${match}</span>`,
				)
				.join("");
		},

		/**
		 * Starts the drag operation for a card.
		 * @param {Event} e - The mouse or touch event.
		 * @param {string} cardId - The ID of the card being dragged.
		 */
		startDrag(e, cardId) {
			this.isDragging = true;
			// Prevent default to avoid text selection on desktop or scrolling on mobile
			e.preventDefault();

			this.startX = e.clientX || e.touches[0].clientX;
			const card = this.allCards.find((c) => c.id === cardId);
			if (card) {
				// Reset transform and transition for immediate drag response
				card.transformStyle = "translateX(0) rotate(0deg)";
				card.opacityStyle = 1;
			}
		},

		/**
		 * Handles the dragging movement of a card.
		 * @param {Event} e - The mouse or touch event.
		 * @param {string} cardId - The ID of the card being dragged.
		 */
		drag(e, cardId) {
			if (!this.isDragging) return;

			const clientX = e.clientX || e.touches[0].clientX;
			this.currentX = clientX - this.startX;

			const card = this.allCards.find((c) => c.id === cardId);
			if (card) {
				card.transformStyle = `translateX(${this.currentX}px) rotate(${this.currentX * this.rotationFactor}deg)`;

				const opacity = Math.min(
					Math.abs(this.currentX) / this.swipeThreshold,
					1,
				);
				card.overlayOpacity = opacity;
				if (this.currentX < 0) {
					// Swiping left
					card.leftIndicatorOpacity = opacity;
					card.rightIndicatorOpacity = 0;
				} else {
					// Swiping right
					card.rightIndicatorOpacity = opacity;
					card.leftIndicatorOpacity = 0;
				}
			}
		},

		/**
		 * Ends the drag operation and processes the swipe.
		 * @param {string} cardId - The ID of the card being swiped.
		 */
		endDrag(cardId) {
			if (!this.isDragging) return;
			this.isDragging = false;

			const card = this.allCards.find((c) => c.id === cardId);
			if (!card) return;

			// Reset indicator opacities immediately
			card.overlayOpacity = 0;
			card.leftIndicatorOpacity = 0;
			card.rightIndicatorOpacity = 0;

			if (this.currentX > this.swipeThreshold) {
				this.handleCardSwipe(card, "right");
			} else if (this.currentX < -this.swipeThreshold) {
				this.handleCardSwipe(card, "left");
			} else {
				// Reset card position if swipe threshold not met
				card.transformStyle = "translateX(0) rotate(0deg)";
				card.opacityStyle = 1;
			}
			this.currentX = 0; // Reset currentX for next drag
		},

		/**
		 * Handles the logic after a card is swiped (left or right).
		 * @param {Object} card - The card object that was swiped.
		 * @param {string} direction - 'left' or 'right' indicating the swipe direction.
		 */
		handleCardSwipe(card, direction) {
			if (direction === "right") {
				card.currentRank += this.roundNumber;
				card.swipedRightInRound = true;
				card.transformStyle = "translateX(200%) rotate(30deg)";
			} else {
				card.finalRank = card.currentRank;
				card.swipedRightInRound = false;
				card.transformStyle = "translateX(-200%) rotate(-30deg)";
			}
			card.opacityStyle = 0; // Fade out

			// Use setTimeout to allow the transition to complete before moving to next card
			setTimeout(() => {
				this.currentCardIndex++;
				if (this.currentCardIndex >= this.currentRoundCards.length) {
					this.startNextRound();
				}
			}, 500); // Match this duration to the CSS transition duration
		},

		/**
		 * Manages the transition to the next round of ranking or ends the game.
		 */
		startNextRound() {
			const nextRoundCandidates = this.currentRoundCards.filter(
				(card) => card.swipedRightInRound,
			);

			if (nextRoundCandidates.length <= 1) {
				nextRoundCandidates.forEach((card) => {
					if (card.finalRank === -1) {
						card.finalRank = card.currentRank;
					}
				});
				this.endGame();
				return;
			}

			const ranksInNextRound = nextRoundCandidates.map((c) => c.currentRank);
			const uniqueRanks = new Set(ranksInNextRound);

			if (uniqueRanks.size === nextRoundCandidates.length) {
				nextRoundCandidates.forEach((card) => {
					if (card.finalRank === -1) {
						card.finalRank = card.currentRank;
					}
				});
				this.endGame();
				return;
			}

			this.roundNumber++;
			this.currentRoundCards = nextRoundCandidates.map((card) => {
				// Reset temporary visual styles and swipedRightInRound flag
				card.transformStyle = "translateX(0) rotate(0deg)";
				card.opacityStyle = 1;
				card.overlayOpacity = 0;
				card.leftIndicatorOpacity = 0;
				card.rightIndicatorOpacity = 0;
				card.swipedRightInRound = false;
				return card;
			});
			this.currentCardIndex = 0;
		},

		/**
		 * Ends the game, calculates final ranks, and displays the sorted list.
		 */
		endGame() {
			this.allCards.forEach((card) => {
				if (card.finalRank === -1) {
					card.finalRank = card.currentRank;
				}
			});

			this.sortedCards = [...this.allCards].sort(
				(a, b) => b.finalRank - a.finalRank,
			);
			this.showEndScreen = true;
		},
	}));
});
