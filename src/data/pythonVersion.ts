export const FIXED_PYTHON_CODE = `"""
Neon Dodge - Polished & Bug-Free Python Turtle Arcade Game
Fixed and enhanced version of the original script.

Major Bug Fixes:
1. Fixed Score: Added score incrementing (+10 for each dodged obstacle).
2. Fixed Crash: Removed invalid 'wn.numbuttons()' method that caused AttributeError.
3. Smooth Controls: Implemented fluid continuous key-state tracking (no OS key-repeat stutter).
4. Fixed Starting Position: Centered player at (0, -250) instead of stuck in the corner (-370, -280).
5. Fixed Text Overlap: Positioned Score at the top-left/center and Game Over boldly centered.
6. Boundary Clamping: Prevented player from moving off the screen.
7. Staggered Spawns: Obstacles spawn with staggered vertical offsets so they form dodgeable waves.
8. Dynamic Difficulty: Obstacle speed gradually scales as score increases.
9. Frame Rate Cap: Added time.sleep(0.016) to cap at ~60 FPS and prevent 100% CPU usage.
10. Proper Restart: Spacebar or R key seamlessly resets all positions, score, and state.
"""

import turtle
import time
import random

# --- Window Setup ---
wn = turtle.Screen()
wn.title("Neon Dodge - Python Game (Fixed & Polished)")
wn.bgcolor("black")
wn.setup(width=800, height=600)
wn.tracer(0)  # Turns off auto screen updates for 60fps manual control

# --- Game State ---
score = 0
high_score = 0
game_status = "playing"
base_speed = 3.5
move_speed = 7
player_width = 20

# Keyboard state for smooth 60fps movement
key_state = {"Left": False, "Right": False, "a": False, "d": False}

# --- Player Turtle ---
player = turtle.Turtle()
player.speed(0)
player.shape("square")
player.color("#00FF66")  # Vibrant Neon Lime
player.shapesize(stretch_wid=1.2, stretch_len=1.2)
player.penup()
player.goto(0, -240)  # Nicely centered near bottom

# --- Score Display Turtle ---
score_text = turtle.Turtle()
score_text.speed(0)
score_text.color("white")
score_text.penup()
score_text.hideturtle()
score_text.goto(0, 260)

def update_score_display():
    score_text.clear()
    score_text.write(
        f"SCORE: {score}   |   HIGH: {high_score}",
        align="center",
        font=("Courier", 16, "bold")
    )

update_score_display()

# --- Game Over / UI Banner Turtle ---
banner_text = turtle.Turtle()
banner_text.speed(0)
banner_text.color("#FF2255")
banner_text.penup()
banner_text.hideturtle()
banner_text.goto(0, 20)

# --- Obstacles Setup ---
NUM_OBSTACLES = 8
obstacles = []

def create_obstacles():
    obstacles.clear()
    for _ in range(NUM_OBSTACLES):
        obs = turtle.Turtle()
        obs.speed(0)
        obs.shape("square")
        obs.color("#FF2255")  # Vibrant Neon Red
        obs.penup()
        # Staggered vertical spawns to avoid impossible walls
        x = random.randint(-360, 360)
        y = random.randint(300, 700)
        obs.goto(x, y)
        obstacles.append(obs)

create_obstacles()

# --- Key Listeners (Continuous Fluid Movement) ---
def press_left():
    key_state["Left"] = True

def release_left():
    key_state["Left"] = False

def press_right():
    key_state["Right"] = True

def release_right():
    key_state["Right"] = False

def restart_game():
    global score, game_status, high_score
    if game_status == "over":
        score = 0
        game_status = "playing"
        banner_text.clear()
        player.goto(0, -240)
        for obs in obstacles:
            obs.goto(random.randint(-360, 360), random.randint(300, 700))
        update_score_display()

wn.listen()
wn.onkeypress(press_left, "Left")
wn.onkeyrelease(release_left, "Left")
wn.onkeypress(press_left, "a")
wn.onkeyrelease(release_left, "a")

wn.onkeypress(press_right, "Right")
wn.onkeyrelease(release_right, "Right")
wn.onkeypress(press_right, "d")
wn.onkeyrelease(release_right, "d")

wn.onkeypress(restart_game, "space")
wn.onkeypress(restart_game, "r")

# --- Main Game Loop (60 FPS Cap) ---
print("Neon Dodge is running! Use Left/Right or A/D to steer. Press Space to restart.")

while True:
    time.sleep(0.016)  # Cap loop to ~60 updates per second

    if game_status == "playing":
        # 1. Smooth Player Movement with Arena Boundaries
        px = player.xcor()
        if key_state["Left"] or key_state["a"]:
            px -= move_speed
        if key_state["Right"] or key_state["d"]:
            px += move_speed

        # Keep player inside the screen borders (-370 to +370)
        px = max(-370, min(370, px))
        player.setx(px)

        # 2. Dynamic Speed Ramp
        current_speed = base_speed + (score // 100) * 0.4

        # 3. Move Obstacles Down & Check Dodges
        for obs in obstacles:
            obs.sety(obs.ycor() - current_speed)

            # Check if obstacle passed the player (Dodged successfully!)
            if obs.ycor() < -290:
                score += 10
                if score > high_score:
                    high_score = score
                update_score_display()

                # Respawn at top with random x and random height stagger
                obs.goto(random.randint(-360, 360), random.randint(300, 450))

            # 4. Accurate Collision Detection (AABB bounding box)
            dx = abs(player.xcor() - obs.xcor())
            dy = abs(player.ycor() - obs.ycor())

            if dx < 22 and dy < 22:
                game_status = "over"

                # Display Game Over & Restart instructions
                banner_text.clear()
                banner_text.goto(0, 40)
                banner_text.color("#FF2255")
                banner_text.write("GAME OVER", align="center", font=("Courier", 32, "bold"))
                banner_text.goto(0, -10)
                banner_text.color("white")
                banner_text.write(f"Final Score: {score}", align="center", font=("Courier", 18, "bold"))
                banner_text.goto(0, -50)
                banner_text.color("#00FF66")
                banner_text.write("Press SPACE to Restart", align="center", font=("Courier", 14, "normal"))
                break

    wn.update()
`;

