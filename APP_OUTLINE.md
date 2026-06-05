# App Outline

## Core Idea

This should not be a traditional lesson-based learning app with chapters, guided progression, or study blocks.
It should be a fast, mobile-first quiz game focused only on reading Hangul.

The user starts a run and answers questions for as long as they still have lives left.
Difficulty increases during the same run.

Working title for the first mockup:

- `Hangul Rush`

## Product Goal

Train fast recognition and reading of Hangul characters:

- from individual letters
- through simpler syllables
- up to more complex syllables

Out of scope:

- handwriting
- grammar
- vocabulary meaning
- a lesson-based curriculum

## App Format

- web app
- fully browser-based
- no backend
- no login
- mobile-first
- deployable as a static site

## Main Game Loop

At launch, the app should have only one mode: `Quiz`.

One session should work like this:

1. the player starts with a fixed number of lives
2. they get one question with 4 possible answers
3. each question has a time limit
4. a correct answer increases the score and moves to the next question
5. a wrong answer or timeout removes 1 life
6. after each question, a result state is shown
7. the game ends when all lives are lost or when the full content pool is cleared
8. the best score is saved locally in the browser
9. the player can immediately start a new run

## Content Scope

The quiz should eventually cover all Hangul items included in the reading pool.

Key assumption:

- content is not split into lessons
- content is split into difficulty buckets
- the quiz pulls from those buckets with increasing difficulty over time

## Difficulty Buckets

Initial concrete proposal:

The app should eventually cover the full modern Hangul reading space:

- basic consonant jamo
- basic vowel jamo
- double consonants
- compound vowels
- full modern precomposed syllable blocks

For syllables, the full target pool should be all modern combinations built from:

- `19` initial consonants
- `21` vowels
- `28` final-consonant states including no final consonant

This yields the full modern syllable set used in Unicode Hangul syllables.

For gameplay and progression, that full pool should be split into buckets based on reading difficulty:

### Bucket 1 - single basic jamo

Include:

- basic consonants such as `ㄱ`, `ㄴ`, `ㄷ`, `ㄹ`, `ㅁ`, `ㅂ`, `ㅅ`, `ㅇ`, `ㅈ`, `ㅊ`, `ㅋ`, `ㅌ`, `ㅍ`, `ㅎ`
- basic vowels such as `ㅏ`, `ㅓ`, `ㅗ`, `ㅜ`, `ㅡ`, `ㅣ`

Reasoning:

- these are the smallest visual units
- they are the easiest place to start for pure symbol recognition

### Bucket 2 - harder standalone jamo

Include:

- visually confusable consonants
- tense / double consonants such as `ㄲ`, `ㄸ`, `ㅃ`, `ㅆ`, `ㅉ`
- aspirated consonants such as `ㅋ`, `ㅌ`, `ㅍ`, `ㅊ` when treated as contrast items
- simple derived vowels such as `ㅑ`, `ㅕ`, `ㅛ`, `ㅠ`
- compound vowels such as `ㅐ`, `ㅔ`, `ㅒ`, `ㅖ`, `ㅘ`, `ㅙ`, `ㅚ`, `ㅝ`, `ㅞ`, `ㅟ`, `ㅢ`

Reasoning:

- these are still atomic symbols
- they are harder because of visual similarity or less intuitive romanization

### Bucket 3 - simple open syllables

Include syllables with:

- no final consonant
- simple onset
- simple vowel

Examples:

- `가`, `나`, `다`, `마`, `바`, `서`, `오`, `주`

Pattern examples:

- `CV`

Reasoning:

- introduces block reading without coda complexity
- still easy to parse visually

### Bucket 4 - open syllables with harder vowels or harder onsets

Include syllables with:

- no final consonant
- double consonants, aspirated consonants, or visually similar onsets
- compound vowels

Examples:

- `깨`, `뼈`, `쭈`, `최`, `궤`, `줘`

Pattern examples:

- `CV`

Reasoning:

- still no batchim
- harder because the internal components are less familiar or easier to confuse

### Bucket 5 - closed syllables with simple final consonants

Include syllables with:

- one final consonant
- simple onset
- simple vowel
- simple coda such as `ㄱ`, `ㄴ`, `ㄷ`, `ㄹ`, `ㅁ`, `ㅂ`, `ㅇ`

Examples:

- `각`, `난`, `달`, `밤`, `봉`

Pattern examples:

- `CVC`

Reasoning:

- introduces final-consonant parsing
- this is a major difficulty jump for reading speed

### Bucket 6 - closed syllables with harder internals

Include syllables with:

- one final consonant
- harder onsets and/or harder vowels
- visually dense or high-confusion combinations

Examples:

- `꽂`, `쌍`, `뛴`, `획`, `쥘`

Pattern examples:

- `CVC`

Reasoning:

- combines block parsing, coda parsing, and visual complexity

### Bucket 7 - syllables with complex final clusters

Include syllables with valid double final consonants such as:

- `ㄳ`, `ㄵ`, `ㄶ`, `ㄺ`, `ㄻ`, `ㄼ`, `ㄽ`, `ㄾ`, `ㄿ`, `ㅀ`, `ㅄ`

