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

		// New property for URL state management
		urlStateKey: "gameState", // Key for the URL query parameter

		/**
		 * Alpine.js init method. Called when the component is initialized.
		 * Handles initial card loading and state restoration from URL.
		 */
		init() {
			// First, load base card data and initialize game to default state.
			// This ensures 'allCards' is populated before attempting to load from URL.
			this.loadCardsAndInit().then(() => {
				// After cards are loaded and game is initialized to its default,
				// attempt to load state from the URL. This will override default state if present.
				this.loadStateFromUrl();
				// Ensure the URL reflects the current state (either default or loaded from URL).
				this.saveStateToUrl();
			});
		},

		/**
		 * Encodes the current game state into a URL-safe string.
		 * Only persists essential game state, not UI-specific properties.
		 * @returns {string} The encoded game state string.
		 */
		encodeGameState() {
			const stateToPersist = {
				cards: this.allCards.map((card) => ({
					id: card.id,
					cr: card.currentRank, // cr for currentRank
					fr: card.finalRank, // fr for finalRank
				})),
				cIdx: this.currentCardIndex, // cIdx for currentCardIndex
				rNum: this.roundNumber, // rNum for roundNumber
				eScr: this.showEndScreen, // eScr for showEndScreen
			};

			try {
				const jsonString = JSON.stringify(stateToPersist);
				// Base64 encode to handle special characters and make it more compact
				const base64Encoded = btoa(jsonString);
				// URL encode to ensure it's safe for query parameters
				return encodeURIComponent(base64Encoded);
			} catch (error) {
				console.error("Failed to encode game state:", error);
				return "";
			}
		},

		/**
		 * Decodes game state from a URL-safe string and applies it to the component.
		 * @param {string} encodedState - The encoded game state string from the URL.
		 */
		decodeGameState(encodedState) {
			try {
				const decodedUri = decodeURIComponent(encodedState);
				const base64Decoded = atob(decodedUri);
				const state = JSON.parse(base64Decoded);

				// Apply loaded state to allCards
				if (Array.isArray(state.cards)) {
					// Iterate over the current 'allCards' and update their ranks based on persisted state
					this.allCards = this.allCards.map((originalCard) => {
						const persistedCard = state.cards.find(
							(pc) => pc.id === originalCard.id,
						);
						if (persistedCard) {
							return {
								...originalCard,
								currentRank:
									persistedCard.cr !== undefined
										? persistedCard.cr
										: originalCard.currentRank,
								finalRank:
									persistedCard.fr !== undefined
										? persistedCard.fr
										: originalCard.finalRank,
								// Reset transient UI states, they are not persisted
								transformStyle: "translateX(0) rotate(0deg)",
								opacityStyle: 1,
								overlayOpacity: 0,
								leftIndicatorOpacity: 0,
								rightIndicatorOpacity: 0,
								swipedRightInRound: false, // This flag is per-round and not persisted
							};
						}
						return originalCard; // Return original if no persisted state found (shouldn't happen with proper IDs)
					});
				}

				// Apply other state variables
				this.currentCardIndex = state.cIdx !== undefined ? state.cIdx : 0;
				this.roundNumber = state.rNum !== undefined ? state.rNum : 1;
				this.showEndScreen = state.eScr !== undefined ? state.eScr : false;

				// Reconstruct currentRoundCards based on the loaded 'allCards'
				// Only cards with finalRank === -1 are still in play
				this.currentRoundCards = this.allCards.filter(
					(card) => card.finalRank === -1,
				);

				// Adjust currentCardIndex if it's out of bounds for the reconstructed currentRoundCards
				if (
					this.currentCardIndex >= this.currentRoundCards.length &&
					this.currentRoundCards.length > 0
				) {
					this.currentCardIndex = 0; // Reset to first card if index is invalid
				} else if (this.currentRoundCards.length === 0) {
					this.currentCardIndex = 0; // No cards to display
				}

				// If the game was saved in an 'end screen' state, ensure it's reflected correctly
				if (this.showEndScreen && this.currentRoundCards.length > 0) {
					// This is an inconsistent state if showEndScreen is true but there are still cards in play.
					// Force end game to ensure sortedCards is populated and state is consistent.
					this.endGame();
				} else if (this.currentRoundCards.length === 0 && !this.showEndScreen) {
					// If no cards are left but end screen isn't shown, force end game.
					this.endGame();
				}

				console.log("Game state loaded from URL:", state);
			} catch (error) {
				console.error("Failed to decode game state from URL:", error);
				// If decoding fails, the game will remain in its default 'initGame' state.
			}
		},

		/**
		 * Saves the current game state to the URL query parameters.
		 * This method should be called after any state change that needs to be persisted.
		 */
		saveStateToUrl() {
			const encodedState = this.encodeGameState();
			const url = new URL(window.location.href);
			if (encodedState) {
				url.searchParams.set(this.urlStateKey, encodedState);
			} else {
				url.searchParams.delete(this.urlStateKey); // Remove parameter if state is empty/invalid
			}
			// Use replaceState to avoid cluttering browser history with every state change
			window.history.replaceState({}, "", url.toString());
			console.log("Game state saved to URL:", encodedState);
		},

		/**
		 * Loads game state from the URL query parameters.
		 */
		loadStateFromUrl() {
			const urlParams = new URLSearchParams(window.location.search);
			const encodedState = urlParams.get(this.urlStateKey);
			if (encodedState) {
				this.decodeGameState(encodedState);
			} else {
				// If no state in URL, the game remains in its default 'initGame' state, which is correct.
			}
		},

		/**
		 * Loads card data from a JSON file and then initializes the game.
		 */
		async loadCardsAndInit() {
			try {
				// Assuming cards.json is in the same directory as index.html
				const response = await fetch("/cards.json");
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
				this.initGame(); // Initialize the game once data is loaded to its default state
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
			// This is the default state, which can be overridden by URL state later.
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
		 * Resets the game to the start.
		 */
		resetGame() {
			this.initGame();
			this.saveStateToUrl();
		},

		/**
		 * Parses mana cost strings (e.g., "{2}{W}{U}") into HTML elements representing mana symbols.
		 * @param {string[]} manaCostArray - An array containing the mana cost string.
		 * @returns {string} HTML string for mana symbols.
		 */
		parseManaCost(manaCostArray) {
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
			// No need to save state here, handleCardSwipe will do it after timeout
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
				// Save state after the card has moved and index/round logic has potentially updated
				this.saveStateToUrl();
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
				// State will be saved by endGame
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
				// State will be saved by endGame
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
			this.saveStateToUrl(); // Save state after round transition
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
			this.saveStateToUrl(); // Save state after game ends
		},
	}));
});