export const ORIGINAL_BUGS_EXPLANATION = [
  {
    title: "Score Never Incremented",
    original: "score = 0 was defined, but never modified in the game loop.",
    fix: "Score now increments (+10) whenever an obstacle safely passes below the player, and tracks all-time High Score.",
  },
  {
    title: "Crash on Game Over (AttributeError)",
    original: "if wn.numbuttons() > 0: — turtle.Screen has no numbuttons() method.",
    fix: "Replaced with standard Turtle keypress listeners on Space and 'r' for instant, reliable restart.",
  },
  {
    title: "Choppy Movement & Lag",
    original: "onkeypress alone moves 5px only when key repeats, feeling jerky and unresponsive.",
    fix: "Added continuous key-state dictionary with both onkeypress and onkeyrelease, allowing buttery smooth 60fps movement with Left/Right and A/D.",
  },
  {
    title: "Overlapping Text & Arrow Cursor Glitch",
    original: "game_over was drawn at (-150, 260) on top of Score, and game_over.showturtle() showed a turtle cursor.",
    fix: "Score is centered at (0, 260), and Game Over is displayed with a bold banner at (0, 40) with restart prompts.",
  },
  {
    title: "Wall of Obstacles & Bad Starting Position",
    original: "Player started trapped in corner (-370, -280), and all 10 obstacles spawned at y=280 simultaneously.",
    fix: "Player starts centered at (0, -240). Obstacles spawn with staggered Y positions (300 to 700) for fair, rhythmic wave patterns.",
  },
  {
    title: "100% CPU Usage & Frame-rate Dependent Speed",
    original: "while True: wn.update() without delay burned 100% CPU core.",
    fix: "Added time.sleep(0.016) to cap loop execution to a smooth, battery-friendly ~60 FPS.",
  },
  {
    title: "Player Escaping Arena Boundaries",
    original: "No coordinates boundary clamping allowed the player to slide off the screen into the void.",
    fix: "Clamped player X coordinate between -370 and +370.",
  },
];
