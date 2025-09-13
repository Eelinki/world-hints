(function () {
    const game = window.game;
    const guessForm = document.querySelector('.guess-form');
    const guessInput = document.querySelector('.guess-form input[type="text"]');
    const hintsList = document.querySelector('.hints-list');
    const guessesList = document.querySelector('.guesses-list');
    const winDialog = document.getElementById('win');
    let state;

    loadState();

    guessForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const guessedValue = guessInput.value.toLowerCase();

        const guessedCountry = Object.entries(game.countries).find(([_code, name]) => {
            return name.toLowerCase() === guessedValue;
        });

        if (!guessedCountry || state.won) {
            return;
        }

        guessInput.value = '';

        state.guesses.push(guessedCountry);
        saveState();

        const match = guessedCountry[0] === game.country;
        if (!match) {
            if (state.guesses.length < game.hints.length) {
                revealHint(game.hints[Math.min(state.guesses.length - 1) + 1]);
            }
        }

        addGuess(guessedCountry[1], match);
    });

    function loadState() {
        const saved = window.localStorage.getItem(game.id);

        if (saved) {
            state = JSON.parse(saved);
        } else {
            // populate a new state
            state = {
                guesses: [],
                won: false,
            }
        }

        revealHint(game.hints[0]);
        for (let i = 0; i < Math.min(state.guesses.length, game.hints.length - 1); i++) {
            if (state.guesses[i][0] !== game.country) {
                revealHint(game.hints[i+1]);
            }
        }

        for (const [code, country] of state.guesses) {
            addGuess(country, code === game.country);
        }
    }

    function saveState() {
        window.localStorage.setItem(game.id, JSON.stringify(state));
    }

    function revealHint(hint) {
        const hintElm = document.createElement('li');
        hintElm.textContent = hint.content;
        hintsList.prepend(hintElm);
    }

    function addGuess(country, correct) {
        const guessElm = document.createElement('li');
        guessElm.textContent = country;
        guessElm.classList.add(correct ? 'correct' : 'wrong');
        guessesList.prepend(guessElm);

        if (correct) {
            win();
        }
    }

    function win() {
        state.won = true;
        winDialog.showModal();
        document.querySelectorAll('.guess-form input').forEach(e => e.disabled = true);
    }

    document.querySelectorAll('button[data-dialog]').forEach(button => button.addEventListener('click', () => {
        document.querySelector(`dialog#${button.dataset.dialog}`).showModal();
    }));

    document.querySelectorAll('button.close-modal').forEach(button => button.addEventListener('click', () => {
        button.closest('dialog').close();
    }));

    winDialog.querySelector('button.share').addEventListener('click', async () => {
        await navigator.clipboard.writeText(`🌍 World Hints #${game.id} 🌍\nI guessed today's country in ${state.guesses.length} tries! 🏆\n\nhttps://worldhints.eeli.ee/`);

        if (!document.querySelector('span.copied')) {
            const copiedElm = document.createElement('span');
            copiedElm.textContent = 'Copied!';
            copiedElm.classList.add('copied');
            winDialog.appendChild(copiedElm);
        }
    });

    document.querySelector('#settings button.reset').addEventListener('click', () => {
        window.localStorage.clear();

        location.reload();
    });
})();