Examples:

- `닭`, `앉`, `많`, `값`, `읽`

Reasoning:

- these are among the hardest items for a reading-speed quiz
- they are visually dense and often more fragile in beginner recognition

### Bucket 8 - high-confusion challenge pool

Include items from across all previous buckets that are especially easy to confuse:

- `ㅐ` vs `ㅔ`
- `ㅒ` vs `ㅖ`
- `ㅚ` vs `ㅙ` vs `ㅞ`
- `ㄱ` vs `ㅋ`
- `ㄷ` vs `ㅌ`
- `ㅂ` vs `ㅍ`
- `ㅅ` vs `ㅆ`
- `ㅈ` vs `ㅊ` vs `ㅉ`
- open vs closed syllable variants such as `가` vs `각`

Reasoning:

- this bucket exists to preserve challenge at high scores
- it acts as a deliberate confusion layer rather than a pure structural stage

Notes:

- bucket assignment should be data-driven, not hardcoded only by formula
- some items may need manual promotion to a harder bucket if playtesting shows high confusion
- the quiz should still eventually be able to reach every item in the full modern pool

## Difficulty Progression

Questions are generated randomly, but the difficulty distribution changes during a run.

Core idea:

- the beginning of a run favors the easiest buckets
- as the score increases, the chance of pulling from harder buckets increases
- easy questions never fully disappear, but their share drops

Example model:

- questions 1-5: mostly bucket 1
- questions 6-10: buckets 1 and 2
- questions 11-20: increasing amount of bucket 3
- later: growing share of buckets 4 and 5

This does not need to be a rigid stage system.
A weighted probability model tied to current score may be better.

## No Repeats Within a Run

Within a single quiz run, the same character or syllable should not appear twice.

That means:

- every used item goes into a consumed pool
- new questions can only be drawn from unused items
- if the pool runs out, the run can either end as completed or the pool can reset

For now, the more coherent assumption is:

- no repeats within one run
- every new run starts with the full pool again

## Question Format

The quiz should support two question variants with equal probability.

### Variant 1

- prompt: a Hangul character or syllable
- answers: 4 Latin-alphabet representations
- the user picks the correct reading

### Variant 2

- prompt: a Latin-alphabet representation
- answers: 4 Hangul options
- the user picks the correct character or syllable

Shared rules:

- only one answer is correct
- both variants use the same content pool
- both variants follow the same difficulty progression
- both variants respect the no-repeat rule within a run

Working assumption:

- variant 1 probability: `50%`
- variant 2 probability: `50%`

## Romanization

The app should use `Revised Romanization`.

Reasoning:

- it is the official South Korean standard
- it is the most defensible choice for a public-facing product
- it avoids teaching a non-standard internal system
- it keeps the dataset and UI rules consistent

Examples:

- `가` -> `ga`
- `어` -> `eo`
- `의` -> `ui`
- `한글` -> `hangeul`

## Wrong Answer Selection

Distractors should not be fully random, otherwise the quiz becomes too easy.

Wrong answers should be selected based on:

- visual similarity
- phonetic / romanization similarity
- the same difficulty bucket or adjacent buckets

This is important because it will heavily define the actual difficulty of the game.

## Lives

The quiz uses a life system.

Chosen MVP model:

- the player starts with `3` lives
- each wrong answer removes 1 life
- each timeout also removes 1 life
- lives are fixed in the first version

## Time Per Question

Every question has a time limit.

Chosen model:

- the app should support selectable timer presets in `Settings`
- timer presets:
  - `Blitz` = `3s`
  - `Quick` = `5s`
  - `Normal` = `7s`
  - `Relaxed` = `10s`
  - `No Timer`
- the initial default should be `7s`

## Score

The score should stay as simple and readable as possible.

Most natural model:

- `score = number of correct answers in a single run`

Run time should also be tracked:

- total run time = sum of active question-answering time only
- waiting on the result state does not count toward run time

Possible later extensions:

- streak counter
- consecutive correct answers
- speed bonus

Not worth adding in MVP.

## Game Over

The game ends when:

- the player loses all lives

If the player clears the entire content pool before losing all lives:

- the run ends as a win
- the result screen should show that the game was completed
- it should include the number of lives lost during the run
- it should encourage replay

If the player clears the entire pool with no mistakes and no lives lost:

- show a more elaborate perfect-clear celebration screen
- include stronger congratulatory messaging
- include run statistics

After game over, the app shows:

- current run score
- best score
- a button to start a new run

If the selected timer is not already `Blitz`, the result screen may also encourage replay with a lower timer for a stronger challenge.

## Local Storage

Without a backend, data should be stored locally in the browser, for example via `localStorage`.

For MVP, the app should store:

- best score
- full run history
- selected settings

Each saved run should include at least:

- score
- total run time
- timer preset used
- whether the run ended in game over or full clear
- whether it was a perfect clear

Best-score handling:

- runs should be separated by timer preset
- each timer preset should have its own best score
- each timer preset should have its own run history list
- `No Timer` should not compete directly with timed modes

## UX Requirements

