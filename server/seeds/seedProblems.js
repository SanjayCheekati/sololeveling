const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('../models/Problem');

dotenv.config();

const problems = [
  // ==================== PYTHON BASICS - AWAKENING TUTORIALS ====================
  // Reference: w3schools.com/python, codewithharry.com
  {
    title: "Your First Python Program",
    slug: "hello-world",
    description: `# 🎮 Welcome, New Hunter!

You have awakened! Before you can conquer dungeons, you must learn the language of power: **Python**.

## What is Python?
Python is a programming language - it's how we talk to computers! Think of it like learning a new language, but instead of talking to people, you're talking to your computer.

## Your First Task
Every programmer starts with the same first spell: **"Hello, World!"**

This is like saying "I'm here!" to the programming world.`,
    zone: "arrays",
    difficulty: "tutorial",
    rank: "E",
    availableInPhases: ["visualization", "guided", "autonomous"],
    tutorialContent: {
      sections: [
        {
          title: "What is Programming?",
          content: `**Programming** is giving instructions to a computer. Just like you follow a recipe to make food, computers follow our code to do tasks!

🍕 **Real Life Example:**
- Recipe: "Add flour, then add water, then mix"
- Code: "print this, then calculate that, then show result"`,
          type: "intro",
          explanation: "Think of code as a recipe. Each line is one step the computer follows, one after another!"
        },
        {
          title: "The print() Function",
          content: `The **print()** function tells Python to show something on screen.

It's like telling your computer: "Hey, display this message!"`,
          code: `# This is how we print in Python
print("Hello, World!")

# You can print anything!
print("My name is Hunter")
print(42)
print("I am", 10, "years old")`,
          type: "explanation",
          explanation: "Whatever you put inside print() will appear on your screen. It's the simplest way to see what your program is doing!"
        },
        {
          title: "Try It Yourself",
          content: `Now let's see if you understood!

The **print()** function:
- Always uses parentheses ( )
- Text goes inside quotes " "
- Numbers don't need quotes`,
          code: `print("Hello")      # ✅ Correct - text in quotes
print(123)          # ✅ Correct - numbers without quotes  
print(Hello)        # ❌ Wrong - text needs quotes!`,
          type: "example",
          tryIt: "Try changing the message inside print() to say your name!"
        },
        {
          title: "Quick Check!",
          content: "Let's test what you learned about print()!",
          type: "checkpoint",
          hasPrediction: true
        }
      ],
      predictions: [
        {
          question: "What will print(\"Python\") display?",
          correctAnswer: "Python",
          options: ["Python", "print", "\"Python\"", "Error"],
          explanation: "print() shows whatever is inside the quotes - in this case, the word Python!"
        }
      ]
    },
    starterCode: `# Your first Python program!
# Type your code below and click Run

print("Hello, World!")`,
    solutionCode: `print("Hello, World!")`,
    testCases: [
      { input: "none", expectedOutput: "Hello, World!", isHidden: false }
    ],
    hints: [
      { text: "Use print() with quotes around your text", cost: 10 },
      { text: "Make sure to spell 'Hello, World!' exactly", cost: 20 }
    ],
    examples: [
      { input: "none", output: "Hello, World!", explanation: "The print function displays the text on screen" }
    ],
    predictions: [
      {
        question: "What will print(\"Python\") display?",
        correctAnswer: "Python",
        options: ["Python", "print", "\"Python\"", "Error"],
        explanation: "print() shows whatever is inside the quotes!"
      }
    ],
    objectives: [
      { description: "Write the print function", order: 1, hint: "Start with print(" },
      { description: "Add the message in quotes", order: 2, hint: "\"Hello, World!\"" },
      { description: "Close the parentheses", order: 3, hint: ")" }
    ],
    xpReward: 25,
    goldReward: 15,
    firstTimeBonus: 20,
    statsGain: { intelligence: 1 },
    order: 0,
    tags: ["python-basics", "print", "beginner", "tutorial"]
  },
  {
    title: "Variables - Your Data Storage",
    slug: "variables-intro",
    description: `# 📦 Variables - Storing Your Power

Hunters need to store their items. In Python, we store data in **variables**!

A variable is like a labeled box where you can put stuff and get it back later.`,
    zone: "arrays",
    difficulty: "tutorial",
    rank: "E",
    availableInPhases: ["visualization", "guided", "autonomous"],
    tutorialContent: {
      sections: [
        {
          title: "What are Variables?",
          content: `A **variable** is like a labeled box that stores information.

📦 **Real Life Example:**
- You have a box labeled "toys" - you put toys in it
- In Python, you have a variable named "age" - you put a number in it

**Why use variables?**
- Store information to use later
- Give data meaningful names
- Change values easily`,
          type: "intro",
          explanation: "Variables are like labeled jars in your kitchen. The label tells you what's inside!"
        },
        {
          title: "Creating Variables",
          content: `Creating a variable is easy! Just pick a name and use **=** to put something in it.`,
          code: `# Creating variables
name = "Hunter"        # Stores text (string)
age = 15               # Stores a number (integer)
health = 100.5         # Stores a decimal (float)
is_alive = True        # Stores True or False (boolean)

# Now we can use them!
print(name)            # Shows: Hunter
print(age)             # Shows: 15
print("HP:", health)   # Shows: HP: 100.5`,
          type: "explanation",
          explanation: "The = sign doesn't mean 'equals' here - it means 'store this value in this box'!"
        },
        {
          title: "Variable Naming Rules",
          content: `**Good variable names:**
- Start with a letter or underscore
- Use lowercase letters
- Use underscores for spaces
- Be descriptive!`,
          code: `# ✅ Good names
player_name = "Sung"
max_health = 100
current_level = 5

# ❌ Bad names (will cause errors!)
# 2fast = 10        # Can't start with number
# my-name = "Bob"   # Can't use hyphens
# class = "Warrior" # Can't use Python keywords`,
          type: "example",
          tryIt: "Create a variable called 'my_power' and store the number 50 in it!"
        },
        {
          title: "Quick Check!",
          content: "Let's test your variable knowledge!",
          type: "checkpoint",
          hasPrediction: true
        }
      ],
      predictions: [
        {
          question: "If x = 10, what does print(x) show?",
          correctAnswer: "10",
          options: ["x", "10", "\"x\"", "Error"],
          explanation: "print(x) shows the VALUE stored in x, which is 10!"
        }
      ]
    },
    starterCode: `# Create variables to store your hunter info
name = "Your Name"
level = 1
health = 100

# Print your stats
print("Hunter:", name)
print("Level:", level)
print("Health:", health)`,
    solutionCode: `name = "Hunter"
level = 1
health = 100
print("Hunter:", name)
print("Level:", level)
print("Health:", health)`,
    testCases: [
      { input: "none", expectedOutput: "Hunter:", isHidden: false }
    ],
    hints: [
      { text: "Variable names go on the left of =", cost: 10 },
      { text: "Values go on the right of =", cost: 20 }
    ],
    examples: [
      { input: "none", output: "Hunter: Sung\nLevel: 1\nHealth: 100", explanation: "Variables store values that we can print later" }
    ],
    predictions: [
      {
        question: "If x = 10, what does print(x) show?",
        correctAnswer: "10",
        options: ["x", "10", "\"x\"", "Error"],
        explanation: "print(x) shows the VALUE stored in x, which is 10!"
      }
    ],
    objectives: [
      { description: "Create a name variable", order: 1 },
      { description: "Create a level variable", order: 2 },
      { description: "Print the variables", order: 3 }
    ],
    xpReward: 30,
    goldReward: 20,
    firstTimeBonus: 25,
    statsGain: { intelligence: 1 },
    order: 1,
    tags: ["python-basics", "variables", "beginner", "tutorial"]
  },
  {
    title: "Math Operations - Calculator Powers",
    slug: "basic-math",
    description: `# 🔢 Math in Python - Your Calculator Powers

Python can do math for you! Let's learn the basic operations every Hunter needs.`,
    zone: "arrays",
    difficulty: "tutorial",
    rank: "E",
    availableInPhases: ["visualization", "guided", "autonomous"],
    tutorialContent: {
      sections: [
        {
          title: "Python as a Calculator",
          content: `Python is great at math! You can use it like a super-powered calculator.

**Basic Math Symbols:**
| Symbol | Meaning | Example |
|--------|---------|---------|
| + | Addition | 5 + 3 = 8 |
| - | Subtraction | 10 - 4 = 6 |
| * | Multiplication | 4 * 3 = 12 |
| / | Division | 15 / 3 = 5 |`,
          type: "intro",
          explanation: "The * symbol means multiply (not x), and / means divide!"
        },
        {
          title: "Doing Math",
          content: `Let's see math in action!`,
          code: `# Basic operations
print(10 + 5)    # Addition: 15
print(20 - 8)    # Subtraction: 12
print(6 * 7)     # Multiplication: 42
print(100 / 4)   # Division: 25.0

# You can store results in variables!
damage = 50
critical_bonus = 20
total_damage = damage + critical_bonus
print("Total Damage:", total_damage)  # 70`,
          type: "explanation",
          explanation: "Notice that division (/) always gives a decimal number, even if it divides evenly!"
        },
        {
          title: "More Math Powers",
          content: `Python has some extra math tricks:`,
          code: `# Power (exponent) - using **
print(2 ** 3)      # 2 to the power of 3 = 8
print(10 ** 2)     # 10 squared = 100

# Integer Division - using //
print(17 // 5)     # Divides and rounds down = 3

# Remainder (modulo) - using %
print(17 % 5)      # Remainder after dividing = 2

# Useful example:
# Is a number even or odd?
number = 7
remainder = number % 2
print(remainder)   # 1 means odd, 0 means even`,
          type: "example",
          tryIt: "Calculate: if you have 100 gold and buy 3 items at 25 gold each, how much gold is left?"
        },
        {
          title: "Quick Check!",
          content: "Time to test your math powers!",
          type: "checkpoint",
          hasPrediction: true
        }
      ],
      predictions: [
        {
          question: "What is 10 + 5 * 2?",
          correctAnswer: "20",
          options: ["30", "20", "25", "17"],
          explanation: "Python follows math order: multiplication first (5*2=10), then addition (10+10=20)!"
        }
      ]
    },
    starterCode: `# Calculate your battle stats!
base_attack = 25
weapon_bonus = 15
level_multiplier = 2

# Calculate total attack power
total_attack = base_attack + weapon_bonus
final_attack = total_attack * level_multiplier

print("Base Attack:", base_attack)
print("Weapon Bonus:", weapon_bonus)
print("Final Attack Power:", final_attack)`,
    solutionCode: `base_attack = 25
weapon_bonus = 15
level_multiplier = 2
total_attack = base_attack + weapon_bonus
final_attack = total_attack * level_multiplier
print("Final Attack Power:", final_attack)`,
    testCases: [
      { input: "none", expectedOutput: "80", isHidden: false }
    ],
    hints: [
      { text: "Use + for addition, * for multiplication", cost: 10 },
      { text: "Store intermediate results in variables", cost: 20 }
    ],
    examples: [
      { input: "none", output: "Final Attack Power: 80", explanation: "(25 + 15) * 2 = 80" }
    ],
    predictions: [
      {
        question: "What is 10 + 5 * 2?",
        correctAnswer: "20",
        options: ["30", "20", "25", "17"],
        explanation: "Multiplication happens before addition: 5*2=10, then 10+10=20"
      }
    ],
    objectives: [
      { description: "Calculate total attack (base + bonus)", order: 1 },
      { description: "Multiply by level_multiplier", order: 2 },
      { description: "Print the final result", order: 3 }
    ],
    xpReward: 35,
    goldReward: 25,
    firstTimeBonus: 25,
    statsGain: { intelligence: 1, strength: 1 },
    order: 2,
    tags: ["python-basics", "math", "operators", "beginner", "tutorial"]
  },
  {
    title: "If Statements - Making Decisions",
    slug: "if-statements",
    description: `# 🔀 If Statements - The Power of Choice

A true Hunter must make decisions! **If statements** let your code choose different paths.`,
    zone: "arrays",
    difficulty: "tutorial",
    rank: "E",
    availableInPhases: ["visualization", "guided", "autonomous"],
    tutorialContent: {
      sections: [
        {
          title: "What are If Statements?",
          content: `**If statements** let your code make decisions, just like you do every day!

🎮 **Real Life Example:**
- IF it's raining → take an umbrella
- IF you're hungry → eat food
- IF enemy health is 0 → you win!

In Python, we write conditions that are either **True** or **False**.`,
          type: "intro",
          explanation: "Think of if statements as asking yes/no questions. If yes (True), do something!"
        },
        {
          title: "Writing If Statements",
          content: `Here's how to write an if statement:`,
          code: `# Basic if statement
health = 100

if health > 0:
    print("You are alive!")

# The code inside only runs if the condition is True
# Notice the colon : and the indentation (spaces)!

# Another example:
level = 5
if level >= 5:
    print("You can enter the dungeon!")`,
          type: "explanation",
          explanation: "Important: The code inside the if MUST be indented (4 spaces). This tells Python what belongs to the if!"
        },
        {
          title: "Comparison Operators",
          content: `To make decisions, we compare things:

| Symbol | Meaning | Example |
|--------|---------|---------|
| == | Equals | age == 18 |
| != | Not equals | name != "Bob" |
| > | Greater than | score > 100 |
| < | Less than | health < 50 |
| >= | Greater or equal | level >= 10 |
| <= | Less or equal | gold <= 0 |`,
          code: `age = 15
gold = 50

if age >= 13:
    print("You can play this game!")

if gold >= 100:
    print("You can buy the sword!")
else:
    print("Not enough gold!")`,
          type: "example",
          tryIt: "Write an if statement that prints 'Level Up!' if experience is 100 or more"
        },
        {
          title: "Quick Check!",
          content: "Let's test your decision-making powers!",
          type: "checkpoint",
          hasPrediction: true
        }
      ],
      predictions: [
        {
          question: "If health = 0, what does 'if health > 0: print(\"Alive\")' print?",
          correctAnswer: "Nothing",
          options: ["Alive", "Nothing", "Error", "0"],
          explanation: "0 is NOT greater than 0, so the condition is False and nothing prints!"
        }
      ]
    },
    starterCode: `# Hunter Battle System
player_health = 75
enemy_health = 0

# Check if player is alive
if player_health > 0:
    print("Player is still fighting!")

# Check if enemy is defeated
if enemy_health <= 0:
    print("Enemy defeated! You win!")

# YOUR TASK: Add an if statement to check
# if player_health is less than 50 (low health warning)
`,
    solutionCode: `player_health = 75
enemy_health = 0
if player_health > 0:
    print("Player is still fighting!")
if enemy_health <= 0:
    print("Enemy defeated!")
if player_health < 50:
    print("Warning: Low health!")`,
    testCases: [
      { input: "none", expectedOutput: "fighting", isHidden: false }
    ],
    hints: [
      { text: "Use < for 'less than'", cost: 10 },
      { text: "Don't forget the colon : after the condition", cost: 20 }
    ],
    examples: [
      { input: "none", output: "Player is still fighting!\nEnemy defeated!", explanation: "Both conditions are True" }
    ],
    predictions: [
      {
        question: "If health = 0, what does 'if health > 0: print(\"Alive\")' print?",
        correctAnswer: "Nothing",
        options: ["Alive", "Nothing", "Error", "0"],
        explanation: "0 is NOT greater than 0, so the condition is False!"
      }
    ],
    objectives: [
      { description: "Understand if statement syntax", order: 1 },
      { description: "Use comparison operators correctly", order: 2 },
      { description: "Add proper indentation", order: 3 }
    ],
    xpReward: 40,
    goldReward: 30,
    firstTimeBonus: 30,
    statsGain: { intelligence: 2 },
    order: 3,
    tags: ["python-basics", "if-statements", "conditionals", "beginner", "tutorial"]
  },
  {
    title: "Loops - Repeat Your Power",
    slug: "loops-intro",
    description: `# 🔄 Loops - Repeating Actions

Sometimes you need to do something many times. **Loops** let you repeat code without writing it over and over!`,
    zone: "arrays",
    difficulty: "tutorial",
    rank: "E",
    availableInPhases: ["visualization", "guided", "autonomous"],
    tutorialContent: {
      sections: [
        {
          title: "Why Use Loops?",
          content: `Imagine you want to print "Attack!" 100 times. Would you write 100 print statements? NO!

🔄 **Loops** repeat code automatically.

**Real Life Example:**
- "Do 10 pushups" = a loop that repeats 10 times
- "Keep walking until you reach the store" = a loop with a condition`,
          type: "intro",
          explanation: "Loops are like telling someone: 'Keep doing this until I say stop!'"
        },
        {
          title: "The For Loop",
          content: `The **for loop** repeats code a specific number of times.`,
          code: `# Print "Attack!" 5 times
for i in range(5):
    print("Attack!")

# Output:
# Attack!
# Attack!
# Attack!
# Attack!
# Attack!

# The variable 'i' counts: 0, 1, 2, 3, 4
for i in range(5):
    print("Hit number:", i)`,
          type: "explanation",
          explanation: "range(5) creates numbers 0, 1, 2, 3, 4. The loop runs once for each number!"
        },
        {
          title: "Loop Through Lists",
          content: `You can also loop through a list of items:`,
          code: `# Loop through a list of enemies
enemies = ["Goblin", "Orc", "Dragon"]

for enemy in enemies:
    print("Fighting:", enemy)

# Output:
# Fighting: Goblin
# Fighting: Orc
# Fighting: Dragon

# Calculate total damage
damages = [10, 25, 15, 30]
total = 0
for damage in damages:
    total = total + damage
print("Total damage:", total)  # 80`,
          type: "example",
          tryIt: "Write a loop that prints numbers 1 to 5 (hint: use range(1, 6))"
        },
        {
          title: "Quick Check!",
          content: "Test your loop knowledge!",
          type: "checkpoint",
          hasPrediction: true
        }
      ],
      predictions: [
        {
          question: "How many times does 'for i in range(3):' repeat?",
          correctAnswer: "3",
          options: ["2", "3", "4", "1"],
          explanation: "range(3) gives us 0, 1, 2 - that's 3 numbers, so 3 repetitions!"
        }
      ]
    },
    starterCode: `# Level up your skills with loops!

# Print attack 3 times
for i in range(3):
    print("Attack!")

# Calculate total XP from quests
quest_xp = [50, 75, 100, 25]
total_xp = 0

for xp in quest_xp:
    total_xp = total_xp + xp

print("Total XP earned:", total_xp)`,
    solutionCode: `for i in range(3):
    print("Attack!")
quest_xp = [50, 75, 100, 25]
total_xp = 0
for xp in quest_xp:
    total_xp = total_xp + xp
print("Total XP earned:", total_xp)`,
    testCases: [
      { input: "none", expectedOutput: "250", isHidden: false }
    ],
    hints: [
      { text: "range(n) creates numbers from 0 to n-1", cost: 10 },
      { text: "Use 'for item in list:' to go through each item", cost: 20 }
    ],
    examples: [
      { input: "none", output: "Attack!\nAttack!\nAttack!\nTotal XP earned: 250", explanation: "Loop prints 3 times, then calculates sum" }
    ],
    predictions: [
      {
        question: "How many times does 'for i in range(3):' repeat?",
        correctAnswer: "3",
        options: ["2", "3", "4", "1"],
        explanation: "range(3) = 0, 1, 2 = 3 repetitions!"
      }
    ],
    objectives: [
      { description: "Understand for loop syntax", order: 1 },
      { description: "Use range() function", order: 2 },
      { description: "Loop through lists", order: 3 }
    ],
    xpReward: 45,
    goldReward: 35,
    firstTimeBonus: 35,
    statsGain: { intelligence: 2, agility: 1 },
    order: 4,
    tags: ["python-basics", "loops", "for-loop", "beginner", "tutorial"]
  },
  // ==================== ARRAYS ZONE ====================
  {
    title: "Array Awakening",
    slug: "array-awakening",
    description: `# 📚 Array Awakening - Your First Data Structure!

Now that you know Python basics, it's time to learn about **Arrays** (called **Lists** in Python)!

## What is a List?
A list is like a backpack that can hold many items. Instead of creating 10 separate variables, you put them all in one list!

## Your Task
Given a list of numbers, add them all up and return the total.

**Example:** [1, 2, 3, 4, 5] → 1+2+3+4+5 = **15**`,
    zone: "arrays",
    difficulty: "tutorial",
    rank: "E",
    availableInPhases: ["visualization", "guided", "autonomous"],
    tutorialContent: {
      sections: [
        {
          title: "What is a List (Array)?",
          content: `A **list** is a collection of items stored in one variable.

📦 **Real Life Example:**
- Shopping list: ["apples", "bread", "milk"]
- Your inventory: ["sword", "potion", "shield"]
- Damage numbers: [10, 25, 15, 30]

**Why use lists?**
- Store many values in one place
- Easy to add, remove, or find items
- Loop through all items easily`,
          type: "intro",
          explanation: "Think of a list like a train with many cars. Each car holds one item, and they're all connected!"
        },
        {
          title: "Creating and Using Lists",
          content: `Here's how to create and use lists in Python:`,
          code: `# Creating a list
numbers = [1, 2, 3, 4, 5]
enemies = ["Goblin", "Orc", "Dragon"]

# Getting items by index (position)
# Remember: counting starts at 0!
print(numbers[0])   # First item: 1
print(numbers[2])   # Third item: 3
print(enemies[1])   # Second enemy: Orc

# List length
print(len(numbers))  # 5 items`,
          type: "explanation",
          explanation: "Index numbers start at 0, not 1! So the first item is at index 0, second at index 1, etc."
        },
        {
          title: "Adding Up List Items",
          content: `To solve our problem, we need to add all numbers in a list:`,
          code: `# Method 1: Using a loop
numbers = [1, 2, 3, 4, 5]
total = 0                    # Start with 0

for num in numbers:          # Go through each number
    total = total + num      # Add it to total
    # Same as: total += num

print(total)                 # 15

# Method 2: Using sum() function
total = sum(numbers)         # Python does it for us!
print(total)                 # 15`,
          type: "example",
          tryIt: "Try adding up [10, 20, 30] using a loop!"
        },
        {
          title: "Quick Check!",
          content: "Let's test your array knowledge!",
          type: "checkpoint",
          hasPrediction: true
        }
      ],
      predictions: [
        {
          question: "In the list [5, 10, 15], what is the value at index 1?",
          correctAnswer: "10",
          options: ["5", "10", "15", "1"],
          explanation: "Index 0 = 5, Index 1 = 10, Index 2 = 15. So index 1 gives us 10!"
        }
      ]
    },
    starterCode: `def sum_array(arr):
    # Initialize your sum variable
    total = 0
    
    # Loop through each element and add to total
    # YOUR CODE HERE
    for num in arr:
        total = total + num
    
    return total

# Test
print(sum_array([1, 2, 3, 4, 5]))`,
    lockedCode: `def sum_array(arr):
    # Initialize your sum variable
    total = 0`,
    solutionCode: `def sum_array(arr):
    total = 0
    for num in arr:
        total += num
    return total`,
    testCases: [
      { input: "[1, 2, 3, 4, 5]", expectedOutput: "15", isHidden: false },
      { input: "[10, 20, 30]", expectedOutput: "60", isHidden: false },
      { input: "[-1, 1, -1, 1]", expectedOutput: "0", isHidden: false },
      { input: "[100]", expectedOutput: "100", isHidden: true },
      { input: "[]", expectedOutput: "0", isHidden: true }
    ],
    hints: [
      { text: "Use a for loop to go through each element", cost: 25 },
      { text: "Add each element to your total variable", cost: 50 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["1 <= len(arr) <= 10^4", "-10^4 <= arr[i] <= 10^4"]
    },
    examples: [
      { input: "[1, 2, 3, 4, 5]", output: "15", explanation: "1 + 2 + 3 + 4 + 5 = 15" },
      { input: "[10, 20, 30]", output: "60", explanation: "10 + 20 + 30 = 60" }
    ],
    visualization: {
      type: "array",
      initialState: [1, 2, 3, 4, 5],
      steps: [
        { action: "highlight", state: { index: 0, total: 0 }, explanation: "Start at index 0, total = 0" },
        { action: "add", state: { index: 0, total: 1 }, explanation: "Add arr[0] = 1 to total. total = 1" },
        { action: "move", state: { index: 1, total: 1 }, explanation: "Move to index 1" },
        { action: "add", state: { index: 1, total: 3 }, explanation: "Add arr[1] = 2 to total. total = 3" },
        { action: "move", state: { index: 2, total: 3 }, explanation: "Move to index 2" },
        { action: "add", state: { index: 2, total: 6 }, explanation: "Add arr[2] = 3 to total. total = 6" },
        { action: "complete", state: { total: 15 }, explanation: "Continue for all elements. Final total = 15" }
      ]
    },
    predictions: [
      { 
        question: "After processing index 2, what will be the total?", 
        correctAnswer: "6",
        options: ["3", "6", "5", "1"],
        explanation: "1 + 2 + 3 = 6",
        step: 3
      }
    ],
    objectives: [
      { description: "Initialize a variable to store the sum", order: 1, hint: "Use total = 0" },
      { description: "Create a loop to traverse the array", order: 2, hint: "Use for num in arr:" },
      { description: "Add each element to the total", order: 3, hint: "total += num" },
      { description: "Return the final sum", order: 4, hint: "return total" }
    ],
    xpReward: 50,
    goldReward: 25,
    firstTimeBonus: 25,
    statsGain: { intelligence: 1, sense: 1 },
    order: 1,
    tags: ["arrays", "traversal", "beginner"]
  },
  {
    title: "Find Maximum Element",
    slug: "find-maximum",
    description: `# Find Maximum Element

The dungeon ahead contains treasures of varying value. Your task is to find the most valuable one.

## Your Task
Given an array of integers, find and return the maximum element.

## Concept Focus
- Array traversal
- Comparison operations
- Tracking state`,
    zone: "arrays",
    difficulty: "easy",
    rank: "E",
    availableInPhases: ["visualization", "guided", "autonomous"],
    starterCode: `def find_max(arr):
    if not arr:
        return None
    
    # Initialize max with first element
    max_val = arr[0]
    
    # YOUR CODE HERE
    
    return max_val

print(find_max([3, 1, 4, 1, 5, 9, 2, 6]))`,
    solutionCode: `def find_max(arr):
    if not arr:
        return None
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val`,
    testCases: [
      { input: "[3, 1, 4, 1, 5, 9, 2, 6]", expectedOutput: "9", isHidden: false },
      { input: "[1, 2, 3, 4, 5]", expectedOutput: "5", isHidden: false },
      { input: "[-5, -2, -8, -1]", expectedOutput: "-1", isHidden: false },
      { input: "[42]", expectedOutput: "42", isHidden: true },
      { input: "[7, 7, 7]", expectedOutput: "7", isHidden: true }
    ],
    hints: [
      { text: "Compare each element with your current maximum", cost: 30 },
      { text: "If an element is larger, update your maximum", cost: 50 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["1 <= len(arr) <= 10^5", "-10^9 <= arr[i] <= 10^9"]
    },
    examples: [
      { input: "[3, 1, 4, 1, 5, 9, 2, 6]", output: "9", explanation: "9 is the largest element" }
    ],
    visualization: {
      type: "array",
      initialState: [3, 1, 4, 1, 5, 9, 2, 6],
      steps: [
        { action: "init", state: { index: 0, maxVal: 3 }, explanation: "Initialize max_val = arr[0] = 3" },
        { action: "compare", state: { index: 1, maxVal: 3, comparing: 1 }, explanation: "Compare 1 with 3. 1 < 3, keep max_val = 3" },
        { action: "compare", state: { index: 2, maxVal: 4, comparing: 4 }, explanation: "Compare 4 with 3. 4 > 3, update max_val = 4" },
        { action: "compare", state: { index: 5, maxVal: 9, comparing: 9 }, explanation: "Compare 9 with 5. 9 > 5, update max_val = 9" },
        { action: "complete", state: { maxVal: 9 }, explanation: "Final maximum = 9" }
      ]
    },
    predictions: [
      { 
        question: "After checking index 2 (value 4), what is max_val?", 
        correctAnswer: "4",
        options: ["3", "4", "1", "0"],
        explanation: "4 > 3, so max_val updates to 4",
        step: 2
      }
    ],
    objectives: [
      { description: "Handle edge case of empty array", order: 1 },
      { description: "Initialize max with first element", order: 2 },
      { description: "Loop through remaining elements", order: 3 },
      { description: "Update max when finding larger element", order: 4 }
    ],
    xpReward: 75,
    goldReward: 35,
    firstTimeBonus: 30,
    statsGain: { intelligence: 1, strength: 1 },
    order: 2,
    tags: ["arrays", "traversal", "comparison"]
  },
  {
    title: "Two Sum",
    slug: "two-sum",
    description: `# Two Sum

A classic problem that tests your understanding of array manipulation and optimization.

## Your Task
Given an array of integers and a target sum, return the indices of two numbers that add up to the target.

You may assume each input has exactly one solution.

## Concept Focus
- Nested loops vs Hash maps
- Time complexity optimization`,
    zone: "arrays",
    difficulty: "medium",
    rank: "E",
    availableInPhases: ["guided", "autonomous"],
    starterCode: `def two_sum(nums, target):
    # Method 1: Brute force (O(n^2))
    # Method 2: Hash map (O(n)) - Try this!
    
    # YOUR CODE HERE
    
    pass

print(two_sum([2, 7, 11, 15], 9))`,
    solutionCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    testCases: [
      { input: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]", isHidden: false },
      { input: "[3, 2, 4], 6", expectedOutput: "[1, 2]", isHidden: false },
      { input: "[3, 3], 6", expectedOutput: "[0, 1]", isHidden: false },
      { input: "[1, 5, 3, 7, 2], 9", expectedOutput: "[1, 3]", isHidden: true }
    ],
    hints: [
      { text: "For each number, you need to find if (target - number) exists", cost: 40 },
      { text: "A dictionary can help you store numbers you've seen", cost: 60 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["2 <= len(nums) <= 10^4", "Each input has exactly one solution"]
    },
    examples: [
      { input: "[2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" }
    ],
    visualization: {
      type: "array",
      initialState: { nums: [2, 7, 11, 15], target: 9, hashMap: {} },
      steps: [
        { action: "check", state: { index: 0, num: 2, complement: 7, found: false, hashMap: {} }, explanation: "Check if 9-2=7 exists in map. No. Add 2 to map." },
        { action: "add", state: { index: 0, hashMap: {2: 0} }, explanation: "Map: {2: 0}" },
        { action: "check", state: { index: 1, num: 7, complement: 2, found: true, hashMap: {2: 0} }, explanation: "Check if 9-7=2 exists in map. YES! Return [0, 1]" }
      ]
    },
    predictions: [
      { 
        question: "When processing 7, what complement are we looking for?", 
        correctAnswer: "2",
        options: ["7", "2", "9", "16"],
        explanation: "target - num = 9 - 7 = 2",
        step: 1
      }
    ],
    objectives: [
      { description: "Create a hash map to store seen numbers", order: 1 },
      { description: "Iterate through the array", order: 2 },
      { description: "Calculate complement (target - current)", order: 3 },
      { description: "Check if complement exists in map", order: 4 },
      { description: "Return indices or add to map", order: 5 }
    ],
    xpReward: 150,
    goldReward: 75,
    firstTimeBonus: 50,
    statsGain: { intelligence: 2, agility: 1 },
    order: 3,
    tags: ["arrays", "hash-map", "optimization"]
  },
  {
    title: "Reverse Array",
    slug: "reverse-array",
    description: `# Reverse Array

The dungeon's path has been inverted! You must learn to reverse your approach.

## Your Task
Given an array, reverse it **in-place** without using extra space.

## Concept Focus
- Two-pointer technique
- In-place modification`,
    zone: "arrays",
    difficulty: "easy",
    rank: "E",
    availableInPhases: ["visualization", "guided", "autonomous"],
    starterCode: `def reverse_array(arr):
    left = 0
    right = len(arr) - 1
    
    # YOUR CODE HERE - swap elements using two pointers
    
    return arr

print(reverse_array([1, 2, 3, 4, 5]))`,
    solutionCode: `def reverse_array(arr):
    left = 0
    right = len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr`,
    testCases: [
      { input: "[1, 2, 3, 4, 5]", expectedOutput: "[5, 4, 3, 2, 1]", isHidden: false },
      { input: "[1, 2]", expectedOutput: "[2, 1]", isHidden: false },
      { input: "[1]", expectedOutput: "[1]", isHidden: false },
      { input: "[1, 2, 3, 4]", expectedOutput: "[4, 3, 2, 1]", isHidden: true }
    ],
    hints: [
      { text: "Use two pointers - one at start, one at end", cost: 30 },
      { text: "Swap elements and move pointers toward center", cost: 50 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["0 <= len(arr) <= 10^5"]
    },
    examples: [
      { input: "[1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]", explanation: "Reverse the array in-place" }
    ],
    visualization: {
      type: "array",
      initialState: [1, 2, 3, 4, 5],
      steps: [
        { action: "init", state: { left: 0, right: 4, arr: [1, 2, 3, 4, 5] }, explanation: "Initialize pointers: left=0, right=4" },
        { action: "swap", state: { left: 0, right: 4, arr: [5, 2, 3, 4, 1] }, explanation: "Swap arr[0] and arr[4]: 1 ↔ 5" },
        { action: "move", state: { left: 1, right: 3, arr: [5, 2, 3, 4, 1] }, explanation: "Move pointers: left=1, right=3" },
        { action: "swap", state: { left: 1, right: 3, arr: [5, 4, 3, 2, 1] }, explanation: "Swap arr[1] and arr[3]: 2 ↔ 4" },
        { action: "complete", state: { arr: [5, 4, 3, 2, 1] }, explanation: "Pointers meet at center. Done!" }
      ]
    },
    predictions: [
      { 
        question: "After first swap, what's at index 0?", 
        correctAnswer: "5",
        options: ["1", "5", "2", "4"],
        explanation: "arr[0] and arr[4] are swapped, so arr[0] = 5",
        step: 1
      }
    ],
    objectives: [
      { description: "Initialize left and right pointers", order: 1 },
      { description: "Create loop while left < right", order: 2 },
      { description: "Swap elements at left and right", order: 3 },
      { description: "Move pointers toward center", order: 4 }
    ],
    xpReward: 75,
    goldReward: 35,
    firstTimeBonus: 30,
    statsGain: { agility: 2 },
    order: 4,
    tags: ["arrays", "two-pointers", "in-place"]
  },
  {
    title: "Array Guardian",
    slug: "array-guardian-boss",
    description: `# ⚔️ BOSS BATTLE: The Array Guardian

The Array Guardian blocks your path to the next zone. Defeat it by solving this challenge!

## Your Task
Given an array and a number k, rotate the array to the right by k positions.

This boss tests your mastery of array manipulation!`,
    zone: "arrays",
    difficulty: "boss",
    rank: "E",
    availableInPhases: ["autonomous"],
    starterCode: `def rotate_array(nums, k):
    # Handle edge cases
    # Implement rotation
    
    # YOUR CODE HERE
    
    return nums

print(rotate_array([1,2,3,4,5,6,7], 3))`,
    solutionCode: `def rotate_array(nums, k):
    n = len(nums)
    k = k % n
    
    def reverse(start, end):
        while start < end:
            nums[start], nums[end] = nums[end], nums[start]
            start += 1
            end -= 1
    
    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
    return nums`,
    testCases: [
      { input: "[1,2,3,4,5,6,7], 3", expectedOutput: "[5,6,7,1,2,3,4]", isHidden: false },
      { input: "[-1,-100,3,99], 2", expectedOutput: "[3,99,-1,-100]", isHidden: false },
      { input: "[1,2,3], 4", expectedOutput: "[3,1,2]", isHidden: true },
      { input: "[1], 0", expectedOutput: "[1]", isHidden: true }
    ],
    hints: [
      { text: "k can be larger than array length - use modulo", cost: 50 },
      { text: "Try reversing parts of the array", cost: 75 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["1 <= len(nums) <= 10^5", "0 <= k <= 10^5"]
    },
    examples: [
      { input: "[1,2,3,4,5,6,7], k=3", output: "[5,6,7,1,2,3,4]", explanation: "Rotate right 3 times" }
    ],
    visualization: { type: "none" },
    predictions: [],
    objectives: [],
    xpReward: 300,
    goldReward: 150,
    firstTimeBonus: 100,
    statsGain: { strength: 3, intelligence: 2, agility: 2 },
    order: 10,
    isBossBattle: true,
    tags: ["arrays", "boss", "rotation"]
  },

  // ==================== STACKS ZONE ====================
  {
    title: "Stack Initialization",
    slug: "stack-init",
    description: `# Stack Initialization

Welcome to the Stack Zone, Hunter. A stack is a Last-In-First-Out (LIFO) data structure.

Think of it like a stack of plates - you can only add or remove from the top.

## Your Task
Implement a basic stack with push, pop, and peek operations.

## Concept Focus
- LIFO principle
- Stack operations`,
    zone: "stacks",
    difficulty: "tutorial",
    rank: "D",
    availableInPhases: ["visualization", "guided", "autonomous"],
    starterCode: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        # Add item to top
        # YOUR CODE HERE
        pass
    
    def pop(self):
        # Remove and return top item
        # YOUR CODE HERE
        pass
    
    def peek(self):
        # Return top item without removing
        # YOUR CODE HERE
        pass
    
    def is_empty(self):
        return len(self.items) == 0

# Test
s = Stack()
s.push(1)
s.push(2)
s.push(3)
print(s.pop())  # Should print 3
print(s.peek()) # Should print 2`,
    solutionCode: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None
    
    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None
    
    def is_empty(self):
        return len(self.items) == 0`,
    testCases: [
      { input: "push 1, push 2, pop", expectedOutput: "2", isHidden: false },
      { input: "push 5, peek", expectedOutput: "5", isHidden: false },
      { input: "push 1, push 2, push 3, pop, pop", expectedOutput: "2", isHidden: true }
    ],
    hints: [
      { text: "Use list.append() for push", cost: 25 },
      { text: "Use list.pop() for pop, items[-1] for peek", cost: 50 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["All operations are valid"]
    },
    examples: [
      { input: "push(1), push(2), pop()", output: "2", explanation: "LIFO - last pushed is first popped" }
    ],
    visualization: {
      type: "stack",
      initialState: [],
      steps: [
        { action: "push", state: [1], explanation: "Push 1 onto stack. Stack: [1]" },
        { action: "push", state: [1, 2], explanation: "Push 2 onto stack. Stack: [1, 2]" },
        { action: "push", state: [1, 2, 3], explanation: "Push 3 onto stack. Stack: [1, 2, 3]" },
        { action: "pop", state: [1, 2], explanation: "Pop returns 3. Stack: [1, 2]" },
        { action: "peek", state: [1, 2], explanation: "Peek returns 2 (doesn't remove). Stack: [1, 2]" }
      ]
    },
    predictions: [
      { 
        question: "After push(1), push(2), push(3), pop() - what's on top?", 
        correctAnswer: "2",
        options: ["1", "2", "3", "empty"],
        explanation: "3 was popped, so 2 is now on top",
        step: 4
      }
    ],
    objectives: [
      { description: "Implement push using append", order: 1 },
      { description: "Implement pop using list.pop()", order: 2 },
      { description: "Implement peek using index -1", order: 3 },
      { description: "Add empty checks for safety", order: 4 }
    ],
    xpReward: 100,
    goldReward: 50,
    firstTimeBonus: 40,
    statsGain: { intelligence: 2 },
    order: 1,
    tags: ["stacks", "data-structures", "beginner"]
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    description: `# Valid Parentheses

The dungeon's door is locked with a bracket puzzle. You must validate the sequence!

## Your Task
Given a string containing just '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

A string is valid if:
- Open brackets are closed by the same type
- Open brackets are closed in correct order

## Concept Focus
- Stack for matching pairs
- Character mapping`,
    zone: "stacks",
    difficulty: "medium",
    rank: "D",
    availableInPhases: ["guided", "autonomous"],
    starterCode: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    # YOUR CODE HERE
    
    return len(stack) == 0

print(is_valid("()[]{}"))  # True
print(is_valid("([)]"))    # False`,
    solutionCode: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
        else:
            stack.append(char)
    
    return len(stack) == 0`,
    testCases: [
      { input: '"()"', expectedOutput: "True", isHidden: false },
      { input: '"()[]{}"', expectedOutput: "True", isHidden: false },
      { input: '"(]"', expectedOutput: "False", isHidden: false },
      { input: '"([)]"', expectedOutput: "False", isHidden: false },
      { input: '"{[]}"', expectedOutput: "True", isHidden: true }
    ],
    hints: [
      { text: "Push opening brackets onto stack", cost: 40 },
      { text: "When you see a closing bracket, check if it matches the top of stack", cost: 60 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["1 <= len(s) <= 10^4", "s consists of parentheses only"]
    },
    examples: [
      { input: '"()[]{}"', output: "True", explanation: "All brackets match correctly" },
      { input: '"([)]"', output: "False", explanation: "Brackets close in wrong order" }
    ],
    visualization: {
      type: "stack",
      initialState: { string: "([{}])", stack: [] },
      steps: [
        { action: "push", state: { char: "(", stack: ["("] }, explanation: "See '(' - push to stack" },
        { action: "push", state: { char: "[", stack: ["(", "["] }, explanation: "See '[' - push to stack" },
        { action: "push", state: { char: "{", stack: ["(", "[", "{"] }, explanation: "See '{' - push to stack" },
        { action: "match", state: { char: "}", stack: ["(", "["] }, explanation: "See '}' - matches '{' - pop!" },
        { action: "match", state: { char: "]", stack: ["("] }, explanation: "See ']' - matches '[' - pop!" },
        { action: "match", state: { char: ")", stack: [] }, explanation: "See ')' - matches '(' - pop!" },
        { action: "complete", state: { stack: [], valid: true }, explanation: "Stack empty = Valid!" }
      ]
    },
    predictions: [
      { 
        question: "For '([)]', when we see ']', what's on top of stack?", 
        correctAnswer: "(",
        options: ["(", "[", "]", "empty"],
        explanation: "Stack is ['(', '['], so top is '['... wait, let me recalculate. '(' pushed, '[' pushed, ')' needs '(' but top is '[' - mismatch!",
        step: 3
      }
    ],
    objectives: [
      { description: "Create mapping of closing to opening brackets", order: 1 },
      { description: "Iterate through each character", order: 2 },
      { description: "Push opening brackets to stack", order: 3 },
      { description: "For closing brackets, check and pop matching opener", order: 4 },
      { description: "Return True if stack is empty at end", order: 5 }
    ],
    xpReward: 175,
    goldReward: 85,
    firstTimeBonus: 60,
    statsGain: { intelligence: 2, sense: 1 },
    order: 2,
    tags: ["stacks", "strings", "matching"]
  },

  // ==================== BINARY TREES ZONE ====================
  {
    title: "Tree Node Basics",
    slug: "tree-node-basics",
    description: `# Tree Node Basics

You've entered the Binary Tree Forest. Here, data grows on trees!

A binary tree node has:
- A value
- A left child (or None)
- A right child (or None)

## Your Task
Create a TreeNode class and build a simple tree.

## Concept Focus
- Node structure
- Tree construction`,
    zone: "binary-trees",
    difficulty: "tutorial",
    rank: "D",
    availableInPhases: ["visualization", "guided", "autonomous"],
    starterCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        # YOUR CODE HERE
        pass

# Build this tree:
#       1
#      / \\
#     2   3
#    / \\
#   4   5

root = TreeNode(1)
# Build the rest...

# Verify by printing
def print_tree(node, level=0):
    if node:
        print(" " * level + str(node.val))
        print_tree(node.left, level + 2)
        print_tree(node.right, level + 2)

print_tree(root)`,
    solutionCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)`,
    testCases: [
      { input: "root.val", expectedOutput: "1", isHidden: false },
      { input: "root.left.val", expectedOutput: "2", isHidden: false },
      { input: "root.left.left.val", expectedOutput: "4", isHidden: true }
    ],
    hints: [
      { text: "Store val, left, and right as instance attributes", cost: 25 },
      { text: "Use self.val = val, etc.", cost: 50 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["Tree has at most 100 nodes"]
    },
    examples: [
      { input: "TreeNode(1)", output: "Node with val=1, left=None, right=None", explanation: "Basic node creation" }
    ],
    visualization: {
      type: "tree",
      initialState: null,
      steps: [
        { action: "create", state: { nodes: [{val: 1, left: null, right: null}] }, explanation: "Create root node with value 1" },
        { action: "attach", state: { nodes: [{val: 1, left: 2, right: null}] }, explanation: "Attach left child with value 2" },
        { action: "attach", state: { nodes: [{val: 1, left: 2, right: 3}] }, explanation: "Attach right child with value 3" }
      ]
    },
    predictions: [],
    objectives: [
      { description: "Define __init__ with val, left, right parameters", order: 1 },
      { description: "Store val as self.val", order: 2 },
      { description: "Store left as self.left", order: 3 },
      { description: "Store right as self.right", order: 4 }
    ],
    xpReward: 75,
    goldReward: 40,
    firstTimeBonus: 30,
    statsGain: { intelligence: 1, sense: 1 },
    order: 1,
    tags: ["binary-trees", "nodes", "beginner"]
  },
  {
    title: "Invert Binary Tree",
    slug: "invert-binary-tree",
    description: `# Invert Binary Tree

The famous problem that's stumped many engineers!

## Your Task
Given the root of a binary tree, invert the tree and return its root.

Inverting means swapping left and right children at every node.

## Concept Focus
- Tree traversal
- Recursion
- Node manipulation`,
    zone: "binary-trees",
    difficulty: "medium",
    rank: "D",
    availableInPhases: ["guided", "autonomous"],
    starterCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def invert_tree(root):
    # Base case
    # YOUR CODE HERE
    
    # Swap children
    # YOUR CODE HERE
    
    # Recurse
    # YOUR CODE HERE
    
    return root`,
    solutionCode: `def invert_tree(root):
    if not root:
        return None
    
    root.left, root.right = root.right, root.left
    
    invert_tree(root.left)
    invert_tree(root.right)
    
    return root`,
    testCases: [
      { input: "[4,2,7,1,3,6,9]", expectedOutput: "[4,7,2,9,6,3,1]", isHidden: false },
      { input: "[2,1,3]", expectedOutput: "[2,3,1]", isHidden: false },
      { input: "[]", expectedOutput: "[]", isHidden: true }
    ],
    hints: [
      { text: "Handle the base case when root is None", cost: 40 },
      { text: "Swap root.left and root.right, then recurse on both", cost: 60 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["0 <= Number of nodes <= 100"]
    },
    examples: [
      { input: "[4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]", explanation: "Mirror the tree horizontally" }
    ],
    visualization: {
      type: "tree",
      initialState: { nodes: [4, 2, 7, 1, 3, 6, 9] },
      steps: [
        { action: "visit", state: { current: 4 }, explanation: "Visit root (4)" },
        { action: "swap", state: { current: 4, swapping: [2, 7] }, explanation: "Swap children: 2 ↔ 7" },
        { action: "recurse", state: { current: 7 }, explanation: "Recurse on new left (was right): 7" },
        { action: "swap", state: { current: 7, swapping: [6, 9] }, explanation: "Swap 7's children: 6 ↔ 9" },
        { action: "complete", state: { tree: [4, 7, 2, 9, 6, 3, 1] }, explanation: "Tree inverted!" }
      ]
    },
    predictions: [
      { 
        question: "After inverting, what is the left child of root?", 
        correctAnswer: "7",
        options: ["2", "7", "4", "1"],
        explanation: "Original right child (7) becomes left child",
        step: 2
      }
    ],
    objectives: [
      { description: "Add base case for None root", order: 1 },
      { description: "Swap left and right children", order: 2 },
      { description: "Recursively invert left subtree", order: 3 },
      { description: "Recursively invert right subtree", order: 4 },
      { description: "Return the root", order: 5 }
    ],
    xpReward: 200,
    goldReward: 100,
    firstTimeBonus: 75,
    statsGain: { intelligence: 3, sense: 1 },
    order: 3,
    tags: ["binary-trees", "recursion", "classic"]
  },

  // ==================== RECURSION ZONE ====================
  {
    title: "Recursion Awakening",
    slug: "recursion-awakening",
    description: `# Recursion Awakening

To truly become powerful, you must master calling upon yourself!

Recursion is when a function calls itself with a smaller problem until reaching a base case.

## Your Task
Calculate factorial using recursion.

n! = n × (n-1) × (n-2) × ... × 1

## Concept Focus
- Base case identification
- Recursive case
- Call stack`,
    zone: "recursion",
    difficulty: "tutorial",
    rank: "D",
    availableInPhases: ["visualization", "guided", "autonomous"],
    starterCode: `def factorial(n):
    # Base case: factorial of 0 or 1 is 1
    # YOUR CODE HERE
    
    # Recursive case: n * factorial(n-1)
    # YOUR CODE HERE
    
    pass

print(factorial(5))  # Should print 120`,
    solutionCode: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
    testCases: [
      { input: "5", expectedOutput: "120", isHidden: false },
      { input: "0", expectedOutput: "1", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: false },
      { input: "10", expectedOutput: "3628800", isHidden: true }
    ],
    hints: [
      { text: "Base case: if n <= 1, return 1", cost: 25 },
      { text: "Recursive case: return n * factorial(n-1)", cost: 50 }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 128,
      inputConstraints: ["0 <= n <= 12"]
    },
    examples: [
      { input: "5", output: "120", explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120" }
    ],
    visualization: {
      type: "recursion-tree",
      initialState: { n: 5 },
      steps: [
        { action: "call", state: { n: 5, stack: ["factorial(5)"] }, explanation: "Call factorial(5)" },
        { action: "call", state: { n: 4, stack: ["factorial(5)", "factorial(4)"] }, explanation: "5 * factorial(4) - call factorial(4)" },
        { action: "call", state: { n: 3, stack: ["factorial(5)", "factorial(4)", "factorial(3)"] }, explanation: "4 * factorial(3) - call factorial(3)" },
        { action: "call", state: { n: 2, stack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)"] }, explanation: "Continue..." },
        { action: "base", state: { n: 1, return: 1 }, explanation: "Base case! factorial(1) = 1" },
        { action: "return", state: { computing: "2*1=2" }, explanation: "factorial(2) = 2 * 1 = 2" },
        { action: "return", state: { computing: "3*2=6" }, explanation: "factorial(3) = 3 * 2 = 6" },
        { action: "return", state: { computing: "4*6=24" }, explanation: "factorial(4) = 4 * 6 = 24" },
        { action: "return", state: { computing: "5*24=120" }, explanation: "factorial(5) = 5 * 24 = 120" }
      ]
    },
    predictions: [
      { 
        question: "What does factorial(3) return?", 
        correctAnswer: "6",
        options: ["3", "6", "9", "1"],
        explanation: "3! = 3 × 2 × 1 = 6",
        step: 2
      }
    ],
    objectives: [
      { description: "Identify the base case (n <= 1)", order: 1 },
      { description: "Return 1 for base case", order: 2 },
      { description: "Write recursive case: n * factorial(n-1)", order: 3 }
    ],
    xpReward: 100,
    goldReward: 50,
    firstTimeBonus: 40,
    statsGain: { intelligence: 2, sense: 1 },
    order: 1,
    tags: ["recursion", "math", "beginner"]
  },
  {
    title: "Fibonacci Sequence",
    slug: "fibonacci",
    description: `# Fibonacci Sequence

The sacred sequence of the ancients!

F(0) = 0, F(1) = 1
F(n) = F(n-1) + F(n-2) for n > 1

## Your Task
Calculate the nth Fibonacci number.

## Concept Focus
- Multiple recursive calls
- Overlapping subproblems`,
    zone: "recursion",
    difficulty: "easy",
    rank: "D",
    availableInPhases: ["visualization", "guided", "autonomous"],
    starterCode: `def fibonacci(n):
    # Base cases
    # YOUR CODE HERE
    
    # Recursive case
    # YOUR CODE HERE
    
    pass

print(fibonacci(10))  # Should print 55`,
    solutionCode: `def fibonacci(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)`,
    testCases: [
      { input: "10", expectedOutput: "55", isHidden: false },
      { input: "0", expectedOutput: "0", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: false },
      { input: "15", expectedOutput: "610", isHidden: true }
    ],
    hints: [
      { text: "You need TWO base cases: n=0 returns 0, n=1 returns 1", cost: 30 },
      { text: "Recursive: fibonacci(n-1) + fibonacci(n-2)", cost: 50 }
    ],
    constraints: {
      timeLimit: 5000,
      memoryLimit: 128,
      inputConstraints: ["0 <= n <= 20"]
    },
    examples: [
      { input: "10", output: "55", explanation: "F(10) = 55 (0,1,1,2,3,5,8,13,21,34,55)" }
    ],
    visualization: {
      type: "recursion-tree",
      initialState: { n: 5 },
      steps: [
        { action: "call", state: { call: "fib(5)" }, explanation: "Calculate fib(5)" },
        { action: "split", state: { left: "fib(4)", right: "fib(3)" }, explanation: "fib(5) = fib(4) + fib(3)" },
        { action: "expand", state: { tree: "showing recursive tree" }, explanation: "Each call splits into two more..." },
        { action: "base", state: { reached: ["fib(0)=0", "fib(1)=1"] }, explanation: "Base cases reached" },
        { action: "complete", state: { result: 5 }, explanation: "fib(5) = 5" }
      ]
    },
    predictions: [
      { 
        question: "What is fib(4)?", 
        correctAnswer: "3",
        options: ["2", "3", "4", "5"],
        explanation: "fib(4) = fib(3) + fib(2) = 2 + 1 = 3",
        step: 2
      }
    ],
    objectives: [
      { description: "Handle base case n=0 (return 0)", order: 1 },
      { description: "Handle base case n=1 (return 1)", order: 2 },
      { description: "Return fibonacci(n-1) + fibonacci(n-2)", order: 3 }
    ],
    xpReward: 125,
    goldReward: 60,
    firstTimeBonus: 50,
    statsGain: { intelligence: 2, endurance: 1 },
    order: 2,
    tags: ["recursion", "math", "classic"]
  }
];

async function seedProblems() {
  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('[SYSTEM] Connected to database');
    }

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('[SYSTEM] Cleared existing problems');

    // Insert new problems
    await Problem.insertMany(problems);
    console.log(`[SYSTEM] Seeded ${problems.length} problems`);

    // Log summary
    const zones = ['arrays', 'stacks', 'binary-trees', 'recursion'];
    for (const zone of zones) {
      const count = problems.filter(p => p.zone === zone).length;
      console.log(`  - ${zone}: ${count} problems`);
    }

    return true;
  } catch (error) {
    console.error('[ERROR] Seeding failed:', error);
    return false;
  }
}

// Run directly if called as script
if (require.main === module) {
  seedProblems().then(() => process.exit(0));
}

module.exports = seedProblems;