- interface designed for phone screens first
- very fast entry into gameplay
- minimal screen count and minimal friction
- large answer buttons
- highly legible Hangul on screen
- clearly visible timer
- clearly visible lives state
- immediate feedback after each answer
- overall tone should lean toward light arcade / game UI rather than a plain study tool
- the start screen should already feel playful and bold

## Minimal Screen Flow

For MVP, these screens are enough:

1. start screen
2. quiz screen
3. per-question result state
4. game over / win / result screen

Without:

- lesson map
- full profiles
- deep navigation

Start screen contents for MVP:

- `Start Game`
- `Run History`
- `Settings`
- show the currently selected timer preset on the start screen

Run History screen for MVP:

- show `Best Score`
- show the last `10` runs
- organize results per timer preset
- use tabs at the top for timer presets
- inside each timer tab, show best score first and recent runs below
- for each recent run, show:
  - score
  - total run time

Settings screen for MVP:

- `SFX volume` slider (`0-100%`)
- `Timer` preset selector:
  - `Blitz (3s)`
  - `Quick (5s)`
  - `Normal (7s)`
  - `Relaxed (10s)`
  - `No Timer`
- `Reset Local Data`

Reset Local Data behavior:

- tapping it should open a confirmation modal
- confirming should wipe saved scores, run history, and settings immediately

Quiz HUD for MVP:

- top left: lives as hearts
- top center: score as number of correct answers
- top right: total active run time
- no progress-through-pool indicator by default

Question screen layout for MVP:

- the prompt should be the dominant visual element
- the prompt should be very large
- answers should sit below the prompt
- no explicit mode label is needed
- the question type should be understood implicitly from the prompt and answers

Answer layout for MVP:

- use a `2x2` grid on mobile

## App Data

Data can be stored statically on the frontend side, for example in `JSON` or `TS`.

Each content item should contain at least:

- identifier
- Hangul glyph or syllable
- correct reading
- difficulty bucket
- metadata for generating plausible distractors

Example fields:

- `id`
- `glyph`
- `romanization`
- `difficultyBucket`
- `type`
- `confusableWith`
- `enabledQuestionModes`

## Technical Requirements

- frontend only
- static hosting compatible
- full game logic on the client side
- local persistence only
- architecture that makes it easy to grow the content pool and question rules

## MVP Scope

The first version should include only what is required to validate the game loop:

- one `Quiz` mode
- multiple-choice questions
- 4 answers
- life system
- per-question timer
- result screen after every question
- no repeats within one run
- difficulty progression through buckets
- local best-score persistence
- simple game-over screen

## Per-Question Result State

After every question, the app should enter a result state instead of jumping immediately to the next one.

Correct answer flow:

- show status text: `Correct`
- keep the answer list visible
- highlight the correct answer
- keep the result visible until the player taps anywhere on the screen
- also show a clear `Next` button for explicit progression
- animate the score change in the HUD

Wrong answer flow:

- show status text: `Wrong`
- keep the answer list visible
- highlight the correct answer
- highlight the player's wrong selection in red
- keep the result visible until the player taps anywhere on the screen
- also show a clear `Next` button
- animate the lost heart in the HUD

Timeout flow:

- remove 1 life
- show status text: `Time's Up`
- keep the answer list visible
- highlight the correct answer
- do not show any option as selected by the player
- keep the result visible until the player taps anywhere on the screen
- also show a clear `Next` button
- animate the lost heart in the HUD

Status-text colors should differ by state:

- `Correct` uses its own positive color
- `Wrong` uses its own negative color
- `Time's Up` uses its own distinct timeout color

## Sound

For the first version:

- use `SFX` only
- expose an `SFX volume` slider in settings
- `0%` acts as mute
- no background music is required

## Win and Perfect Clear

If the player clears the entire pool:

- show a win state
- title: `You Win`
- show final score
- show total run time
- show how many lives were lost
- show the timer preset used
- include `Play Again`

If the player is not already using `Blitz`, the screen may also suggest trying a lower timer for a better challenge.

If the player clears the entire pool with no mistakes and no life loss:

- show a distinct perfect-clear celebration
- title: `Perfect Run`
- this should be visually stronger than the normal win screen
- it should have its own title
- it should show stats in a satisfying way
- it should feel like a real achievement moment

If the player loses all lives:

- show a game-over state
- title: `Game Over`
- show final score
- show total run time
- show the timer preset used
- include `Play Again`

## Open Decisions

- how aggressively distractors should target likely confusion
- whether the question mode ratio should always stay `50/50` or be tunable later
- exact copy and structure of the run-history screen
- exact copy and structure of the settings screen
- exact copy for timer preset descriptions
- exact accent color direction inside the dark theme

## Visual Direction

The first mockup should follow:

- dark mode only
- no light mode
- cleaner game UI rather than a noisy arcade style
- still playful and bold where it matters
- accent direction: purple / plum

## Product Conclusion

The value of this app is not "going through material."
It is repeated, fast, replayable practice:

- instant start
- short questions
- time pressure
- rising difficulty
- one simple goal: beat your high score

This is closer to an arcade quiz than a traditional learning app.
